import { ArrowRight, BadgePercent, Boxes, MapPin, PackageCheck, Sprout } from "lucide-react";
import heroVarejo from "@/assets/hero-varejo-natural.jpg";
import { HeroLeadForm } from "./LeadForm";

const beneficios = [
  { icon: PackageCheck, label: "Pedido m\u00ednimo", value: "a partir de R$ 300" },
  { icon: Boxes, label: "Mix completo", value: "de produtos" },
  { icon: BadgePercent, label: "Condi\u00e7\u00f5es", value: "exclusivas" },
];

export function Hero() {
  return (
    <section id="inicio" className="hero-shell relative isolate overflow-hidden pt-[78px]">
      <div className="absolute inset-0 -z-20">
        <img
          src={heroVarejo}
          alt={"Supermercado cercado por natureza com caminh\u00e3o realizando uma entrega"}
          width={1536}
          height={1024}
          fetchPriority="high"
          className="hero-photo h-full w-full object-cover"
        />
      </div>
      <div className="hero-wash absolute inset-0 -z-10" />
      <div className="leaf-shadow pointer-events-none absolute -left-20 top-14 -z-10 h-72 w-72" />

      <div className="container-page flex min-h-[calc(100svh-78px)] items-center py-8 md:py-10 lg:py-12">
        <div className="hero-layout grid w-full items-center gap-5 lg:grid-cols-[minmax(0,1.14fr)_minmax(360px,0.78fr)] lg:gap-7 xl:gap-9">
          <article className="commercial-card hero-enter">
            <div className="relative z-10">
              <p className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.19em] text-cream/80 sm:text-[11px]">
                <span className="h-px w-8 bg-cream/55" />
                Uma oportunidade para o seu neg&oacute;cio
              </p>

              <h1 className="mt-5 max-w-[690px] font-sans text-[clamp(2.35rem,4vw,4.4rem)] font-black uppercase leading-[0.98] tracking-[-0.045em] text-cream">
                Receba o cat&aacute;logo de uma marca de alto giro para o seu estabelecimento
              </h1>

              <p className="mt-5 max-w-[610px] text-[0.95rem] leading-relaxed text-cream/82 sm:text-base lg:text-lg">
                Mais variedade para sua g&ocirc;ndola e{" "}
                <strong className="font-extrabold text-cream">mais op&ccedil;&otilde;es para seus clientes.</strong>
              </p>

              <div className="botanical-divider my-5 sm:my-6" aria-hidden="true">
                <span />
                <Sprout className="h-5 w-5 shrink-0 text-cream" strokeWidth={1.7} />
                <span />
              </div>

              <ul className="grid grid-cols-3 gap-2.5" aria-label={"Condi\u00e7\u00f5es comerciais"}>
                {beneficios.map(({ icon: Icon, label, value }) => (
                  <li key={label} className="benefit-item">
                    <span className="benefit-icon">
                      <Icon className="h-5 w-5" strokeWidth={1.65} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 leading-tight">
                      <span className="block text-[10px] font-semibold text-cream/62">{label}</span>
                      <strong className="mt-1 block text-xs font-extrabold text-cream sm:text-[13px]">{value}</strong>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a href="#cadastro" className="hero-cta group">
                  Quero receber o cat&aacute;logo
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-dark text-cream">
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </a>

                <p className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.11em] text-cream/70 sm:justify-start">
                  <MapPin className="h-4 w-4 shrink-0 text-cream" aria-hidden="true" />
                  Piau&iacute; e Sul do Maranh&atilde;o
                </p>
              </div>
            </div>
          </article>

          <HeroLeadForm />
        </div>
      </div>
    </section>
  );
}
