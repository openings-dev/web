export const ANDROID_APP_PROMOTION_DISMISSED_KEY = "openings:android-app-promotion:dismissed:v1";

const DISMISSED_VALUE = "1";

export interface AndroidAppPromotionStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function browserStorage(): AndroidAppPromotionStorage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readAndroidAppPromotionDismissed(
  storage: AndroidAppPromotionStorage | null = browserStorage(),
): boolean {
  if (!storage) {
    return false;
  }

  try {
    return storage.getItem(ANDROID_APP_PROMOTION_DISMISSED_KEY) === DISMISSED_VALUE;
  } catch {
    return false;
  }
}

export function writeAndroidAppPromotionDismissed(
  storage: AndroidAppPromotionStorage | null = browserStorage(),
): boolean {
  if (!storage) {
    return false;
  }

  try {
    storage.setItem(ANDROID_APP_PROMOTION_DISMISSED_KEY, DISMISSED_VALUE);
    return true;
  } catch {
    return false;
  }
}

export function subscribeAndroidAppPromotionDismissed(
  onStoreChange: () => void,
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === ANDROID_APP_PROMOTION_DISMISSED_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}
