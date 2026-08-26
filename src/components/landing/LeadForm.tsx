import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, LockKeyhole, Send } from "lucide-react";
import { isValidCNPJ, isValidPhone, maskCNPJ, maskPhone, sendLead, type Lead } from "@/lib/lead";
import { btnPrimary } from "./ui";

const INVESTIMENTOS = [
  "De R$ 300 a R$ 500",
  "De R$ 501 a R$ 1.000",
  "De R$ 1.001 a R$ 2.000",
  "De R$ 2.001 a R$ 5.000",
  "Acima de R$ 5.000",
  "Quero conhecer as condições primeiro",
];

const FALLBACK_CITIES: Record<"PI" | "MA", string[]> = {
  PI: [
    "Altos",
    "Barras",
    "Campo Maior",
    "Floriano",
    "José de Freitas",
    "Oeiras",
    "Parnaíba",
    "Pedro II",
    "Picos",
    "Piripiri",
    "São Raimundo Nonato",
    "Teresina",
  ],
  MA: [
    "Imperatriz",
    "Timon",
    "Açailândia",
    "Colinas",
    "Barra do Corda",
    "Balsas",
    "Grajaú",
    "Buriticupu",
    "Estreito",
    "Lago da Pedra",
    "Bom Jesus das Selvas",
    "Presidente Dutra",
    "Pedreiras",
    "Amarante do Maranhão",
    "Itinga do Maranhão",
    "João Lisboa",
    "Carolina",
    "São Domingos do Maranhão",
    "Arame",
    "Vila Nova dos Martírios",
    "Porto Franco",
    "Dom Pedro",
    "São João dos Patos",
    "Esperantinópolis",
    "Matões",
    "Sítio Novo",
    "Mirador",
    "Fortuna",
    "Parnarama",
    "Gonçalves Dias",
    "Santo Antônio dos Lopes",
    "Riachão",
    "Davinópolis",
    "São Pedro da Água Branca",
    "Itaipava do Grajaú",
    "Paraibano",
    "Joselândia",
    "Poção de Pedras",
    "São Raimundo das Mangabeiras",
    "Buriti Bravo",
    "Campestre do Maranhão",
    "Trizidela do Vale",
    "Tuntum",
    "Pastos Bons",
    "Formosa da Serra Negra",
    "São João do Paraíso",
    "São Francisco do Brejão",
    "Senador La Rocque",
    "Cidelândia",
    "Barão de Grajaú",
    "Lagoa Grande do Maranhão",
    "Jenipapo dos Vieiras",
    "Fortaleza dos Nogueiras",
    "Feira Nova do Maranhão",
    "Alto Parnaíba",
    "São Pedro dos Crentes",
    "Senador Alexandre Costa",
    "Buritirana",
    "São José dos Basílios",
    "Loreto",
    "Governador Edison Lobão",
    "Lajeado Novo",
    "São Francisco do Maranhão",
    "Capinzal do Norte",
    "São Domingos do Azeitão",
    "Lima Campos",
    "Lagoa do Mato",
    "Nova Colinas",
    "Governador Archer",
    "Tasso Fragoso",
    "Governador Eugênio Barros",
    "Graça Aranha",
    "Montes Altos",
    "São Raimundo do Doca Bezerra",
    "Sucupira do Norte",
    "Lago dos Rodrigues",
    "Passagem Franca",
    "Jatobá",
    "Marajá do Sena",
    "Ribamar Fiquene",
    "Sucupira do Riachão",
    "Governador Luiz Rocha",
    "Nova Iorque",
    "Sambaíba",
  ],
};

const emptyLead: Lead = {
  nome: "",
  whatsapp: "",
  cnpj: "",
  estado: "",
  cidade: "",
  faixaInvestimento: "",
  consentimento: false,
};

const CONSULTANT_WHATSAPP_URL =
  "https://wa.me/558694241572?text=Ol%C3%A1%21%20Acabei%20de%20preencher%20o%20formul%C3%A1rio%20da%20Bio%20Nature%20e%20gostaria%20de%20falar%20com%20um%20consultor.";

const fieldClass =
  "mt-2 min-h-12 w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-title transition-[border-color,box-shadow,background-color] duration-250 placeholder:text-subtle/70 hover:border-primary/45 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/8 disabled:cursor-not-allowed disabled:opacity-60";

