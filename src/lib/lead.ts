import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { TrackingData } from "@/lib/tracking";

export type Lead = {
  nome: string;
  whatsapp: string;
  cnpj: string;
  tracking?: TrackingData;
};

const trackingSchema = z
  .object({
    utm_source: z.string().optional(),
    utm_medium: z.string().optional(),
    utm_campaign: z.string().optional(),
    utm_content: z.string().optional(),
    utm_term: z.string().optional(),
    fbclid: z.string().optional(),
    campaign_id: z.string().optional(),
    adset_id: z.string().optional(),
    ad_id: z.string().optional(),
    fbp: z.string().optional(),
    landing_url: z.string().optional(),
  })
  .optional();

const leadSchema = z.object({
  nome: z.string().min(3),
  whatsapp: z.string().min(10),
  cnpj: z.string().min(14),
  tracking: trackingSchema,
});

export const onlyDigits = (value: string) => value.replace(/\D/g, "");

const BIONATURE_WEBHOOK_URL =
  process.env.BIONATURE_WEBHOOK_URL ||
  "https://mpajmwwwexxnrsyocppb.supabase.co/functions/v1/api-webhook-receiver?token=b1de52b70c814e91a0e7167437c9e4907f5d7ec9e55342358a70c8664083a1ca";
const BIO_NATURE_WEBHOOK_URL =
  process.env.CRM_WEBHOOK_URL ||
  "https://crm.fonilgroup.com.br/api/webhooks/leads/cmqwra13j0003t4mc92b5eobn";

async function postLead(url: string, payload: Record<string, unknown>) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

const submitLeadToCrm = createServerFn({ method: "POST" })
  .validator((input: unknown) => leadSchema.parse(input))
  .handler(async ({ data }) => {
    const payload = {
      phone: onlyDigits(data.whatsapp),
      name: data.nome.trim(),
      document: onlyDigits(data.cnpj),
      pipeline_stage: "Qualificado",
      ...data.tracking,
    };

    const bionatureRequest = BIONATURE_WEBHOOK_URL
      ? postLead(BIONATURE_WEBHOOK_URL, payload)
      : Promise.reject(new Error("BIONATURE_WEBHOOK_URL is not configured."));

    const [bionatureResult, bioNatureResult] = await Promise.allSettled([
      bionatureRequest,
      postLead(BIO_NATURE_WEBHOOK_URL, payload),
    ]);

    const bionatureResponse =
      bionatureResult.status === "fulfilled" ? bionatureResult.value : undefined;
    const bioNatureResponse =
      bioNatureResult.status === "fulfilled" ? bioNatureResult.value : undefined;

    if (!bionatureResponse?.ok) {
      console.error(
        `Bionature webhook rejected lead submission${bionatureResponse ? ` with status ${bionatureResponse.status}` : ""}.`,
      );
    }
    if (!bioNatureResponse?.ok) {
      console.error(
        `Bio Nature webhook rejected lead submission${bioNatureResponse ? ` with status ${bioNatureResponse.status}` : ""}.`,
      );
    }

    return { ok: Boolean(bionatureResponse?.ok || bioNatureResponse?.ok) };
  });

export async function sendLead(lead: Lead): Promise<{ ok: boolean }> {
  try {
    return await submitLeadToCrm({ data: lead });
  } catch (error) {
    console.error("Unable to submit lead to CRM.", error);
    return { ok: false };
  }
}

export function maskCNPJ(value: string) {
  const digits = onlyDigits(value).slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function maskPhone(value: string) {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }
  return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

export function isValidCNPJ(value: string) {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

  const calculateDigit = (length: number) => {
    let sum = 0;
    let position = length - 7;
    for (let index = 0; index < length; index++) {
      sum += Number(cnpj[index]) * position--;
      if (position < 2) position = 9;
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  return calculateDigit(12) === Number(cnpj[12]) && calculateDigit(13) === Number(cnpj[13]);
}

export function isValidPhone(value: string) {
  return onlyDigits(value).length >= 10;
}
