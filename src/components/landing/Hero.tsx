import { ArrowDown, FileText, Package, Percent, Store, Truck } from "lucide-react";
import bannerHero from "@/assets/Banner 1.jpg";
import { HeroLeadForm } from "./LeadForm";

const condicoes = [
  { icon: Package, label: "Pedido mínimo", value: "R$ 300" },
  { icon: Percent, label: "Pagamento no PIX", value: "5% de desconto" },
  { icon: FileText, label: "Boleto", value: "Sujeito à análise" },
  { icon: Truck, label: "Frete grátis", value: "Regiões atendidas*" },
];

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-white pt-[82px]">
      <div className="absolute inset-x-0 bottom-0 top-[82px] overflow-hidden">
        <img
          src={bannerHero}
          alt="Banner Bio Extratus com produtos para abastecer lojas"
          width={2400}
          height={1018}
          fetchPriority="high"
          className="hero-image h-full w-full scale-105 object-cover object-center blur-sm"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.9)_54%,rgba(255,255,255,0.76)_100%)] md:bg-[linear-gradient(90deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.93)_34%,rgba(255,255,255,0.55)_52%,rgba(255,255,255,0.1)_76%)]" />
      </div>

      <div className="container-page relative z-10 grid gap-10 py-12 md:min-h-[700px] md:grid-cols-[minmax(0,1fr)_minmax(390px,0.78fr)] md:items-center md:gap-8 md:py-14 xl:grid-cols-[minmax(0,1.12fr)_480px] xl:gap-14">
        <div className="max-w-[620px] text-center md:text-left">
          <div className="hero-enter flex items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.13em] text-primary md:justify-start [animation-delay:100ms]">
            <span className="hidden h-0.5 w-12 bg-primary md:block" /> Distribuição Bio Extratus no
            Piauí e Sul do Maranhão
          </div>

          <h1 className="hero-enter mt-6 max-w-full break-words text-[2.15rem] leading-[1.02] text-title sm:max-w-[620px] sm:text-6xl sm:leading-[0.98] md:text-[4.1rem] [animation-delay:220ms]">
            Revenda <span className="text-secondary">Bio Extratus</span> no seu estabelecimento
          </h1>

          <p className="hero-enter mx-auto mt-7 max-w-[560px] text-base leading-relaxed text-body md:mx-0 md:text-lg [animation-delay:350ms]">
            Produtos originais, pedido mínimo de <strong className="text-title">R$ 300</strong> e
            suporte para montar seu primeiro pedido.
          </p>

          <div className="hero-enter mt-8 flex flex-col justify-center gap-3 sm:flex-row md:justify-start [animation-delay:470ms]">
            <a
              href="#cadastro"
              className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-secondary px-6 py-3 text-sm font-bold uppercase text-white shadow-[0_12px_28px_rgba(232,119,0,0.22)] transition-all hover:-translate-y-0.5 hover:bg-secondary-dark sm:w-auto"
            >
              <FileText className="h-4.5 w-4.5" aria-hidden="true" /> Receber catálogo comercial
            </a>
          </div>

          <p className="hero-enter mx-auto mt-6 max-w-xl text-sm font-semibold text-title/72 md:mx-0 md:flex md:items-start md:justify-start md:gap-2.5 [animation-delay:590ms]">
            <Store
              className="mt-0.5 hidden h-4 w-4 shrink-0 text-primary md:block"
              aria-hidden="true"
            />
            Exclusivo para empresas com CNPJ no Piauí e Sul do Maranhão.
          </p>
        </div>

        <HeroLeadForm />
      </div>

      <div className="container-page relative z-20 pb-12 md:pb-10">
        <ul className="grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-white shadow-[0_18px_45px_rgba(24,62,37,0.13)] lg:grid-cols-4">
          {condicoes.map(({ icon: Icon, label, value }, index) => (
            <li
              key={label}
              className={`flex min-h-[106px] min-w-0 items-center gap-2.5 px-3 py-4 sm:gap-3 sm:px-5 lg:min-h-[92px] ${index % 2 === 1 ? "border-l border-border" : ""} ${index > 1 ? "border-t border-border" : ""} ${index > 0 ? "lg:border-l" : ""} lg:border-t-0`}
            >
              <Icon
                className="h-6 w-6 shrink-0 text-primary"
                strokeWidth={1.7}
                aria-hidden="true"
              />
              <span className="leading-tight">
                <span className="block text-[10px] font-semibold text-subtle">{label}</span>
                <strong className="mt-1 block text-sm font-extrabold text-title">{value}</strong>
              </span>
            </li>
          ))}
        </ul>

        <a
          href="#cadastro"
          aria-label="Ir para o formulário de cadastro"
          className="mx-auto mt-6 flex h-8 w-8 items-center justify-center text-primary transition-transform hover:translate-y-1"
        >
          <ArrowDown className="h-5 w-5" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
