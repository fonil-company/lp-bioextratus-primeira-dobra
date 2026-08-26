import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type Lead = {
  nome: string;
  whatsapp: string;
  cnpj: string;
  estado: string;
  cidade: string;
  faixaInvestimento: string;
  consentimento: boolean;
};

const leadSchema = z.object({
  nome: z.string().min(3),
  whatsapp: z.string().min(10),
  cnpj: z.string().min(14),
  estado: z.enum(["PI", "MA"]),
  cidade: z.string().min(1),
  faixaInvestimento: z.string().min(1),
  consentimento: z.boolean().refine((value) => value),
});

export const onlyDigits = (value: string) => value.replace(/\D/g, "");

const LEGACY_CRM_WEBHOOK_URL =
  "https://newtracking-sales-sys.vercel.app/api/webhooks/leads/cmqwra13j0003t4mc92b5eobn";
const CRM_WEBHOOK_URL = process.env.CRM_WEBHOOK_URL;

const submitLeadToCrm = createServerFn({ method: "POST" })
  .validator((input: unknown) => leadSchema.parse(input))
  .handler(async ({ data }) => {
    const payload = {
      phone: onlyDigits(data.whatsapp),
      name: data.nome.trim(),
      document: onlyDigits(data.cnpj),
      city: data.cidade,
      state: data.estado,
      pipeline_stage: "Qualificado",
    };

    const crmRequest = CRM_WEBHOOK_URL
      ? fetch(CRM_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : Promise.reject(new Error("CRM_WEBHOOK_URL is not configured."));

    const [crmResult, legacyCrmResult] = await Promise.allSettled([
      crmRequest,
      fetch(LEGACY_CRM_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    ]);

    const crmResponse = crmResult.status === "fulfilled" ? crmResult.value : undefined;
    const legacyCrmResponse =
      legacyCrmResult.status === "fulfilled" ? legacyCrmResult.value : undefined;

    if (!crmResponse?.ok) {
      console.error(
        `New CRM rejected lead submission${crmResponse ? ` with status ${crmResponse.status}` : ""}.`,
      );
    }
    if (!legacyCrmResponse?.ok) {
      console.error(
        `Legacy CRM rejected lead submission${legacyCrmResponse ? ` with status ${legacyCrmResponse.status}` : ""}.`,
      );
    }

    return { ok: crmResponse?.ok ?? false };
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
