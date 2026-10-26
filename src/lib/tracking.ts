export type TrackingData = Record<string, string | undefined>;

const CAMPAIGN_KEYS = new Set([
  "fbclid", "gclid", "gbraid", "wbraid", "msclkid", "ttclid",
  "campaign", "campaign_id", "adset_id", "ad_id", "placement",
]);
const STORAGE_KEY = "bioextratus_tracking";
let entryTracking: TrackingData | undefined;

export function isCampaignKey(key: string) {
  return /^utm_[a-z0-9_]+$/.test(key) || CAMPAIGN_KEYS.has(key);
}

export function isAttributionValue(key: string, value: unknown): value is string {
  return typeof value === "string" && Boolean(value.trim()) &&
    value.trim().toLowerCase() !== key.toLowerCase() &&
    !/\{[^}]*\}|%7b|\[\[|<[^>]+>/i.test(value);
}

export function captureCampaign(pageUrl: string): TrackingData {
  const attribution: TrackingData = {};
  for (const [key, value] of new URL(pageUrl).searchParams) {
    if (isCampaignKey(key) && isAttributionValue(key, value)) attribution[key] = value;
  }
  return { ...attribution, event_source_url: pageUrl };
}

function readMetaCookie(name: string): string | undefined {
  const value = document.cookie.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1);
  if (!value) return undefined;
  try { return decodeURIComponent(value); } catch { return value; }
}

function readStoredTracking(): TrackingData {
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || "{}");
    return stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
  } catch {
    return {};
  }
}

// Capture once on entry. A subsequent hash/navigation must not replace the source URL.
// Keep the existing session scope, without merging identifiers from different campaigns.
export function captureTrackingData(): TrackingData {
  if (typeof window === "undefined") return {};

  if (!entryTracking) {
    const current = captureCampaign(window.location.href);
    const stored = readStoredTracking();
    const storedUrl = stored.event_source_url || stored.landing_url;
    let previous: TrackingData = {};
    try {
      if (storedUrl && new URL(storedUrl).origin === window.location.origin) {
        previous = captureCampaign(storedUrl);
      }
    } catch { /* Ignore malformed legacy session data. */ }
    entryTracking = Object.keys(current).some(isCampaignKey) || !previous.event_source_url
      ? current : previous;
  }

  const tracking: TrackingData = { ...entryTracking, landing_url: entryTracking.event_source_url };
  const fbc = readMetaCookie("_fbc");
  const fbp = readMetaCookie("_fbp");
  if (fbc) tracking.fbc = fbc;
  if (fbp) tracking.fbp = fbp;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tracking));
  } catch { /* Memory still preserves attribution when storage is unavailable. */ }
  return tracking;
}
