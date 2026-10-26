import assert from "node:assert/strict";
import { test } from "node:test";
import { captureCampaign } from "../src/lib/tracking.ts";
import { buildLeadPayloads, deliverLead } from "../src/lib/lead-delivery.server.ts";
import { trackLeadEvent } from "../src/lib/pixel.ts";

const lead = { nome: "  Teste técnico  ", whatsapp: "(11) 99999-9999", cnpj: "01.234.567/0001-89" };
const source = "https://lp.example/?utm_source=ig&utm_medium=paid&utm_campaign=A%20%26%20B&utm_custom=segmento%2F01&gclid=google-123&fbclid=meta-123&gbraid=gb-1&wbraid=wb-1&msclkid=ms-1&ttclid=tt-1&campaign=Campanha&campaign_id=123&adset_id=456&ad_id=789&placement=feed#cadastro";

test("CRM JSON preserves full URL, attribution and contact; Supabase retains internal fields", async (t) => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push({ url, options, payload: JSON.parse(options.body) });
    return new Response("{}", { status: 200 });
  });
  const tracking = {
    ...captureCampaign(source), fbc: "fb.1.123.click", fbp: "fb.1.123.browser",
    landing_url: source, page_url: source, referrer: "https://example.org/",
    _fbc: "rejected", _fbp: "rejected", event_id: "internal-id", notes: "rejected",
  };
  assert.deepEqual(await deliverLead({ ...lead, tracking }, {
    crm: "https://crm.example/lead", supabase: "https://supabase.example/lead",
  }), { ok: true });
  const crm = calls.find(({ url }) => url.includes("crm.example"));
  assert.equal(crm.options.method, "POST");
  assert.equal(crm.options.headers["Content-Type"], "application/json");
  assert.deepEqual(crm.payload, {
    phone: "11999999999", name: "Teste técnico", document: "01234567000189",
    pipeline_stage: "Qualificado", ...captureCampaign(source),
    fbc: "fb.1.123.click", fbp: "fb.1.123.browser",
  });
  const supabase = calls.find(({ url }) => url.includes("supabase.example"));
  assert.equal(supabase.payload.landing_url, source);
  assert.equal(supabase.payload.referrer, tracking.referrer);
  assert.equal(supabase.payload.event_id, "internal-id");
});

test("organic visit adds no invented attribution or optional contact fields", () => {
  const url = "https://lp.example/#cadastro";
  const { crm } = buildLeadPayloads({ ...lead, tracking: captureCampaign(url) });
  assert.deepEqual(crm, {
    phone: "11999999999", name: "Teste técnico", document: "01234567000189",
    pipeline_stage: "Qualificado", event_source_url: url,
  });
});

test("unresolved placeholders, empty values and fake click IDs are omitted", () => {
  const url = "https://lp.example/?fbclid=fbclid&utm_campaign=%7B%7Bcampaign.name%7D%7D&ad_id=%7Badid%7D&utm_term=%20&gclid=gclid&utm_source=ig";
  assert.deepEqual(captureCampaign(url), { utm_source: "ig", event_source_url: url });
  const { crm } = buildLeadPayloads({ ...lead, tracking: {
    utm_campaign: "{{campaign.name}}", gclid: "gclid", fbp: "", event_source_url: "javascript:alert(1)",
  } });
  assert.deepEqual(Object.keys(crm).sort(), ["document", "name", "phone", "pipeline_stage"]);
});

test("custom UTM values are not truncated", () => {
  const value = "segmento-á/".repeat(100);
  const url = `https://lp.example/?utm_audience=${encodeURIComponent(value)}`;
  assert.equal(buildLeadPayloads({ ...lead, tracking: captureCampaign(url) }).crm.utm_audience, value);
});

