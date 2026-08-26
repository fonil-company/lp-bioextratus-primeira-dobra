/** Estilos de botão do design system Bio Nature. */
export const btnBase =
  "group inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-bold transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2";

export const btnPrimary = `${btnBase} bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(22,72,40,0.16)] hover:-translate-y-0.5 hover:bg-primary-dark`;

export const btnGold = `${btnBase} bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:bg-secondary-dark shadow-[0_12px_28px_rgba(232,119,0,0.22)]`;

export const btnOutline = `${btnBase} border border-primary/45 bg-transparent text-primary hover:border-primary hover:bg-primary-soft`;

export const btnGhostLight = `${btnBase} border border-white/45 bg-white/5 text-white backdrop-blur-sm hover:border-white hover:bg-white hover:text-primary-dark`;
