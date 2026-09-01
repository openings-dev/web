import { readAnalyticsConsent } from "./consent";
import { setProductEventHandler } from ".";

type MixpanelModule = typeof import("mixpanel-browser");
type MixpanelClient = MixpanelModule["default"];
type MixpanelLoader = () => Promise<MixpanelModule>;

const defaultLoader: MixpanelLoader = () => import("mixpanel-browser");
let loadMixpanel: MixpanelLoader = defaultLoader;
let client: MixpanelClient | null = null;
let loading: Promise<boolean> | null = null;
let activeToken: string | null = null;
let lifecycleVersion = 0;

function installEventHandler(instance: MixpanelClient) {
  setProductEventHandler((name, properties) => {
    instance.track(name, properties);
  });
}

function clearMixpanelIdentityKeys(token: string) {
  try {
    const storage = window.localStorage;
    const keys = Array.from({ length: storage.length }, (_, index) =>
      storage.key(index)).filter((key): key is string => Boolean(key));
    for (const key of keys) {
      if (key.includes(token) && !key.startsWith("__mp_opt_in_out_")) {
        storage.removeItem(key);
      }
    }
  } catch {
    // Analytics remains disabled even when browser storage is unavailable.
  }
}

export async function enableAnalytics(): Promise<boolean> {
  if (readAnalyticsConsent() !== "granted") return false;
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!token || typeof window === "undefined") return false;
  if (client) return true;
  if (loading) return loading;
  const requestedVersion = lifecycleVersion;
  loading = (async () => {
    try {
      const sdkModule = await loadMixpanel();
      if (requestedVersion !== lifecycleVersion ||
        readAnalyticsConsent() !== "granted") return false;
      const instance = sdkModule.default;
      instance.init(token, {
        api_host: process.env.NEXT_PUBLIC_MIXPANEL_API_HOST ??
          "https://api.mixpanel.com",
        autocapture: false,
        track_pageview: false,
        record_sessions_percent: 0,
        persistence: "localStorage",
        ip: false,
        secure_cookie: true,
        stop_utm_persistence: true,
        debug: process.env.NODE_ENV === "development",
      });
      instance.opt_in_tracking({
        persistence_type: "localStorage",
        secure_cookie: true,
        track: () => undefined,
      });
      client = instance;
      activeToken = token;
      installEventHandler(instance);
      return true;
    } catch {
      return false;
    } finally {
      loading = null;
    }
  })();
  return loading;
}

export function disableAnalytics() {
  lifecycleVersion += 1;
  setProductEventHandler(null);
  const instance = client;
  const token = activeToken;
  client = null;
  activeToken = null;
  loading = null;
  if (!instance) return;
  instance.opt_out_tracking({
    delete_user: false,
    persistence_type: "localStorage",
    secure_cookie: true,
  });
  instance.reset();
  if (token) clearMixpanelIdentityKeys(token);
}

export function setMixpanelLoaderForTests(loader?: MixpanelLoader) {
  loadMixpanel = loader ?? defaultLoader;
}
