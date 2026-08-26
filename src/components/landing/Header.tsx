import { useEffect, useState } from "react";
import { Menu, UserRound, X } from "lucide-react";
import bioNatureLogo from "@/assets/logo bio extratus.png";
import { NAV_LINKS } from "@/lib/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b bg-white/96 transition-all duration-300 ${
        scrolled || open
          ? "border-border shadow-[0_10px_35px_rgba(24,62,37,0.1)] backdrop-blur-xl"
          : "border-transparent"
      }`}
    >
      <div className="container-page flex h-[82px] items-center justify-between gap-8">
        <a href="#cadastro" aria-label="Ir para o formulário de cadastro" className="shrink-0">
          <img
            src={bioNatureLogo}
            alt="Bio Nature Cosméticos"
            width={800}
            height={400}
            className="h-auto w-[170px] object-contain md:w-[190px]"
          />
        </a>

        <nav aria-label="Navegação principal" className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.slice(1).map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative py-3 text-[12px] font-semibold text-title/78 transition-colors after:absolute after:inset-x-0 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:bg-secondary after:transition-transform hover:text-title hover:after:scale-x-100"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#cadastro"
          className="hidden min-h-11 shrink-0 items-center gap-2 rounded-md bg-secondary px-5 text-xs font-bold uppercase text-white shadow-[0_10px_24px_rgba(232,119,0,0.2)] transition-all hover:-translate-y-0.5 hover:bg-secondary-dark xl:inline-flex"
        >
          <UserRound className="h-4 w-4" aria-hidden="true" /> Quero ser cliente
        </a>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className="flex h-11 w-11 items-center justify-center rounded-md text-primary-dark transition-colors hover:bg-primary-soft lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        id="menu-mobile"
        className={`grid bg-white transition-[grid-template-rows] duration-300 lg:hidden ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <nav
            className="container-page flex flex-col border-t border-border pb-6 pt-2"
            aria-label="Navegação mobile"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-border py-3.5 text-sm font-semibold text-title"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#cadastro"
              onClick={() => setOpen(false)}
              className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-secondary px-5 text-sm font-bold text-white"
            >
              <UserRound className="h-4 w-4" /> Quero ser cliente
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
