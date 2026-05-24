import { a as appendCarouselSlideContent } from "./faq-BVDEs-g4.mjs";
function carouselScrollStep(track) {
  const slide = track.querySelector(".cw-carousel-slide");
  if (!slide) return Math.max(1, track.clientWidth);
  const gapRaw = getComputedStyle(track).gap || getComputedStyle(track).columnGap;
  const gap = parseFloat(gapRaw) || 10;
  return slide.getBoundingClientRect().width + gap;
}
function pickAlignMedia(track) {
  var _a;
  const trackRect = track.getBoundingClientRect();
  let best = null;
  for (const slide of track.querySelectorAll(".cw-carousel-slide")) {
    const media = slide.querySelector(".cw-carousel-img, .cw-carousel-video");
    if (!media) continue;
    const r = media.getBoundingClientRect();
    const overlap = Math.min(r.right, trackRect.right) - Math.max(r.left, trackRect.left);
    if (overlap > 0 && (!best || overlap > best.overlap)) {
      best = { el: media, overlap };
    }
  }
  return (_a = best == null ? void 0 : best.el) != null ? _a : track.querySelector(".cw-carousel-slide .cw-carousel-img, .cw-carousel-slide .cw-carousel-video");
}
function attachCarouselNav(root, track) {
  const prev = document.createElement("button");
  prev.type = "button";
  prev.className = "cw-carousel-nav cw-carousel-nav--prev";
  prev.setAttribute("aria-label", "Previous slide");
  prev.appendChild(document.createTextNode("‹"));
  const next = document.createElement("button");
  next.type = "button";
  next.className = "cw-carousel-nav cw-carousel-nav--next";
  next.setAttribute("aria-label", "Next slide");
  next.appendChild(document.createTextNode("›"));
  const trackId = track.id || `cw-carousel-track-${Math.random().toString(36).slice(2, 11)}`;
  track.id = trackId;
  prev.setAttribute("aria-controls", trackId);
  next.setAttribute("aria-controls", trackId);
  const alignNavToMedia = () => {
    const media = pickAlignMedia(track);
    const rootRect = root.getBoundingClientRect();
    if (!media || rootRect.height <= 0) {
      root.style.removeProperty("--cw-carousel-nav-top");
      return;
    }
    const mediaRect = media.getBoundingClientRect();
    const px = mediaRect.top - rootRect.top + mediaRect.height / 2;
    root.style.setProperty("--cw-carousel-nav-top", `${px}px`);
  };
  const sync = () => {
    alignNavToMedia();
    const max = track.scrollWidth - track.clientWidth;
    if (max <= 1) {
      prev.disabled = true;
      next.disabled = true;
      return;
    }
    const left = track.scrollLeft;
    prev.disabled = left <= 2;
    next.disabled = left >= max - 2;
  };
  prev.addEventListener("click", () => {
    track.scrollBy({ left: -carouselScrollStep(track), behavior: "smooth" });
  });
  next.addEventListener("click", () => {
    track.scrollBy({ left: carouselScrollStep(track), behavior: "smooth" });
  });
  track.addEventListener("scroll", sync, { passive: true });
  track.addEventListener("load", sync, true);
  const ro = new ResizeObserver(() => sync());
  ro.observe(track);
  root.appendChild(prev);
  root.appendChild(next);
  requestAnimationFrame(() => requestAnimationFrame(sync));
}
class CarouselRenderer {
  static render(node, container, context = {}, userInput, debug = false) {
    var _a, _b;
    container.replaceChildren();
    const items = ((_a = node.media) == null ? void 0 : _a.type) === "carousel" && ((_b = node.media.items) == null ? void 0 : _b.length) ? node.media.items : [];
    CarouselRenderer.renderCarouselItems(items, container, context, userInput, debug);
  }
  /**
   * Renders the horizontal scroll-snap carousel track (used by top-level carousel media and FAQ answers).
   */
  static renderCarouselItems(items, container, context = {}, userInput, debug = false, options) {
    var _a, _b;
    container.replaceChildren();
    const root = document.createElement("div");
    root.className = ["cw-carousel", (_a = options == null ? void 0 : options.rootClass) == null ? void 0 : _a.trim()].filter(Boolean).join(" ");
    root.setAttribute("role", "region");
    root.setAttribute("aria-label", (_b = options == null ? void 0 : options.ariaLabel) != null ? _b : "Media carousel");
    const track = document.createElement("div");
    track.className = "cw-carousel-track";
    if (items.length) {
      for (const item of items) {
        const fig = document.createElement("figure");
        fig.className = "cw-carousel-slide";
        appendCarouselSlideContent(item, fig, context, userInput, debug);
        track.appendChild(fig);
      }
    }
    root.appendChild(track);
    container.appendChild(root);
    if (items.length > 1) {
      root.classList.add("cw-carousel--with-nav");
      attachCarouselNav(root, track);
    }
  }
}
export {
  CarouselRenderer
};