type Errors = Partial<Record<keyof Lead, string>>;
type CitiesStatus = "idle" | "loading" | "ready" | "fallback";

export function HeroLeadForm() {
  const [values, setValues] = useState<Lead>(emptyLead);
  const [errors, setErrors] = useState<Errors>({});
  const [cities, setCities] = useState<string[]>([]);
  const [citiesStatus, setCitiesStatus] = useState<CitiesStatus>("idle");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    if (values.estado !== "PI" && values.estado !== "MA") {
      setCities([]);
      setCitiesStatus("idle");
      return;
    }

    const controller = new AbortController();
    const estado = values.estado;

    if (estado === "MA") {
      setCities(FALLBACK_CITIES.MA);
      setCitiesStatus("ready");
      return () => controller.abort();
    }

    setCitiesStatus("loading");

    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios?orderBy=nome`,
      { signal: controller.signal },
    )
      .then((response) => {
        if (!response.ok) throw new Error("Não foi possível carregar as cidades.");
        return response.json() as Promise<Array<{ nome: string }>>;
      })
      .then((municipios) => {
        setCities(municipios.map(({ nome }) => nome));
        setCitiesStatus("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setCities(FALLBACK_CITIES[estado]);
        setCitiesStatus("fallback");
      });

    return () => controller.abort();
  }, [values.estado]);

  const set = <K extends keyof Lead>(key: K, value: Lead[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  function selectState(estado: string) {
    setValues((current) => ({ ...current, estado, cidade: "" }));
    setErrors((current) => {
      const next = { ...current };
      delete next.estado;
      delete next.cidade;
      return next;
    });
  }

  function validate() {
    const next: Errors = {};
    if (values.nome.trim().length < 3) next.nome = "Informe seu nome completo.";
    if (!isValidPhone(values.whatsapp)) next.whatsapp = "Informe um WhatsApp válido com DDD.";
    if (!isValidCNPJ(values.cnpj)) next.cnpj = "Informe um CNPJ válido.";
    if (!values.estado) next.estado = "Selecione o estado.";
    if (!values.cidade) next.cidade = "Selecione a cidade.";
    if (!values.faixaInvestimento) next.faixaInvestimento = "Selecione quanto pretende investir.";
    if (!values.consentimento) next.consentimento = "É necessário aceitar o contato comercial.";
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

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Estado" id="estado" error={errors.estado}>
              <select
                id="estado"
                name="estado"
                value={values.estado}
                onChange={(event) => selectState(event.target.value)}
                className={fieldClass}
                aria-invalid={!!errors.estado}
              >
                <option value="">Selecione</option>
                <option value="PI">Piauí</option>
                <option value="MA">Maranhão</option>
              </select>
            </Field>
            <Field label="Cidade" id="cidade" error={errors.cidade}>
              <select
                id="cidade"
                name="cidade"
                value={values.cidade}
                onChange={(event) => set("cidade", event.target.value)}
                className={fieldClass}
                disabled={!values.estado || citiesStatus === "loading"}
                aria-invalid={!!errors.cidade}
              >
                <option value="">
                  {!values.estado
                    ? "Escolha o estado"
                    : citiesStatus === "loading"
                      ? "Carregando cidades..."
                      : "Selecione a cidade"}
                </option>
                {cities.map((cidade) => (
                  <option key={cidade}>{cidade}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field
            label="Quanto você pretende investir em produtos Bio Extratus?"
            id="investimento"
            error={errors.faixaInvestimento}
          >
            <select
              id="investimento"
              name="faixaInvestimento"
              value={values.faixaInvestimento}
              onChange={(event) => set("faixaInvestimento", event.target.value)}
              className={fieldClass}
              aria-invalid={!!errors.faixaInvestimento}
            >
              <option value="">Selecione uma faixa</option>
              {INVESTIMENTOS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>

          <div>
            <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-body">
              <input
                type="checkbox"
                checked={values.consentimento}
                onChange={(event) => set("consentimento", event.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
                aria-invalid={!!errors.consentimento}
              />
              Concordo em receber o contato comercial da Bio Nature por WhatsApp ou telefone.
            </label>
            {errors.consentimento && (
              <p className="mt-1.5 text-xs text-destructive">{errors.consentimento}</p>
            )}
          </div>

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
