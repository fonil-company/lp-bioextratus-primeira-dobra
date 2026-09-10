declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

// Nunca envie dados pessoais (nome, telefone, CNPJ) nesta chamada — o Meta Pixel
// não os criptografa aqui; PII só deve trafegar via Advanced Matching/CAPI no servidor.
export function trackLeadEvent(params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("track", "Lead", params);
}
