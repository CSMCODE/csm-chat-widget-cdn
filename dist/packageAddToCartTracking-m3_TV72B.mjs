const META_PIXEL_ID = "1508854851243972";
const FBEVENTS_SRC = "https://connect.facebook.net/en_US/fbevents.js";
let initStarted = false;
function ensureMetaPixelInitialized() {
  try {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    if (initStarted) return;
    initStarted = true;
    const w = window;
    if (!w.fbq) {
      const n = function(...args) {
        if (n.callMethod) {
          n.callMethod(...args);
        } else {
          (n.queue = n.queue || []).push(args);
        }
      };
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      w.fbq = n;
      if (!w._fbq) w._fbq = n;
    }
    if (!document.getElementById("facebook-jssdk")) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.async = true;
      script.src = FBEVENTS_SRC;
      script.onerror = () => {
      };
      const first = document.getElementsByTagName("script")[0];
      if (first == null ? void 0 : first.parentNode) {
        first.parentNode.insertBefore(script, first);
      } else {
        (document.head || document.body || document.documentElement).appendChild(script);
      }
    }
    w.fbq("init", META_PIXEL_ID);
  } catch (e) {
  }
}
function trackAddToCart(amount) {
  try {
    ensureMetaPixelInitialized();
    const fbq = typeof window !== "undefined" ? window.fbq : void 0;
    if (typeof fbq !== "function") return;
    if (typeof amount === "number" && Number.isFinite(amount) && amount > 0) {
      fbq("track", "AddToCart", { value: amount, currency: "EUR" });
    } else {
      fbq("track", "AddToCart");
    }
  } catch (e) {
  }
}
const PACKAGE_SELECTED_EVENT = "orderFlowPackageSelected";
function resolveAddToCartAmount(ctx) {
  var _a;
  const parsed = parseFloat(String((_a = ctx.orderPcsTicketEur) != null ? _a : ""));
  if (!Number.isFinite(parsed) || parsed <= 0) return void 0;
  return parsed;
}
function attachPackageAddToCartTracking(bus, getContext) {
  return bus.on(PACKAGE_SELECTED_EVENT, () => {
    try {
      trackAddToCart(resolveAddToCartAmount(getContext()));
    } catch (e) {
    }
  });
}
export {
  attachPackageAddToCartTracking,
  resolveAddToCartAmount
};
