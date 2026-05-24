const CONTEXT_BINDING_REGEX = /\{\{context\.([a-zA-Z0-9_.]+)\}\}/g;
function contextBindingReplaceRegex() {
  return new RegExp(CONTEXT_BINDING_REGEX.source, "g");
}
function extractContextKeysFromTemplate(template) {
  if (!template) return [];
  return [...template.matchAll(new RegExp(CONTEXT_BINDING_REGEX.source, "g"))].map((m) => m[1]);
}
function interpolateContext(template, context, debug = false) {
  if (!template) return "";
  return template.replace(contextBindingReplaceRegex(), (match, path2) => {
    const value = path2.split(".").reduce((obj, k) => obj == null ? void 0 : obj[k], context);
    if ((value === void 0 || value === "") && debug) {
      console.warn(
        `[ChatWidget] Template variable "${match}" resolved to empty. Did you call setContext()?`
      );
    }
    return String(value != null ? value : "");
  });
}
function interpolateInput(template, userInput) {
  if (!template) return "";
  return template.replace(/\{\{input\}\}/g, userInput);
}
function interpolateAll(template, context, userInput, debug = false) {
  let result = interpolateContext(template, context, debug);
  if (userInput !== void 0) {
    result = interpolateInput(result, userInput);
  }
  return result;
}
const M3U8_RE = /\.m3u8(\?|#|$)/i;
function isHlsUrl(src) {
  return M3U8_RE.test(src);
}
function prefersNativeHls(video) {
  return Boolean(video.canPlayType("application/vnd.apple.mpegurl"));
}
function bindVideoPlayback(video, src) {
  if (!isHlsUrl(src)) {
    video.src = src;
    return;
  }
  if (prefersNativeHls(video)) {
    video.src = src;
    return;
  }
  void import("./hlsPlayback-BZOA7Glp.mjs").then((m) => m.attachHlsToVideo(video, src)).catch(() => {
    video.src = src;
  });
}
function videoPreloadForSrc(video, src) {
  if (isHlsUrl(src) && !prefersNativeHls(video)) {
    return "auto";
  }
  return "metadata";
}
function appendCarouselSlideContent(item, fig, context, userInput, debug) {
  if (item.kind === "video") {
    const video = document.createElement("video");
    video.className = "cw-carousel-video";
    video.controls = true;
    video.playsInline = true;
    video.preload = videoPreloadForSrc(video, item.src);
    video.setAttribute("aria-label", item.alt);
    if (item.poster) {
      video.poster = item.poster;
    }
    bindVideoPlayback(video, item.src);
    fig.appendChild(video);
  } else {
    const img = document.createElement("img");
    img.className = "cw-carousel-img";
    img.src = item.src;
    img.alt = item.alt || "";
    img.loading = "lazy";
    fig.appendChild(img);
  }
  if (item.caption) {
    const cap = document.createElement("figcaption");
    cap.className = "cw-carousel-caption";
    cap.textContent = interpolateAll(item.caption, context, userInput, debug);
    fig.appendChild(cap);
  }
}
function createInlineVideoElement(item, className) {
  const video = document.createElement("video");
  video.className = className;
  video.controls = true;
  video.playsInline = true;
  video.preload = videoPreloadForSrc(video, item.src);
  video.setAttribute("aria-label", item.alt);
  if (item.poster) {
    video.poster = item.poster;
  }
  bindVideoPlayback(video, item.src);
  return video;
}
const NS = "http://www.w3.org/2000/svg";
function path(d) {
  const p = document.createElementNS(NS, "path");
  p.setAttribute("d", d);
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", "currentColor");
  p.setAttribute("stroke-width", "2");
  p.setAttribute("stroke-linecap", "round");
  p.setAttribute("stroke-linejoin", "round");
  return p;
}
function circle(cx, cy, r) {
  const c = document.createElementNS(NS, "circle");
  c.setAttribute("cx", cx);
  c.setAttribute("cy", cy);
  c.setAttribute("r", r);
  c.setAttribute("fill", "none");
  c.setAttribute("stroke", "currentColor");
  c.setAttribute("stroke-width", "2");
  return c;
}
function line(x1, y1, x2, y2) {
  const l = document.createElementNS(NS, "line");
  l.setAttribute("x1", x1);
  l.setAttribute("y1", y1);
  l.setAttribute("x2", x2);
  l.setAttribute("y2", y2);
  l.setAttribute("stroke", "currentColor");
  l.setAttribute("stroke-width", "2");
  l.setAttribute("stroke-linecap", "round");
  return l;
}
function rect(x, y, width, height, rx) {
  const r = document.createElementNS(NS, "rect");
  r.setAttribute("x", x);
  r.setAttribute("y", y);
  r.setAttribute("width", width);
  r.setAttribute("height", height);
  r.setAttribute("rx", rx);
  r.setAttribute("fill", "none");
  r.setAttribute("stroke", "currentColor");
  r.setAttribute("stroke-width", "2");
  r.setAttribute("stroke-linecap", "round");
  r.setAttribute("stroke-linejoin", "round");
  return r;
}
function svgIcon(children) {
  const el = document.createElementNS(NS, "svg");
  el.setAttribute("viewBox", "0 0 24 24");
  el.setAttribute("aria-hidden", "true");
  for (const ch of children) el.appendChild(ch);
  return el;
}
function createOptionIcon(icon) {
  switch (icon) {
    case "cart":
      return svgIcon([
        circle("9", "21", "1"),
        circle("20", "21", "1"),
        path("M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6")
      ]);
    case "help":
      return svgIcon([
        circle("12", "12", "10"),
        path("M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"),
        line("12", "17", "12.01", "17")
      ]);
    case "chat":
      return svgIcon([path("M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z")]);
    case "package":
      return svgIcon([
        line("16.5", "9.4", "7.5", "4.21"),
        path("M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"),
        (() => {
          const poly = document.createElementNS(NS, "polyline");
          poly.setAttribute("points", "3.27 6.96 12 12.01 20.73 6.96");
          poly.setAttribute("fill", "none");
          poly.setAttribute("stroke", "currentColor");
          poly.setAttribute("stroke-width", "2");
          poly.setAttribute("stroke-linecap", "round");
          poly.setAttribute("stroke-linejoin", "round");
          return poly;
        })(),
        line("12", "22.08", "12", "12")
      ]);
    case "search":
      return svgIcon([
        circle("11", "11", "8"),
        line("21", "21", "16.65", "16.65")
      ]);
    case "shield_check":
      return svgIcon([
        path("M12 3l7 4v5c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V7l7-4z"),
        path("M9 12l2 2 4-4")
      ]);
    case "package_check":
      return svgIcon([
        path("M3 7l9-4 9 4-9 4-9-4z"),
        path("M3 7v10l9 4 9-4V7"),
        path("M16 14l2 2 4-4")
      ]);
    case "shield_lock":
      return svgIcon([
        path("M12 3l7 4v5c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V7l7-4z"),
        rect("9", "11", "6", "5", "1"),
        path("M10 11V9a2 2 0 1 1 4 0v2")
      ]);
    case "receipt":
      return svgIcon([
        path("M6 3l1 2 2-2 2 2 2-2 2 2 2-2 1 2v18l-1-2-2 2-2-2-2 2-2-2-2 2-1-2V3z"),
        path("M9 10h6"),
        path("M9 14h6"),
        path("M10 8c1-1 3-1 4 0")
      ]);
    case "arrow_left":
      return svgIcon([
        path("M19 12H5M12 19l-7-7 7-7")
      ]);
    default: {
      const _exhaustive = icon;
      return _exhaustive;
    }
  }
}
const FLOW_OPTION_ICON_KEYS = [
  "cart",
  "help",
  "chat",
  "package",
  "search",
  "shield_check",
  "package_check",
  "shield_lock",
  "receipt",
  "arrow_left"
];
const CW_FAQ_PIN_LOCK_ATTR = "data-cw-faq-pin-lock";
const FAQ_PIN_MARGIN_PX = 8;
function isInsideFaqSubtree(node) {
  if (!node) return false;
  const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  return Boolean(el == null ? void 0 : el.closest(".cw-faq"));
}
function setFaqPinLock(messagesArea, locked) {
  if (!messagesArea) return;
  if (locked) {
    messagesArea.setAttribute(CW_FAQ_PIN_LOCK_ATTR, "1");
  } else {
    messagesArea.removeAttribute(CW_FAQ_PIN_LOCK_ATTR);
  }
}
function isFaqPinLocked(messagesArea) {
  var _a;
  return (_a = messagesArea == null ? void 0 : messagesArea.hasAttribute(CW_FAQ_PIN_LOCK_ATTR)) != null ? _a : false;
}
function pinFaqItemToTranscriptTop(itemWrap, behavior) {
  const area = itemWrap.closest(".cw-messages");
  if (!(area instanceof HTMLElement) || !itemWrap.isConnected) return;
  const areaRect = area.getBoundingClientRect();
  const itemRect = itemWrap.getBoundingClientRect();
  const nextTop = Math.max(
    0,
    Math.min(
      Math.max(0, area.scrollHeight - area.clientHeight),
      area.scrollTop + (itemRect.top - areaRect.top) - FAQ_PIN_MARGIN_PX
    )
  );
  if (typeof area.scrollTo === "function") {
    area.scrollTo({ top: nextTop, behavior });
  } else {
    area.scrollTop = nextTop;
  }
}
function scheduleFaqExpandPin(itemWrap, panel, hasLazyCarousel) {
  const area = itemWrap.closest(".cw-messages");
  if (!(area instanceof HTMLElement)) return;
  setFaqPinLock(area, true);
  let releaseTimer = null;
  const bumpRelease = (ms) => {
    if (releaseTimer !== null) clearTimeout(releaseTimer);
    releaseTimer = setTimeout(() => {
      releaseTimer = null;
      setFaqPinLock(area, false);
    }, ms);
  };
  const pin = (behavior) => pinFaqItemToTranscriptTop(itemWrap, behavior);
  pin("auto");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => pin("smooth"));
  });
  panel.addEventListener(
    "transitionend",
    (ev) => {
      if (ev.propertyName !== "max-height") return;
      pin("auto");
      bumpRelease(hasLazyCarousel ? 1600 : 450);
    },
    { once: true }
  );
  if (hasLazyCarousel) {
    const placeholder = panel.querySelector(".cw-faq-carousel-placeholder");
    if (placeholder) {
      const mo = new MutationObserver(() => {
        pin("auto");
        bumpRelease(900);
      });
      mo.observe(placeholder, { childList: true, subtree: true });
      bumpRelease(2200);
      setTimeout(() => mo.disconnect(), 2500);
    } else {
      bumpRelease(500);
    }
  } else {
    bumpRelease(500);
  }
}
function safeDomId(nodeId, suffix) {
  return `cw-faq-${nodeId.replace(/[^a-zA-Z0-9_-]/g, "_")}-${suffix}`;
}
const FAQ_BULLET_LINE = /^\s*([•\-\*])\s+(.+)$/;
function appendFaqAnswerBody(parent, rawAnswer, context, userInput, debug) {
  var _a;
  const text = interpolateAll(rawAnswer, context, userInput, debug);
  const paragraphs = text.split(/\n\s*\n+/);
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    const lines = trimmed.split("\n");
    const significant = lines.map((l) => l.trim()).filter((l) => l.length > 0);
    const allBullets = significant.length > 0 && significant.every((l) => FAQ_BULLET_LINE.test(l));
    if (allBullets) {
      const ul = document.createElement("ul");
      ul.className = "cw-faq-answer-list";
      for (const line2 of lines) {
        const t = line2.trim();
        if (!t) continue;
        const m = t.match(FAQ_BULLET_LINE);
        if (!m) continue;
        const li = document.createElement("li");
        li.textContent = (_a = m[2]) != null ? _a : "";
        ul.appendChild(li);
      }
      parent.appendChild(ul);
    } else {
      const p = document.createElement("p");
      p.className = "cw-faq-answer-para";
      p.textContent = trimmed;
      parent.appendChild(p);
    }
  }
}
class FaqAccordionRenderer {
  static render(node, container, context = {}, userInput, debug = false) {
    var _a, _b;
    container.replaceChildren();
    if (((_a = node.media) == null ? void 0 : _a.type) !== "faq") {
      return;
    }
    const root = document.createElement("div");
    root.className = "cw-faq";
    root.setAttribute("role", "presentation");
    const items = node.media.items;
    const expandMode = (_b = node.media.expandMode) != null ? _b : "single";
    const singleOpen = expandMode === "single";
    const triggers = [];
    const panels = [];
    const itemWraps = [];
    const fallbackIcons = FLOW_OPTION_ICON_KEYS;
    const setExpanded = (index, open) => {
      const tr = triggers[index];
      const pan = panels[index];
      const itemWrap = itemWraps[index];
      if (!tr || !pan) return;
      tr.setAttribute("aria-expanded", open ? "true" : "false");
      pan.setAttribute("aria-hidden", open ? "false" : "true");
      if (open) {
        pan.classList.add("cw-faq-panel--open");
        pan.removeAttribute("inert");
      } else {
        pan.classList.remove("cw-faq-panel--open");
        pan.setAttribute("inert", "");
        const area = itemWrap == null ? void 0 : itemWrap.closest(".cw-messages");
        if (area instanceof HTMLElement) {
          setFaqPinLock(area, false);
        }
      }
      if (open && itemWrap) {
        const hasLazyCarousel = pan.querySelector(".cw-faq-carousel-placeholder") !== null;
        scheduleFaqExpandPin(itemWrap, pan, hasLazyCarousel);
      }
    };
    const closeAllExcept = (except) => {
      for (let i = 0; i < triggers.length; i++) {
        if (i !== except) {
          setExpanded(i, false);
        }
      }
    };
    items.forEach((faqItem, index) => {
      var _a2, _b2, _c, _d, _e, _f;
      const itemWrap = document.createElement("div");
      itemWrap.className = "cw-faq-item";
      const panelId = safeDomId(node.id, `panel-${index}`);
      const triggerId = safeDomId(node.id, `trigger-${index}`);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cw-faq-trigger";
      btn.id = triggerId;
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-controls", panelId);
      const iconWrap = document.createElement("span");
      iconWrap.className = "cw-faq-icon";
      iconWrap.setAttribute("aria-hidden", "true");
      const iconKey = (_a2 = faqItem.icon) != null ? _a2 : fallbackIcons[index % fallbackIcons.length];
      iconWrap.appendChild(createOptionIcon(iconKey));
      btn.appendChild(iconWrap);
      const label = document.createElement("span");
      label.className = "cw-faq-question";
      label.textContent = interpolateAll(faqItem.question, context, userInput, debug);
      btn.appendChild(label);
      const chev = document.createElement("span");
      chev.className = "cw-faq-chevron";
      chev.setAttribute("aria-hidden", "true");
      btn.appendChild(chev);
      const panel = document.createElement("div");
      panel.className = "cw-faq-panel";
      panel.id = panelId;
      panel.setAttribute("role", "region");
      panel.setAttribute("aria-labelledby", triggerId);
      panel.setAttribute("aria-hidden", "true");
      panel.setAttribute("inert", "");
      if (faqItem.answer) {
        const body = document.createElement("div");
        body.className = "cw-faq-answer-body";
        appendFaqAnswerBody(body, faqItem.answer, context, userInput, debug);
        panel.appendChild(body);
      }
      if (((_b2 = faqItem.media) == null ? void 0 : _b2.type) === "image" && ((_c = faqItem.media.items) == null ? void 0 : _c.length)) {
        const first = faqItem.media.items[0];
        const img = document.createElement("img");
        img.className = "cw-media-image cw-faq-nested-img";
        img.src = first.src;
        img.alt = first.alt || "";
        img.loading = "lazy";
        panel.appendChild(img);
        const cap = first.caption;
        if (cap) {
          const capEl = document.createElement("p");
          capEl.className = "cw-media-caption";
          capEl.textContent = interpolateAll(cap, context, userInput, debug);
          panel.appendChild(capEl);
        }
      } else if (((_d = faqItem.media) == null ? void 0 : _d.type) === "video" && ((_e = faqItem.media.items) == null ? void 0 : _e.length)) {
        const first = faqItem.media.items[0];
        const video = createInlineVideoElement(first, "cw-media-video cw-faq-nested-video");
        panel.appendChild(video);
        const cap = first.caption;
        if (cap) {
          const capEl = document.createElement("p");
          capEl.className = "cw-media-caption";
          capEl.textContent = interpolateAll(cap, context, userInput, debug);
          panel.appendChild(capEl);
        }
      } else if (((_f = faqItem.media) == null ? void 0 : _f.type) === "carousel") {
        const ph = document.createElement("div");
        ph.className = "cw-carousel-placeholder cw-faq-carousel-placeholder";
        panel.appendChild(ph);
        const layout = faqItem.media.layout;
        const rootClass = layout === "mobile" ? "cw-carousel--faq-mobile" : void 0;
        import("./carousel-DC5Decd_.mjs").then((mod) => {
          mod.CarouselRenderer.renderCarouselItems(
            faqItem.media.items,
            ph,
            context,
            userInput,
            debug,
            { ariaLabel: "Answer media", ...rootClass ? { rootClass } : {} }
          );
        }).catch((err) => {
          console.warn("[FaqAccordionRenderer] Failed to load carousel chunk", err);
        });
      }
      btn.addEventListener("click", () => {
        const isOpen = btn.getAttribute("aria-expanded") === "true";
        if (singleOpen) {
          if (isOpen) {
            setExpanded(index, false);
          } else {
            closeAllExcept(index);
            setExpanded(index, true);
          }
        } else {
          setExpanded(index, !isOpen);
        }
      });
      triggers.push(btn);
      panels.push(panel);
      itemWraps.push(itemWrap);
      itemWrap.appendChild(btn);
      itemWrap.appendChild(panel);
      root.appendChild(itemWrap);
    });
    container.appendChild(root);
  }
}
const FaqAccordionRenderer$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  FaqAccordionRenderer
}, Symbol.toStringTag, { value: "Module" }));
export {
  FaqAccordionRenderer$1 as F,
  appendCarouselSlideContent as a,
  createOptionIcon as b,
  createInlineVideoElement as c,
  isInsideFaqSubtree as d,
  extractContextKeysFromTemplate as e,
  isFaqPinLocked as f,
  interpolateAll as i
};
