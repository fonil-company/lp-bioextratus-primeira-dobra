export type TrackingData = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  campaign_id?: string;
  adset_id?: string;
  ad_id?: string;
  fbp?: string;
  landing_url?: string;
};

const URL_PARAM_KEYS: (keyof TrackingData)[] = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "campaign_id",
  "adset_id",
  "ad_id",
];

const STORAGE_KEY = "bioextratus_tracking";

function readFbpCookie(): string | undefined {
  const match = document.cookie.match(/(?:^|;\s*)_fbp=([^;]+)/);
  return match?.[1];
}

function readStoredTracking(): TrackingData {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as TrackingData) : {};
  } catch {
    return {};
  }
}

function persistTracking(data: TrackingData) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage indisponível (modo privado, etc.) — segue sem persistir.
  }
}

// Captura utms/click ids da URL no primeiro carregamento e mantém no sessionStorage,
// assim o cadastro final continua com a origem mesmo se o envio ocorrer depois da chegada.
export function captureTrackingData(): TrackingData {
  if (typeof window === "undefined") return {};

  const params = new URL(window.location.href).searchParams;
  const fromUrl: TrackingData = {};
  for (const key of URL_PARAM_KEYS) {
    const value = params.get(key);
    if (value) fromUrl[key] = value;
  }

  const stored = readStoredTracking();
  const merged: TrackingData = { ...stored, ...fromUrl };

  const fbp = readFbpCookie();
  if (fbp) merged.fbp = fbp;

  merged.landing_url = window.location.href;

  persistTracking(merged);
  return merged;
}
