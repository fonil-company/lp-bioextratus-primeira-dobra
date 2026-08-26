import { useState } from "react";
import { CheckCircle2, Loader2, LockKeyhole, Send } from "lucide-react";
import { isValidCNPJ, isValidPhone, maskCNPJ, maskPhone, sendLead, type Lead } from "@/lib/lead";
import { btnPrimary } from "./ui";

const emptyLead: Lead = {
  nome: "",
  whatsapp: "",
  cnpj: "",
};

const CONSULTANT_WHATSAPP_URL =
  "https://wa.me/558694241572?text=Ol%C3%A1%21%20Acabei%20de%20preencher%20o%20formul%C3%A1rio%20da%20Bio%20Nature%20e%20gostaria%20de%20falar%20com%20um%20consultor.";

const fieldClass =
  "mt-2 min-h-12 w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-title transition-[border-color,box-shadow,background-color] duration-250 placeholder:text-subtle/70 hover:border-primary/45 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/8 disabled:cursor-not-allowed disabled:opacity-60";

type Errors = Partial<Record<keyof Lead, string>>;

export function HeroLeadForm() {
  const [values, setValues] = useState<Lead>(emptyLead);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const set = <K extends keyof Lead>(key: K, value: Lead[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };


  function validate() {
    const next: Errors = {};
    if (values.nome.trim().length < 3) next.nome = "Informe seu nome completo.";
    if (!isValidPhone(values.whatsapp)) next.whatsapp = "Informe um WhatsApp válido com DDD.";
    if (!isValidCNPJ(values.cnpj)) next.cnpj = "Informe um CNPJ válido.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;
    setStatus("loading");
    const result = await sendLead(values);
    if (result.ok) {
      setStatus("success");
      setValues(emptyLead);
      window.location.assign(CONSULTANT_WHATSAPP_URL);
    } else {
      setStatus("error");
    }
  }

  return (
    <div
      id="cadastro"
      className="hero-enter border border-border bg-white p-5 text-left shadow-[0_24px_64px_rgba(17,62,33,0.18)] sm:p-7 [animation-delay:420ms]"
    >
      {status === "success" ? (
        <div role="status" className="py-10 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft">
            <CheckCircle2 className="h-7 w-7 text-primary" aria-hidden="true" />
          </span>
          <h3 className="mt-5 text-2xl">Cadastro enviado com sucesso!</h3>
          <p className="mt-3 text-body">A equipe Bio Nature entrará em contato com você.</p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-6 text-sm font-semibold text-primary underline underline-offset-4"
          >
            Enviar outro cadastro
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <div className="mb-1 border-b border-border pb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
              Catálogo comercial
            </p>
            <h3 className="mt-2 text-2xl md:text-3xl">Receba as condições para sua região</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome" id="nome" error={errors.nome}>
              <input
                id="nome"
                name="nome"
                autoComplete="name"
                value={values.nome}
                onChange={(event) => set("nome", event.target.value)}
                className={fieldClass}
                placeholder="Seu nome completo"
                aria-invalid={!!errors.nome}
              />
            </Field>
            <Field label="Número (WhatsApp)" id="whatsapp" error={errors.whatsapp}>
              <input
                id="whatsapp"
                name="whatsapp"
                inputMode="tel"
                autoComplete="tel"
                value={values.whatsapp}
                onChange={(event) => set("whatsapp", maskPhone(event.target.value))}
                className={fieldClass}
                placeholder="(00) 00000-0000"
                aria-invalid={!!errors.whatsapp}
              />
            </Field>
          </div>

          <Field label="CNPJ" id="cnpj" error={errors.cnpj}>
            <input
              id="cnpj"
              name="cnpj"
              inputMode="numeric"
              value={values.cnpj}
              onChange={(event) => set("cnpj", maskCNPJ(event.target.value))}
              className={fieldClass}
              placeholder="00.000.000/0000-00"
              aria-invalid={!!errors.cnpj}
            />
          </Field>


          <button
            type="submit"
            disabled={status === "loading"}
            className={`${btnPrimary} w-full !bg-secondary !text-white hover:!bg-secondary-dark disabled:opacity-70`}
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
            Solicitar catálogo
          </button>

          <p className="flex items-start gap-2 text-[11px] leading-relaxed text-subtle">
            <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            Seus dados serão usados somente para este atendimento comercial.
          </p>
          {status === "error" && (
            <p role="alert" className="text-sm text-destructive">
              Não foi possível enviar agora. Tente novamente em instantes.
            </p>
          )}
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-bold text-title">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
