import { i as interpolateAll } from "./faq-BVDEs-g4.mjs";
class ImageSelectRenderer {
  static render(node, container, context, userInput, debug, bus) {
    var _a;
    container.replaceChildren();
    if (((_a = node.media) == null ? void 0 : _a.type) !== "image_select" || !node.media.items.length) {
      return;
    }
    const items = node.media.items;
    const track = document.createElement("div");
    track.className = "cw-image-select-track";
    track.setAttribute("role", "radiogroup");
    track.setAttribute("aria-label", "Choose an option");
    const groupName = `cw-is-${Math.random().toString(36).slice(2, 11)}`;
    const radios = [];
    let committed = false;
    const disableAll = () => {
      for (const r of radios) {
        r.disabled = true;
      }
      for (const lab of track.querySelectorAll("label.cw-image-select-card")) {
        lab.classList.add("cw-image-select-card--disabled");
      }
    };
    items.forEach((item) => {
      const card = document.createElement("label");
      card.className = "cw-image-select-card";
      const img = document.createElement("img");
      img.className = "cw-image-select-img";
      img.src = item.src;
      img.alt = item.alt;
      img.loading = "lazy";
      img.decoding = "async";
      const row = document.createElement("span");
      row.className = "cw-image-select-choice";
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = groupName;
      radio.className = "cw-image-select-radio";
      const echoSource = item.label !== void 0 && item.label.trim() !== "" ? item.label : item.alt;
      const displayLabel = interpolateAll(echoSource, context, userInput, debug);
      radio.setAttribute("aria-label", displayLabel);
      row.appendChild(radio);
      if (item.label !== void 0 && item.label.trim() !== "") {
        const cap = document.createElement("span");
        cap.className = "cw-image-select-label";
        cap.textContent = interpolateAll(item.label.trim(), context, userInput, debug);
        row.appendChild(cap);
      } else {
        row.classList.add("cw-image-select-choice--radio-only");
      }
      card.appendChild(img);
      card.appendChild(row);
      track.appendChild(card);
      radios.push(radio);
      radio.addEventListener("change", () => {
        if (committed || !radio.checked) return;
        committed = true;
        disableAll();
        bus.emit("__renderUserEcho", displayLabel);
        bus.emit("__optionClick", { actions: item.actions, label: displayLabel, nodeId: node.id });
      });
    });
    container.appendChild(track);
  }
}
export {
  ImageSelectRenderer
};
