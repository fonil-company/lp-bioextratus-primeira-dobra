import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isCampaignKey, type TrackingData } from "@/lib/tracking";

export type Lead = {
  nome: string;
  whatsapp: string;
  cnpj: string;
  tracking?: TrackingData;
};

const trackingSchema = z.record(z.string().optional()).transform((tracking) =>
  Object.fromEntries(Object.entries(tracking).filter(([key]) =>
    isCampaignKey(key) || ["event_source_url", "landing_url", "fbc", "fbp"].includes(key)
  ))
).optional();

const leadSchema = z.object({
  nome: z.string().trim().min(3),
  whatsapp: z.string().transform((value) => value.replace(/\D/g, "")).pipe(z.string().regex(/^\d{10,11}$/)),
  cnpj: z.string().transform((value) => value.replace(/\D/g, "")).pipe(z.string().regex(/^\d{14}$/)),
  tracking: trackingSchema,
});

export const onlyDigits = (value: string) => value.replace(/\D/g, "");

const submitLeadToCrm = createServerFn({ method: "POST" })
  .validator((input: unknown) => leadSchema.parse(input))
  .handler(async ({ data }) => {
    const { deliverLead } = await import("./lead-delivery.server");
    return deliverLead(data, {
      supabase: process.env.BIONATURE_WEBHOOK_URL ||
        "https://mpajmwwwexxnrsyocppb.supabase.co/functions/v1/api-webhook-receiver?token=b1de52b70c814e91a0e7167437c9e4907f5d7ec9e55342358a70c8664083a1ca",
      crm: process.env.CRM_WEBHOOK_URL ||
        "https://crm.fonilgroup.com.br/api/webhooks/leads/cmqwra13j0003t4mc92b5eobn",
    });
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
