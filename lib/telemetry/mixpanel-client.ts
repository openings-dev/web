import { readAnalyticsConsent } from "./consent";
import { clearPendingProductEvents, setProductEventHandler } from ".";

type MixpanelModule = typeof import("mixpanel-browser");
type MixpanelClient = MixpanelModule["default"];
type MixpanelLoader = () => Promise<MixpanelModule>;

const defaultLoader: MixpanelLoader = () => import("mixpanel-browser");
let loadMixpanel: MixpanelLoader = defaultLoader;
let client: MixpanelClient | null = null;
let loading: Promise<boolean> | null = null;
let activeToken: string | null = null;
let lifecycleVersion = 0;

function deliverProductEvent(
  instance: MixpanelClient,
  name: string,
  properties: Record<string, unknown>,
) {
  instance.track(name, properties, {
    transport: "sendBeacon",
    send_immediately: true,
  });
}

function installEventHandler(instance: MixpanelClient) {
  setProductEventHandler((name, properties) => {
    deliverProductEvent(instance, name, properties);
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

function clearMixpanelClient(instance: MixpanelClient, token: string) {
  try {
    instance.opt_out_tracking({
      delete_user: false,
      persistence_type: "localStorage",
      secure_cookie: true,
    });
  } catch {
    // Continue removing the local identity if the vendor call fails.
  }
  try {
    instance.reset();
  } catch {
    // Continue removing the local identity if the vendor call fails.
  }
  clearMixpanelIdentityKeys(token);
}

export async function enableAnalytics(): Promise<boolean> {
  if (readAnalyticsConsent() !== "granted") return false;
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!token || typeof window === "undefined") return false;
  if (client) return true;
  if (loading) return loading;
  const requestedVersion = lifecycleVersion;
  let initializedInstance: MixpanelClient | null = null;
  const loadRequest = (async () => {
    try {
      const sdkModule = await loadMixpanel();
      if (requestedVersion !== lifecycleVersion ||
        readAnalyticsConsent() !== "granted") return false;
      const instance = sdkModule.default;
      initializedInstance = instance;
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
      installEventHandler(instance);
      client = instance;
      activeToken = token;
      return true;
    } catch {
      if (requestedVersion === lifecycleVersion) {
        if (initializedInstance) clearMixpanelClient(initializedInstance, token);
        client = null;
        activeToken = null;
        clearPendingProductEvents();
        setProductEventHandler(null);
      }
      return false;
    } finally {
      if (requestedVersion === lifecycleVersion) loading = null;
    }
  })();
  loading = loadRequest;
  return loadRequest;
}

export function disableAnalytics() {
  lifecycleVersion += 1;
  clearPendingProductEvents();
  setProductEventHandler(null);
  const instance = client;
  const token = activeToken;
  client = null;
  activeToken = null;
  loading = null;
  if (!instance) return;
  if (token) clearMixpanelClient(instance, token);
}

export function setMixpanelLoaderForTests(loader?: MixpanelLoader) {
  loadMixpanel = loader ?? defaultLoader;
}
