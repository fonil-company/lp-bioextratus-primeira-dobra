import { useState } from "react";
import { CheckCircle2, Loader2, LockKeyhole, Send, Sparkles } from "lucide-react";
import { isValidCNPJ, isValidPhone, maskCNPJ, maskPhone, sendLead, type Lead } from "@/lib/lead";

const emptyLead: Lead = {
  nome: "",
  whatsapp: "",
  cnpj: "",
};

const fieldClass = "form-input";

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
    if (!isValidPhone(values.whatsapp)) next.whatsapp = "Informe um WhatsApp v\u00e1lido com DDD.";
    if (!isValidCNPJ(values.cnpj)) next.cnpj = "Informe um CNPJ v\u00e1lido.";
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
    } else {
      setStatus("error");
    }
  }

  return (
    <aside id="cadastro" className="lead-card hero-enter [animation-delay:180ms]">
      {status === "success" ? (
        <div role="status" className="flex min-h-[430px] flex-col items-center justify-center py-8 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <CheckCircle2 className="h-8 w-8 text-cream" aria-hidden="true" />
          </span>
          <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">
            Tudo certo
          </p>
          <h2 className="mt-2 text-4xl uppercase text-primary-dark">Cadastro enviado!</h2>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-body">
            A equipe Bio Nature entrar&aacute; em contato para apresentar as condi&ccedil;&otilde;es da sua regi&atilde;o.
          </p>
          <button type="button" onClick={() => setStatus("idle")} className="mt-6 text-sm font-bold text-primary underline underline-offset-4">
            Enviar outro cadastro
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <div className="border-b border-primary-dark/12 pb-4">
            <p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Cat&aacute;logo comercial
            </p>
            <h2 className="form-heading mt-2">Leve Bio Extratus para a sua loja</h2>
            <p className="mt-2 text-xs leading-relaxed text-body/75">
              Preencha os dados e receba as condi&ccedil;&otilde;es para sua regi&atilde;o.
            </p>
          </div>

          <Field label="Nome completo" id="nome" error={errors.nome}>
            <input
              id="nome"
              name="nome"
              autoComplete="name"
              value={values.nome}
              onChange={(event) => set("nome", event.target.value)}
              className={fieldClass}
              placeholder={"Como podemos chamar voc\u00ea?"}
              aria-invalid={!!errors.nome}
            />
          </Field>

          <Field label="WhatsApp" id="whatsapp" error={errors.whatsapp}>
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

          <Field label="CNPJ da empresa" id="cnpj" error={errors.cnpj}>
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

          <button type="submit" disabled={status === "loading"} className="form-submit group">
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            )}
            Solicitar cat&aacute;logo
          </button>

          <p className="flex items-start justify-center gap-2 text-[10px] leading-relaxed text-subtle">
            <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            Seus dados ser&atilde;o usados somente neste atendimento comercial.
          </p>

          {status === "error" && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-semibold text-destructive">
              N&atilde;o foi poss&iacute;vel enviar agora. Tente novamente em instantes.
            </p>
          )}
        </form>
      )}
    </aside>
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
      <label htmlFor={id} className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-primary-dark">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs font-semibold text-destructive">{error}</p>}
    </div>
  );
}