for (const [label, crmStatus, supabaseStatus, expected] of [
  ["CRM failure with Supabase success", 500, 200, false],
  ["CRM success with Supabase failure", 200, 500, true],
  ["both fail", 500, 500, false],
]) {
  test(label, async (t) => {
    t.mock.method(console, "error", () => {});
    t.mock.method(globalThis, "fetch", async (url) => new Response("{}", {
      status: url.includes("crm.example") ? crmStatus : supabaseStatus,
    }));
    assert.deepEqual(await deliverLead(lead, {
      crm: "https://crm.example/lead", supabase: "https://supabase.example/lead",
    }), { ok: expected });
  });
}

test("CRM network failure never confirms success", async (t) => {
  t.mock.method(console, "error", () => {});
  t.mock.method(globalThis, "fetch", async (url) => {
    if (url.includes("crm.example")) throw new TypeError("Network failure");
    return new Response("{}", { status: 200 });
  });
  assert.deepEqual(await deliverLead(lead, {
    crm: "https://crm.example/lead", supabase: "https://supabase.example/lead",
  }), { ok: false });
});

async function browserTracking(t, { url = source, stored = null, blocked = false } = {}) {
  const savedWindow = globalThis.window;
  const savedDocument = globalThis.document;
  let storage = stored;
  globalThis.window = {
    location: new URL(url),
    sessionStorage: {
      getItem() { if (blocked) throw new Error("blocked"); return storage; },
      setItem(key, value) { if (blocked) throw new Error("blocked"); storage = value; },
    },
  };
  globalThis.document = { cookie: "" };
  t.after(() => {
    if (savedWindow === undefined) delete globalThis.window; else globalThis.window = savedWindow;
    if (savedDocument === undefined) delete globalThis.document; else globalThis.document = savedDocument;
  });
  // Fresh module emulates a page reload while keeping the supplied session.
  return import(`../src/lib/tracking.ts?test=${crypto.randomUUID()}`);
}

test("entry URL survives navigation; late Meta cookies are read at submission", async (t) => {
  const { captureTrackingData } = await browserTracking(t);
  assert.equal(captureTrackingData().event_source_url, source);
  window.location = new URL("https://lp.example/obrigado");
  document.cookie = "other=x; _fbc=fb.1.123.click; _fbp=fb.1.123.browser";
  const result = captureTrackingData();
  assert.equal(result.event_source_url, source);
  assert.equal(result.utm_campaign, "A & B");
  assert.equal(result.fbc, "fb.1.123.click");
  assert.equal(result.fbp, "fb.1.123.browser");
});

test("existing session attribution survives a reload without campaign parameters", async (t) => {
  const { captureTrackingData } = await browserTracking(t, {
    url: "https://lp.example/#cadastro", stored: JSON.stringify({ landing_url: source }),
  });
  assert.equal(captureTrackingData().event_source_url, source);
});

test("a new campaign replaces previous identifiers instead of mixing them", async (t) => {
  const url = "https://lp.example/?utm_source=google&gclid=new-id";
  const { captureTrackingData } = await browserTracking(t, {
    url, stored: JSON.stringify({ ...captureCampaign(source), landing_url: source }),
  });
  assert.deepEqual(captureTrackingData(), {
    utm_source: "google", gclid: "new-id", event_source_url: url, landing_url: url,
  });
});

test("blocked sessionStorage still preserves the entry URL in memory", async (t) => {
  const { captureTrackingData } = await browserTracking(t, { blocked: true });
  captureTrackingData();
  window.location = new URL("https://lp.example/#cadastro");
  assert.equal(captureTrackingData().event_source_url, source);
});

test("Pixel receives the submission eventID", async (t) => {
  await browserTracking(t);
  const calls = [];
  window.fbq = (...args) => calls.push(args);
  trackLeadEvent({ content_name: "Cadastro lojista - Bio Extratus" }, "submission-id");
  assert.deepEqual(calls, [["track", "Lead", {
    content_name: "Cadastro lojista - Bio Extratus",
  }, { eventID: "submission-id" }]]);
  delete window.fbq;
  assert.doesNotThrow(() => trackLeadEvent({}, "submission-id"));
});
