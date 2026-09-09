import { ArrowUpRight, Leaf } from "lucide-react";
import bioNatureLogo from "@/assets/logo bio extratus.png";

export function Header() {
  return (
    <header className="site-header fixed inset-x-0 top-0 z-50">
      <div className="container-page flex h-[78px] items-center justify-between gap-5">
        <a href="#inicio" aria-label="Bio Nature Cosmeticos - voltar ao inicio" className="shrink-0">
          <img
            src={bioNatureLogo}
            alt="Bio Nature Cosmeticos"
            width={800}
            height={400}
            className="h-auto w-[144px] object-contain sm:w-[166px]"
          />
        </a>

        <div className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-dark md:flex">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft">
            <Leaf className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          </span>
          Distribui&ccedil;&atilde;o oficial para lojistas
        </div>

        <a href="#cadastro" className="header-cta group">
          <span className="hidden sm:inline">Quero vender Bio Extratus</span>
          <span className="sm:hidden">Receber cat&aacute;logo</span>
          <ArrowUpRight
            className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </a>
      </div>
    </header>
  );
}
