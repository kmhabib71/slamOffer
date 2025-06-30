import posthog from "posthog-js";

export const initPostHog = () => {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
      person_profiles: "identified_only",
      loaded: (posthog) => {
        if (process.env.NODE_ENV === "development") posthog.debug();
      },
    });
  }
};

// Analytics event types
export const trackEvent = (
  eventName: string,
  properties?: Record<string, any>
) => {
  if (typeof window !== "undefined") {
    posthog.capture(eventName, properties);
  }
};

export const identifyUser = (
  userId: string,
  properties?: Record<string, any>
) => {
  if (typeof window !== "undefined") {
    posthog.identify(userId, properties);
  }
};

// Conversion tracking events
export const analytics = {
  // Landing page events
  landingPageView: () => trackEvent("landing_page_view"),
  ctaClick: (location: string) => trackEvent("cta_click", { location }),

  // Generation events
  offerGenerationStart: (inputData: any) =>
    trackEvent("offer_generation_start", inputData),
  offerGenerationComplete: (score: number, time: number) =>
    trackEvent("offer_generation_complete", { score, time }),
  sectionView: (section: string) => trackEvent("section_view", { section }),

  // Paywall events
  paywallView: (trigger: string) => trackEvent("paywall_view", { trigger }),
  upgradeClick: (plan: string) => trackEvent("upgrade_click", { plan }),
  shareToUnlock: (platform: string) =>
    trackEvent("share_to_unlock", { platform }),

  // Export events
  pdfExport: (offerScore: number) => trackEvent("pdf_export", { offerScore }),
  mindmapView: () => trackEvent("mindmap_view"),

  // User journey
  userSignup: (method: string) => trackEvent("user_signup", { method }),
  subscriptionUpgrade: (plan: string, price: number) =>
    trackEvent("subscription_upgrade", { plan, price }),
};
