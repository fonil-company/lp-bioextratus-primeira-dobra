import { isAttributionValue, isCampaignKey, type TrackingData } from "./tracking.ts";

type LeadInput = {
  nome: string;
  whatsapp: string;
  cnpj: string;
  tracking?: TrackingData;
};

export function buildLeadPayloads(data: LeadInput) {
  const contact = {
    phone: data.whatsapp.replace(/\D/g, ""),
    name: data.nome.trim(),
    document: data.cnpj.replace(/\D/g, ""),
    pipeline_stage: "Qualificado",
  };
  const attribution: Record<string, string> = {};
  for (const [key, value] of Object.entries(data.tracking || {})) {
    if ((isCampaignKey(key) || key === "fbc" || key === "fbp") && isAttributionValue(key, value)) {
      attribution[key] = value;
    }
  }
  const sourceUrl = data.tracking?.event_source_url;
  if (sourceUrl) {
    try {
      if (["http:", "https:"].includes(new URL(sourceUrl).protocol)) {
        attribution.event_source_url = sourceUrl;
      }
    } catch { /* Do not substitute the server URL or Referer. */ }
  }
  return {
    crm: { ...contact, ...attribution },
    // Preserve the existing Supabase contract, including its internal landing_url.
    supabase: { ...contact, ...data.tracking },
  };
}

export async function deliverLead(
  data: LeadInput,
  destinations: { crm: string; supabase: string },
) {
  const payloads = buildLeadPayloads(data);
  const post = (url: string, payload: Record<string, unknown>) => fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000),
  });
  const [supabase, crm] = await Promise.allSettled([
    post(destinations.supabase, payloads.supabase),
    post(destinations.crm, payloads.crm),
  ]);
  if (supabase.status !== "fulfilled" || !supabase.value.ok) {
    console.error("Supabase webhook rejected lead submission.");
  }
  const ok = crm.status === "fulfilled" && crm.value.ok;
  if (!ok) console.error("Portal CRM webhook rejected lead submission.");
  return { ok };
}
