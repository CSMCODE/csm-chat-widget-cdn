import { i as interpolateAll } from "./faq-BVDEs-g4.mjs";
import { A as AVAILABILITY_LABEL } from "./index-Bn-dxvMG.mjs";
const EUR_REGEX = /EUR/gi;
const AMOUNT_REGEX = /\d[\d.,]*(?:\s*€)?/g;
const DEFAULT_TIERS = ["bronze", "silver", "gold", "black"];
const OUT_OF_STOCK_BANNER_LABEL = "RUPTURE DE STOCK";
const UNAVAILABLE_LABEL = "INDISPONIBLE";
const TIER_AVAILABILITY = {
  bronze: 5,
  silver: 4,
  gold: 5,
  black: 3
};
function resolveTier(item, index) {
  var _a;
  if (item.tier) return item.tier;
  return (_a = DEFAULT_TIERS[index % DEFAULT_TIERS.length]) != null ? _a : "bronze";
}
function setOfferText(offerEl, rawOffer) {
  var _a;
  const normalizedOffer = rawOffer.replace(EUR_REGEX, "€");
  const amountMatches = Array.from(normalizedOffer.matchAll(AMOUNT_REGEX));
  if (!amountMatches.length) {
    offerEl.textContent = normalizedOffer;
    return;
  }
  let cursor = 0;
  for (const match of amountMatches) {
    const amountText = match[0];
    if (!amountText) continue;
    const start = (_a = match.index) != null ? _a : 0;
    const end = start + amountText.length;
    offerEl.append(normalizedOffer.slice(cursor, start));
    const amount = document.createElement("span");
    amount.className = "cw-package-select-offer-amount";
    amount.textContent = amountText;
    offerEl.append(amount);
    cursor = end;
  }
  offerEl.append(normalizedOffer.slice(cursor));
}
class PackageSelectRenderer {
  static render(node, container, context, userInput, debug, bus) {
    var _a;
    container.replaceChildren();
    if (((_a = node.media) == null ? void 0 : _a.type) !== "package_select" || !node.media.items.length) {
      return;
    }
    const list = document.createElement("div");
    list.className = "cw-package-select-list";
    let committed = false;
    const disableAll = () => {
      for (const btn of list.querySelectorAll("button.cw-package-select-card")) {
        if (btn.classList.contains("cw-package-select-card--out-of-stock")) continue;
        btn.disabled = true;
        btn.classList.add("cw-package-select-card--disabled");
      }
    };
    node.media.items.forEach((item, index) => {
      const tier = resolveTier(item, index);
      const outOfStock = item.outOfStock === true;
      const renderedTitle = interpolateAll(item.title, context, userInput, debug);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `cw-package-select-card cw-package-select-card--tier-${tier}`;
      btn.setAttribute(
        "aria-label",
        outOfStock ? `${renderedTitle}, ${UNAVAILABLE_LABEL}` : renderedTitle
      );
      if (item.mostPopular) {
        btn.classList.add("cw-package-select-card--most-popular");
      }
      if (outOfStock) {
        btn.classList.add("cw-package-select-card--out-of-stock");
        btn.setAttribute("aria-disabled", "true");
      }
      const availabilityCount = TIER_AVAILABILITY[tier];
      if (availabilityCount !== void 0) {
        btn.classList.add("cw-package-select-card--has-availability");
      }
      const thumb = document.createElement("span");
      thumb.className = "cw-package-select-thumb-wrap";
      const img = document.createElement("img");
      img.className = "cw-package-select-thumb";
      img.src = item.src;
      img.alt = item.alt;
      img.loading = "lazy";
      img.decoding = "async";
      thumb.appendChild(img);
      if (outOfStock) {
        const banner = document.createElement("span");
        banner.className = "cw-package-select-oos-banner";
        banner.textContent = OUT_OF_STOCK_BANNER_LABEL;
        banner.setAttribute("aria-hidden", "true");
        thumb.appendChild(banner);
      }
      const body = document.createElement("span");
      body.className = "cw-package-select-copy";
      const title = document.createElement("span");
      title.className = "cw-package-select-title";
      title.textContent = renderedTitle;
      body.appendChild(title);
      const rule = document.createElement("span");
      rule.className = "cw-package-select-rule";
      rule.setAttribute("aria-hidden", "true");
      const ruleL = document.createElement("span");
      ruleL.className = "cw-package-select-rule-line";
      const ruleDots = document.createElement("span");
      ruleDots.className = "cw-package-select-rule-dots";
      ruleDots.textContent = "· · ·";
      const ruleR = document.createElement("span");
      ruleR.className = "cw-package-select-rule-line";
      rule.append(ruleL, ruleDots, ruleR);
      body.appendChild(rule);
      if (item.offer && item.offer.trim() !== "") {
        const panel = document.createElement("span");
        panel.className = "cw-package-select-offer-panel";
        const offer = document.createElement("span");
        offer.className = "cw-package-select-offer";
        let offerStr = interpolateAll(item.offer, context, userInput, debug);
        if (tier === "silver") {
          offerStr = offerStr.replace(/\s*→\s*/g, " = ").replace(/\s*->\s*/g, " = ");
        }
        setOfferText(offer, offerStr);
        panel.appendChild(offer);
        body.appendChild(panel);
      }
      const clip = document.createElement("span");
      clip.className = "cw-package-select-clip";
      clip.appendChild(thumb);
      clip.appendChild(body);
      if (availabilityCount !== void 0) {
        const availability = document.createElement("span");
        availability.className = "cw-package-select-availability";
        const dot = document.createElement("span");
        dot.className = outOfStock ? "cw-availability-dot" : "cw-availability-dot cw-breathe";
        dot.setAttribute("aria-hidden", "true");
        const text = document.createElement("span");
        text.className = "cw-availability-text";
        if (outOfStock) {
          text.textContent = UNAVAILABLE_LABEL;
        } else {
          const countEl = document.createElement("strong");
          countEl.textContent = String(availabilityCount);
          const labelEl = document.createElement("span");
          labelEl.textContent = AVAILABILITY_LABEL;
          text.append(countEl, labelEl);
        }
        availability.append(dot, text);
        clip.appendChild(availability);
      }
      btn.appendChild(clip);
      if (item.mostPopular) {
        const ribbon = document.createElement("span");
        ribbon.className = "cw-package-select-ribbon";
        const badge = document.createElement("span");
        badge.className = "cw-package-select-badge";
        badge.textContent = "POPULAIRE";
        ribbon.appendChild(badge);
        btn.appendChild(ribbon);
      }
      list.appendChild(btn);
      btn.addEventListener("click", () => {
        if (outOfStock || committed || btn.disabled) return;
        committed = true;
        disableAll();
        const hasEcho = item.selectionEcho !== void 0 && String(item.selectionEcho).trim() !== "";
        const echoText = hasEcho ? interpolateAll(String(item.selectionEcho).trim(), context, userInput, debug) : renderedTitle;
        bus.emit("__renderUserEcho", echoText);
        bus.emit("__optionClick", { actions: item.actions, label: echoText, nodeId: node.id });
      });
    });
    container.appendChild(list);
  }
}
export {
  OUT_OF_STOCK_BANNER_LABEL,
  PackageSelectRenderer,
  UNAVAILABLE_LABEL
};
