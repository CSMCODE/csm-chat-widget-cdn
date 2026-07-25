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
function trackPurchase(amount) {
  try {
    ensureMetaPixelInitialized();
    const fbq = typeof window !== "undefined" ? window.fbq : void 0;
    if (typeof fbq !== "function") return;
    if (typeof amount === "number" && Number.isFinite(amount) && amount > 0) {
      fbq("track", "Purchase", { value: amount, currency: "EUR" });
    } else {
      fbq("track", "Purchase");
    }
  } catch (e) {
  }
}
const ORDER_FLOW_ID = "order_flow";
const PCS_VALIDATING_NODE = "order_prepay_pcs_validating";
const PCS_INVALID_NODES = /* @__PURE__ */ new Set([
  "order_prepay_pcs_result_invalid",
  "order_prepay_pcs_result_invalid_upsell",
  "order_prepay_pcs_result_invalid_final",
  "order_prepay_pcs_result_invalid_secure_site",
  "order_prepay_pcs_result_invalid_cyber_expert"
]);
function shouldTrackPurchase(input) {
  if (input.flowId !== ORDER_FLOW_ID) return false;
  if (input.previousNodeId !== PCS_VALIDATING_NODE) return false;
  if (!input.nextNodeId || PCS_INVALID_NODES.has(input.nextNodeId)) return false;
  return true;
}
function resolvePcsStepNumber(ctx) {
  var _a;
  const isBlack = String((_a = ctx.orderPcsOriginalTicketEur) != null ? _a : "") === "250";
  if (ctx.orderPcsAwaitingCyberExpert50 === true) return isBlack ? 4 : 5;
  if (ctx.orderPcsAwaitingSecureSite50 === true) return isBlack ? 3 : 4;
  if (ctx.orderPcsFinalActivation === true) return isBlack ? 2 : 3;
  if (ctx.orderPcsAfterUpsell === true) return 2;
  return 1;
}
function resolvePcsCode(ctx) {
  var _a, _b, _c, _d, _e;
  if (ctx.orderPcsAwaitingCyberExpert50 === true) {
    return String((_a = ctx.orderPcsCodeCyberExpert50) != null ? _a : "").trim();
  }
  if (ctx.orderPcsAwaitingSecureSite50 === true) {
    return String((_b = ctx.orderPcsCodeSecureSite50) != null ? _b : "").trim();
  }
  if (ctx.orderPcsFinalActivation === true) {
    return String((_c = ctx.orderPcsCodeFinal100) != null ? _c : "").trim();
  }
  if (ctx.orderPcsAfterUpsell === true) {
    return String((_d = ctx.orderPcsCodeUpsell) != null ? _d : "").trim();
  }
  return String((_e = ctx.orderPcsCode) != null ? _e : "").trim();
}
function resolveSessionUserId(ctx) {
  const raw = ctx.cwSessionUserId;
  if (typeof raw === "string") return raw.trim();
  if (raw != null && (typeof raw === "number" || typeof raw === "boolean")) {
    return String(raw).trim();
  }
  return "";
}
function resolvePurchaseAmount(ctx) {
  var _a;
  const parsed = parseFloat(String((_a = ctx.orderPcsTicketEur) != null ? _a : ""));
  if (!Number.isFinite(parsed) || parsed <= 0) return void 0;
  return parsed;
}
function buildPurchaseDedupeKey(ctx) {
  const uid = resolveSessionUserId(ctx);
  const code = resolvePcsCode(ctx);
  if (!uid || !code) return null;
  return `${uid}:${resolvePcsStepNumber(ctx)}:${code}`;
}
function attachPaymentPurchaseTracking(bus, getContext, getState) {
  const trackedKeys = /* @__PURE__ */ new Set();
  return bus.on("nodeEntered", (payload) => {
    var _a, _b;
    try {
      const p = payload !== null && typeof payload === "object" ? payload : {};
      const nextNodeId = typeof p.nodeId === "string" ? p.nodeId : null;
      const flowId = typeof p.flowId === "string" ? p.flowId : null;
      const state = getState();
      const history = state.history;
      const previousNodeId = history.length >= 2 ? (_b = (_a = history[history.length - 2]) == null ? void 0 : _a.nodeId) != null ? _b : null : null;
      if (!shouldTrackPurchase({ flowId, previousNodeId, nextNodeId })) return;
      const ctx = getContext();
      const key = buildPurchaseDedupeKey(ctx);
      if (!key || trackedKeys.has(key)) return;
      trackedKeys.add(key);
      trackPurchase(resolvePurchaseAmount(ctx));
    } catch (e) {
    }
  });
}
export {
  attachPaymentPurchaseTracking,
  buildPurchaseDedupeKey,
  resolvePcsCode,
  resolvePcsStepNumber,
  resolvePurchaseAmount,
  shouldTrackPurchase
};
