import { i as interpolateAll, e as extractContextKeysFromTemplate, c as createInlineVideoElement, b as createOptionIcon, d as isInsideFaqSubtree, f as isFaqPinLocked } from "./faq-BVDEs-g4.mjs";
class EventBus {
  constructor() {
    this.listeners = {};
  }
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    };
  }
  emit(event, payload) {
    if (!this.listeners[event]) return;
    for (const callback of this.listeners[event]) {
      callback(payload);
    }
  }
  clear() {
    this.listeners = {};
  }
}
const MAX_FAQ_ITEMS = 12;
const MAX_IMAGE_SELECT_ITEMS = 12;
const MAX_PACKAGE_SELECT_ITEMS = 12;
const MAX_FORM_FIELDS = 16;
const MAX_FORM_SUBMIT_MESSAGE = 512;
const MAX_FORM_FIELD_PLACEHOLDER = 256;
const MAX_FORM_FIELD_PATTERN = 256;
const MAX_FORM_FIELD_VALIDATION_MESSAGE = 2048;
const MAX_FORM_FIELD_MAXLENGTH = 512;
const MAX_CLIENT_USER_ID = 128;
const MAX_BRAND_AVATAR_URL = 2048;
const MAX_FAQ_NESTED_CAROUSEL_ITEMS = 40;
const VALID_FLOW_OPTION_ICONS = /* @__PURE__ */ new Set([
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
]);
class JsonValidator {
  constructor() {
    this.validActionTypes = /* @__PURE__ */ new Set([
      "goToNode",
      "startFlow",
      "goToFlowStart",
      "resetFlow",
      "back",
      "emitEvent",
      "openWidget",
      "closeWidget",
      "setEmbedVisible",
      "enableInput",
      "disableInput",
      "setContext",
      "wait"
    ]);
  }
  validate(config) {
    if (!config || typeof config !== "object") {
      console.warn("[JsonValidator] Config is null or not an object. Returning empty config.");
      return {};
    }
    const rawConfig = config;
    const result = { ...rawConfig };
    let hasFlows = Array.isArray(rawConfig.flows) && rawConfig.flows.length > 0;
    let hasFlowUrl = typeof rawConfig.flowUrl === "string" && rawConfig.flowUrl.length > 0;
    if (hasFlows && hasFlowUrl) {
      console.warn(
        '[JsonValidator] Both "flows" and "flowUrl" provided. ChatWidget.init() uses flowUrl for loading; inline flows in this object are still validated below.'
      );
    } else if (!hasFlows && !hasFlowUrl) {
      console.warn('[JsonValidator] Neither "flows" nor "flowUrl" provided. Widget may have no flows to execute.');
    }
    if (hasFlows) {
      result.flows = this.validateFlows(rawConfig.flows);
    }
    if (rawConfig.footerCta !== void 0 && rawConfig.footerCta !== null) {
      const fc = this.validateFooterCta(rawConfig.footerCta);
      if (fc) {
        result.footerCta = fc;
      }
    } else if (rawConfig.footerCta === null) {
      result.footerCta = null;
    }
    if (rawConfig.clientUserId !== void 0 && rawConfig.clientUserId !== null) {
      if (typeof rawConfig.clientUserId !== "string" || rawConfig.clientUserId.trim() === "") {
        console.warn("[JsonValidator] clientUserId must be a non-empty string when provided. Ignored.");
        delete result.clientUserId;
      } else {
        let cid = rawConfig.clientUserId.trim();
        if (cid.length > MAX_CLIENT_USER_ID) {
          console.warn(
            `[JsonValidator] clientUserId truncated to ${MAX_CLIENT_USER_ID} characters.`
          );
          cid = cid.slice(0, MAX_CLIENT_USER_ID);
        }
        result.clientUserId = cid;
      }
    }
    if (rawConfig.brandAvatarUrl !== void 0 && rawConfig.brandAvatarUrl !== null) {
      if (typeof rawConfig.brandAvatarUrl !== "string") {
        console.warn("[JsonValidator] brandAvatarUrl must be a string when provided. Ignored.");
        delete result.brandAvatarUrl;
      } else {
        const u = rawConfig.brandAvatarUrl.trim();
        if (u.length === 0) {
          delete result.brandAvatarUrl;
        } else if (u.length > MAX_BRAND_AVATAR_URL) {
          console.warn("[JsonValidator] brandAvatarUrl exceeds max length. Ignored.");
          delete result.brandAvatarUrl;
        } else if (!/^https:\/\//i.test(u)) {
          console.warn("[JsonValidator] brandAvatarUrl must use https:. Ignored.");
          delete result.brandAvatarUrl;
        } else {
          try {
            void new URL(u);
            result.brandAvatarUrl = u;
          } catch (e) {
            console.warn("[JsonValidator] brandAvatarUrl is not a valid URL. Ignored.");
            delete result.brandAvatarUrl;
          }
        }
      }
    }
    return result;
  }
  validateFooterCta(raw) {
    if (!raw || typeof raw !== "object") {
      console.warn("[JsonValidator] footerCta must be an object with label and actions. Ignored.");
      return void 0;
    }
    const o = raw;
    const label = o.label;
    if (typeof label !== "string" || !label.trim()) {
      console.warn("[JsonValidator] footerCta.label must be a non-empty string. Ignored.");
      return void 0;
    }
    const actions = this.validateActions("__config__", "footerCta", o.actions);
    if (actions.length === 0) {
      console.warn("[JsonValidator] footerCta.actions must contain at least one valid action. Ignored.");
      return void 0;
    }
    let icon;
    if (o.icon !== void 0 && o.icon !== null) {
      if (typeof o.icon === "string" && VALID_FLOW_OPTION_ICONS.has(o.icon)) {
        icon = o.icon;
      } else {
        console.warn(
          `[JsonValidator] footerCta has unknown icon "${String(o.icon)}". Icon omitted.`
        );
      }
    }
    const subtitle = typeof o.subtitle === "string" ? o.subtitle : void 0;
    const base = { label: label.trim(), actions };
    return icon !== void 0 ? subtitle !== void 0 ? { ...base, subtitle, icon } : { ...base, icon } : subtitle !== void 0 ? { ...base, subtitle } : base;
  }
  validateFlows(rawFlows) {
    const validFlows = [];
    const seenFlowIds = /* @__PURE__ */ new Set();
    for (const item of rawFlows) {
      if (!item || typeof item !== "object") continue;
      const rawFlow = item;
      const flowId = rawFlow.id;
      if (!flowId || typeof flowId !== "string") {
        console.warn('[JsonValidator] A flow is missing a valid "id". Dropped.');
        continue;
      }
      if (seenFlowIds.has(flowId)) {
        console.warn(`[JsonValidator] Duplicate flow ID found: "${flowId}". Dropped.`);
        continue;
      }
      const entryNodeId = rawFlow.entryNodeId;
      if (!entryNodeId || typeof entryNodeId !== "string") {
        console.warn(`[JsonValidator] Flow "${flowId}" is missing a valid "entryNodeId". Dropped.`);
        continue;
      }
      if (!Array.isArray(rawFlow.nodes)) {
        console.warn(`[JsonValidator] Flow "${flowId}" is missing a "nodes" array. Dropped.`);
        continue;
      }
      const validatedNodes = this.validateNodes(flowId, rawFlow.nodes);
      const entryExists = validatedNodes.some((n) => n.id === entryNodeId);
      if (!entryExists) {
        console.warn(`[JsonValidator] Flow "${flowId}" entryNodeId "${entryNodeId}" does not match any node in the flow. Dropped.`);
        continue;
      }
      seenFlowIds.add(flowId);
      validFlows.push({
        ...rawFlow,
        id: flowId,
        entryNodeId,
        nodes: validatedNodes
      });
    }
    return validFlows;
  }
  validateNodes(flowId, rawNodes) {
    const validNodes = [];
    const seenNodeIds = /* @__PURE__ */ new Set();
    for (const item of rawNodes) {
      if (!item || typeof item !== "object") continue;
      const rawNode = item;
      const nodeId = rawNode.id;
      if (!nodeId || typeof nodeId !== "string") {
        console.warn(`[JsonValidator] Flow "${flowId}" has a node missing a valid "id". Dropped.`);
        continue;
      }
      if (seenNodeIds.has(nodeId)) {
        console.warn(`[JsonValidator] Flow "${flowId}" has a duplicate node ID: "${nodeId}". Dropped.`);
        continue;
      }
      seenNodeIds.add(nodeId);
      const validatedNode = { ...rawNode, id: nodeId };
      if (Array.isArray(rawNode.options)) {
        validatedNode.options = rawNode.options.map((opt) => this.validateOption(flowId, nodeId, opt)).filter((o) => o != null);
      }
      if (Array.isArray(rawNode.footerLinks)) {
        validatedNode.footerLinks = rawNode.footerLinks.map((row) => this.validateFooterLink(flowId, nodeId, row)).filter((o) => o != null);
      }
      if (rawNode.input && typeof rawNode.input === "object") {
        const rawIn = rawNode.input;
        let form;
        if (rawIn.form && typeof rawIn.form === "object") {
          const formRaw = rawIn.form;
          const fieldsIn = Array.isArray(formRaw.fields) ? formRaw.fields : [];
          let fields = fieldsIn.map((f) => this.validateFormField(flowId, nodeId, f)).filter((f) => f != null);
          if (fields.length > MAX_FORM_FIELDS) {
            console.warn(
              `[JsonValidator] Flow "${flowId}" node "${nodeId}" has more than ${MAX_FORM_FIELDS} form fields; extra dropped.`
            );
            fields = fields.slice(0, MAX_FORM_FIELDS);
          }
          if (fields.length > 0) {
            const submitLabel = typeof formRaw.submitLabel === "string" && formRaw.submitLabel.trim() !== "" ? formRaw.submitLabel : void 0;
            let submitMessage;
            if (typeof formRaw.submitMessage === "string" && formRaw.submitMessage.trim() !== "") {
              const raw = formRaw.submitMessage.trim();
              if (raw.length > MAX_FORM_SUBMIT_MESSAGE) {
                console.warn(
                  `[JsonValidator] Flow "${flowId}" node "${nodeId}" submitMessage truncated to ${MAX_FORM_SUBMIT_MESSAGE} chars.`
                );
                submitMessage = raw.slice(0, MAX_FORM_SUBMIT_MESSAGE);
              } else {
                submitMessage = raw;
              }
            }
            form = { fields, ...submitLabel !== void 0 ? { submitLabel } : {}, ...submitMessage !== void 0 ? { submitMessage } : {} };
          }
        }
        const onSubmit = this.validateActions(flowId, nodeId, rawIn.onSubmit);
        if (form && onSubmit.length === 0) {
          console.warn(
            `[JsonValidator] Flow "${flowId}" node "${nodeId}" has input.form but no valid onSubmit actions; form ignored.`
          );
          form = void 0;
        }
        const validatedInput = {
          enabled: rawIn.enabled !== false,
          onSubmit
        };
        if (typeof rawIn.placeholder === "string") {
          validatedInput.placeholder = rawIn.placeholder;
        }
        if (form) {
          validatedInput.form = form;
        }
        validatedNode.input = validatedInput;
      }
      if (Array.isArray(rawNode.onEnter)) {
        validatedNode.onEnter = this.validateActions(flowId, nodeId, rawNode.onEnter);
      }
      if (Array.isArray(rawNode.onExit)) {
        validatedNode.onExit = this.validateActions(flowId, nodeId, rawNode.onExit);
      }
      if (rawNode.immediateRender === true) {
        validatedNode.immediateRender = true;
      } else {
        delete validatedNode.immediateRender;
      }
      if (rawNode.media !== void 0 && rawNode.media !== null) {
        const media = this.validateMedia(flowId, nodeId, rawNode.media);
        if (media !== void 0) {
          validatedNode.media = media;
        } else {
          delete validatedNode.media;
        }
      }
      validNodes.push(validatedNode);
    }
    return validNodes;
  }
  validateFormField(flowId, nodeId, raw) {
    if (!raw || typeof raw !== "object") {
      console.warn(
        `[JsonValidator] Flow "${flowId}" node "${nodeId}" has an invalid form field entry. Dropped.`
      );
      return null;
    }
    const o = raw;
    if (typeof o.id !== "string" || !o.id.trim()) {
      console.warn(
        `[JsonValidator] Flow "${flowId}" node "${nodeId}" has a form field without a string "id". Dropped.`
      );
      return null;
    }
    if (typeof o.label !== "string" || !o.label.trim()) {
      console.warn(
        `[JsonValidator] Flow "${flowId}" node "${nodeId}" has a form field without a string "label". Dropped.`
      );
      return null;
    }
    let type;
    if (o.type === "text" || o.type === "tel" || o.type === "email") {
      type = o.type;
    } else if (o.type != null) {
      console.warn(
        `[JsonValidator] Flow "${flowId}" node "${nodeId}" has invalid form field type "${String(o.type)}". Dropped type.`
      );
    }
    const required = o.required === true;
    const contextKey = typeof o.contextKey === "string" && o.contextKey.trim() !== "" ? o.contextKey.trim() : void 0;
    let placeholder;
    if (typeof o.placeholder === "string" && o.placeholder.trim() !== "") {
      const rawPh = o.placeholder.trim();
      if (rawPh.length > MAX_FORM_FIELD_PLACEHOLDER) {
        console.warn(
          `[JsonValidator] Flow "${flowId}" node "${nodeId}" form field placeholder truncated to ${MAX_FORM_FIELD_PLACEHOLDER} chars.`
        );
        placeholder = rawPh.slice(0, MAX_FORM_FIELD_PLACEHOLDER);
      } else {
        placeholder = rawPh;
      }
    } else if (o.placeholder != null && typeof o.placeholder !== "string") {
      console.warn(
        `[JsonValidator] Flow "${flowId}" node "${nodeId}" has form field with non-string placeholder. Omitted.`
      );
    }
    let pattern;
    if (typeof o.pattern === "string" && o.pattern.trim() !== "") {
      const rawP = o.pattern.trim();
      if (rawP.length > MAX_FORM_FIELD_PATTERN) {
        console.warn(
          `[JsonValidator] Flow "${flowId}" node "${nodeId}" form field pattern truncated to ${MAX_FORM_FIELD_PATTERN} chars.`
        );
        pattern = rawP.slice(0, MAX_FORM_FIELD_PATTERN);
      } else {
        pattern = rawP;
      }
    } else if (o.pattern != null && typeof o.pattern !== "string") {
      console.warn(
        `[JsonValidator] Flow "${flowId}" node "${nodeId}" has form field with non-string pattern. Omitted.`
      );
    }
    let validationMessage;
    if (typeof o.validationMessage === "string" && o.validationMessage.trim() !== "") {
      const rawVm = o.validationMessage.trim();
      if (rawVm.length > MAX_FORM_FIELD_VALIDATION_MESSAGE) {
        console.warn(
          `[JsonValidator] Flow "${flowId}" node "${nodeId}" form field validationMessage truncated to ${MAX_FORM_FIELD_VALIDATION_MESSAGE} chars.`
        );
        validationMessage = rawVm.slice(0, MAX_FORM_FIELD_VALIDATION_MESSAGE);
      } else {
        validationMessage = rawVm;
      }
    } else if (o.validationMessage != null && typeof o.validationMessage !== "string") {
      console.warn(
        `[JsonValidator] Flow "${flowId}" node "${nodeId}" has form field with non-string validationMessage. Omitted.`
      );
    }
    if (pattern !== void 0 && validationMessage === void 0) {
      console.warn(
        `[JsonValidator] Flow "${flowId}" node "${nodeId}" form field has "pattern" without "validationMessage". Pattern ignored.`
      );
      pattern = void 0;
    }
    if (validationMessage !== void 0 && pattern === void 0) {
      console.warn(
        `[JsonValidator] Flow "${flowId}" node "${nodeId}" form field has "validationMessage" without "pattern". Message ignored.`
      );
      validationMessage = void 0;
    }
    let maxLength;
    if (typeof o.maxLength === "number" && Number.isFinite(o.maxLength) && o.maxLength >= 1) {
      const n = Math.floor(o.maxLength);
      maxLength = Math.min(n, MAX_FORM_FIELD_MAXLENGTH);
      if (n > MAX_FORM_FIELD_MAXLENGTH) {
        console.warn(
          `[JsonValidator] Flow "${flowId}" node "${nodeId}" form field maxLength capped at ${MAX_FORM_FIELD_MAXLENGTH}.`
        );
      }
    } else if (o.maxLength != null && (typeof o.maxLength !== "number" || !Number.isFinite(o.maxLength))) {
      console.warn(
        `[JsonValidator] Flow "${flowId}" node "${nodeId}" has form field with invalid maxLength. Omitted.`
      );
    }
    return {
      id: o.id.trim(),
      label: o.label.trim(),
      ...type ? { type } : {},
      ...required ? { required: true } : {},
      ...contextKey ? { contextKey } : {},
      ...placeholder !== void 0 ? { placeholder } : {},
      ...pattern !== void 0 ? { pattern } : {},
      ...validationMessage !== void 0 ? { validationMessage } : {},
      ...maxLength !== void 0 ? { maxLength } : {}
    };
  }
  validateOption(flowId, nodeId, opt) {
    if (!opt || typeof opt !== "object") {
      console.warn(
        `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has an invalid option entry. Dropped.`
      );
      return null;
    }
    const raw = opt;
    if (typeof raw.label !== "string") {
      console.warn(
        `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has an option without a string "label". Dropped.`
      );
      return null;
    }
    let layout;
    if (raw.layout === "card" || raw.layout === "default") {
      layout = raw.layout;
    } else if (raw.layout != null) {
      console.warn(
        `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has invalid option.layout "${String(raw.layout)}". Dropped.`
      );
    }
    let icon;
    if (typeof raw.icon === "string") {
      if (VALID_FLOW_OPTION_ICONS.has(raw.icon)) {
        icon = raw.icon;
      } else {
        console.warn(
          `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has unknown option.icon "${raw.icon}". Dropped.`
        );
      }
    }
    const subtitle = typeof raw.subtitle === "string" ? raw.subtitle : void 0;
    return {
      label: raw.label,
      actions: this.validateActions(flowId, nodeId, raw.actions),
      ...layout !== void 0 ? { layout } : {},
      ...subtitle !== void 0 ? { subtitle } : {},
      ...icon !== void 0 ? { icon } : {}
    };
  }
  validateFooterLink(flowId, nodeId, row) {
    if (!row || typeof row !== "object") {
      console.warn(
        `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has an invalid footerLinks entry. Dropped.`
      );
      return null;
    }
    const raw = row;
    if (typeof raw.label !== "string" || !raw.label.trim()) {
      console.warn(
        `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has a footerLinks entry without a non-empty "label". Dropped.`
      );
      return null;
    }
    const actions = this.validateActions(flowId, nodeId, raw.actions);
    if (actions.length === 0) {
      console.warn(
        `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has a footerLinks entry with no valid actions. Dropped.`
      );
      return null;
    }
    let icon;
    if (typeof raw.icon === "string") {
      if (VALID_FLOW_OPTION_ICONS.has(raw.icon)) {
        icon = raw.icon;
      } else {
        console.warn(
          `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has unknown footerLinks icon "${raw.icon}". Icon omitted.`
        );
      }
    }
    return { label: raw.label, actions, ...icon !== void 0 ? { icon } : {} };
  }
  validateActions(flowId, nodeId, rawActions) {
    if (!Array.isArray(rawActions)) return [];
    const validActions = [];
    for (const item of rawActions) {
      if (!item || typeof item !== "object") continue;
      const rawAction = item;
      if (!rawAction.type || typeof rawAction.type !== "string" || !this.validActionTypes.has(rawAction.type)) {
        console.warn(`[JsonValidator] Node "${nodeId}" in flow "${flowId}" has an invalid action type: "${rawAction.type}". Dropped.`);
        continue;
      }
      if (rawAction.type === "wait") {
        const ms = rawAction.ms;
        if (typeof ms !== "number" || !Number.isFinite(ms) || ms < 0) {
          console.warn(
            `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has wait action with invalid ms. Dropped.`
          );
          continue;
        }
        const clamped = Math.min(6e4, Math.floor(ms));
        validActions.push({ type: "wait", ms: clamped });
        continue;
      }
      if (rawAction.type === "setEmbedVisible") {
        if (typeof rawAction.visible !== "boolean") {
          console.warn(
            `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has setEmbedVisible without boolean visible. Dropped.`
          );
          continue;
        }
        validActions.push({ type: "setEmbedVisible", visible: rawAction.visible });
        continue;
      }
      validActions.push(rawAction);
    }
    return validActions;
  }
  validateMedia(flowId, nodeId, raw) {
    if (!raw || typeof raw !== "object") {
      console.warn(`[JsonValidator] Node "${nodeId}" in flow "${flowId}" has invalid media. Dropped.`);
      return void 0;
    }
    const m = raw;
    const t = m.type;
    if (t === "image" || t === "plain_image") {
      const items = this.validateMediaItems(flowId, nodeId, m.items);
      return { type: t, items };
    }
    if (t === "carousel") {
      const items = this.validateMediaItems(flowId, nodeId, m.items);
      return { type: "carousel", items };
    }
    if (t === "video") {
      const items = this.validateMediaItems(flowId, nodeId, m.items);
      if (items.length === 0) {
        console.warn(
          `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has video media with no valid items. Dropped.`
        );
        return void 0;
      }
      let first = items[0];
      if (first.kind === "image") {
        console.warn(
          `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has video media with kind "image" on first item. Dropped.`
        );
        return void 0;
      }
      if (first.kind !== "video") {
        first = { ...first, kind: "video" };
      }
      return { type: "video", items: [first] };
    }
    if (t === "faq") {
      return this.validateFaqMedia(flowId, nodeId, m);
    }
    if (t === "image_select") {
      const items = this.validateImageSelectItems(flowId, nodeId, m.items);
      if (items.length === 0) {
        console.warn(
          `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has image_select media with no valid items. Dropped.`
        );
        return void 0;
      }
      return { type: "image_select", items };
    }
    if (t === "package_select") {
      const items = this.validatePackageSelectItems(flowId, nodeId, m.items);
      if (items.length === 0) {
        console.warn(
          `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has package_select media with no valid items. Dropped.`
        );
        return void 0;
      }
      return { type: "package_select", items };
    }
    if (t === "validation_pending") {
      return { type: "validation_pending" };
    }
    console.warn(
      `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has unsupported media.type "${String(t)}". Media dropped.`
    );
    return void 0;
  }
  validateImageSelectItems(flowId, nodeId, rawItems) {
    if (!Array.isArray(rawItems)) return [];
    const slice = rawItems.slice(0, MAX_IMAGE_SELECT_ITEMS);
    if (rawItems.length > MAX_IMAGE_SELECT_ITEMS) {
      console.warn(
        `[JsonValidator] image_select on node "${nodeId}" in flow "${flowId}" has ${rawItems.length} items; only first ${MAX_IMAGE_SELECT_ITEMS} are kept.`
      );
    }
    const out = [];
    for (const it of slice) {
      if (!it || typeof it !== "object") continue;
      const row = it;
      const src = row.src;
      const alt = row.alt;
      if (typeof src !== "string" || !src.trim()) {
        console.warn(
          `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has an image_select item without valid src. Skipped.`
        );
        continue;
      }
      if (typeof alt !== "string") {
        console.warn(
          `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has an image_select item without string alt. Skipped.`
        );
        continue;
      }
      let label;
      if (row.label !== void 0 && row.label !== null) {
        if (typeof row.label !== "string" || !row.label.trim()) {
          console.warn(
            `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has an image_select item with invalid label (use omit or non-empty string). Skipped.`
          );
          continue;
        }
        label = row.label.trim();
      }
      const actions = this.validateActions(flowId, nodeId, row.actions);
      if (actions.length === 0) {
        console.warn(
          `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has an image_select item with no valid actions. Skipped.`
        );
        continue;
      }
      const base = { src: src.trim(), alt: alt.trim(), actions };
      out.push(label !== void 0 ? { ...base, label } : base);
    }
    return out;
  }
  validatePackageSelectItems(flowId, nodeId, rawItems) {
    if (!Array.isArray(rawItems)) return [];
    const slice = rawItems.slice(0, MAX_PACKAGE_SELECT_ITEMS);
    if (rawItems.length > MAX_PACKAGE_SELECT_ITEMS) {
      console.warn(
        `[JsonValidator] package_select on node "${nodeId}" in flow "${flowId}" has ${rawItems.length} items; only first ${MAX_PACKAGE_SELECT_ITEMS} are kept.`
      );
    }
    const out = [];
    let hasMostPopular = false;
    for (const it of slice) {
      if (!it || typeof it !== "object") continue;
      const row = it;
      const src = row.src;
      const alt = row.alt;
      const title = row.title;
      if (typeof src !== "string" || !src.trim()) {
        console.warn(
          `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has a package_select item without valid src. Skipped.`
        );
        continue;
      }
      if (typeof alt !== "string" || !alt.trim()) {
        console.warn(
          `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has a package_select item without valid alt. Skipped.`
        );
        continue;
      }
      if (typeof title !== "string" || !title.trim()) {
        console.warn(
          `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has a package_select item without valid title. Skipped.`
        );
        continue;
      }
      let offer;
      if (row.offer !== void 0 && row.offer !== null) {
        if (typeof row.offer !== "string" || !row.offer.trim()) {
          console.warn(
            `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has a package_select item with invalid offer (use omit or non-empty string). Skipped.`
          );
          continue;
        }
        offer = row.offer.trim();
      }
      const actions = this.validateActions(flowId, nodeId, row.actions);
      if (actions.length === 0) {
        console.warn(
          `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has a package_select item with no valid actions. Skipped.`
        );
        continue;
      }
      let mostPopular = false;
      if (row.mostPopular === true) {
        if (!hasMostPopular) {
          mostPopular = true;
          hasMostPopular = true;
        } else {
          console.warn(
            `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has multiple package_select items with mostPopular=true. Only the first one is kept as most popular.`
          );
        }
      }
      let selectionEcho;
      if (row.selectionEcho !== void 0 && row.selectionEcho !== null) {
        if (typeof row.selectionEcho !== "string" || !row.selectionEcho.trim()) {
          console.warn(
            `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has a package_select item with invalid selectionEcho (omit or use a non-empty string). Field dropped.`
          );
        } else {
          selectionEcho = row.selectionEcho.trim();
        }
      }
      let tier;
      if (row.tier !== void 0 && row.tier !== null) {
        if (row.tier === "bronze" || row.tier === "silver" || row.tier === "gold" || row.tier === "black") {
          tier = row.tier;
        } else {
          console.warn(
            `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has a package_select item with invalid tier (use bronze | silver | gold | black). Field dropped.`
          );
        }
      }
      const item = {
        src: src.trim(),
        alt: alt.trim(),
        title: title.trim(),
        actions,
        ...offer !== void 0 ? { offer } : {},
        ...mostPopular ? { mostPopular: true } : {},
        ...selectionEcho !== void 0 ? { selectionEcho } : {},
        ...tier !== void 0 ? { tier } : {}
      };
      out.push(item);
    }
    return out;
  }
  validateMediaItems(flowId, nodeId, rawItems) {
    if (!Array.isArray(rawItems)) return [];
    const out = [];
    for (const it of rawItems) {
      if (!it || typeof it !== "object") continue;
      const row = it;
      const src = row.src;
      const alt = row.alt;
      if (typeof src !== "string" || !src.trim()) {
        console.warn(`[JsonValidator] Node "${nodeId}" in flow "${flowId}" has a media item without valid src. Skipped.`);
        continue;
      }
      if (typeof alt !== "string") {
        console.warn(`[JsonValidator] Node "${nodeId}" in flow "${flowId}" has a media item without string alt. Skipped.`);
        continue;
      }
      let kind;
      if (row.kind === "video") kind = "video";
      else if (row.kind === "image") kind = "image";
      else if (row.kind !== void 0 && row.kind !== null) {
        console.warn(
          `[JsonValidator] Node "${nodeId}" in flow "${flowId}" has a media item with invalid kind "${String(row.kind)}". Skipped.`
        );
        continue;
      }
      let poster;
      if (typeof row.poster === "string" && row.poster.trim()) {
        poster = row.poster.trim();
      }
      const base = { src: src.trim(), alt: alt.trim() };
      const withCaption = typeof row.caption === "string" ? { ...base, caption: row.caption } : base;
      const withKind = kind ? { ...withCaption, kind } : withCaption;
      out.push(poster ? { ...withKind, poster } : withKind);
    }
    return out;
  }
  validateFaqMedia(flowId, nodeId, raw) {
    const rawItems = Array.isArray(raw.items) ? raw.items : [];
    if (rawItems.length > MAX_FAQ_ITEMS) {
      console.warn(
        `[JsonValidator] FAQ media on node "${nodeId}" in flow "${flowId}" has ${rawItems.length} items; only first ${MAX_FAQ_ITEMS} are kept.`
      );
    }
    const slice = rawItems.slice(0, MAX_FAQ_ITEMS);
    const items = [];
    for (const row of slice) {
      if (!row || typeof row !== "object") continue;
      const r = row;
      const q = r.question;
      if (typeof q !== "string" || !q.trim()) {
        console.warn(`[JsonValidator] FAQ item on node "${nodeId}" in flow "${flowId}" missing valid question. Skipped.`);
        continue;
      }
      const item = { question: q.trim() };
      if (typeof r.answer === "string") {
        item.answer = r.answer;
      }
      if (typeof r.icon === "string") {
        if (VALID_FLOW_OPTION_ICONS.has(r.icon)) {
          item.icon = r.icon;
        } else {
          console.warn(
            `[JsonValidator] FAQ item on node "${nodeId}" in flow "${flowId}" has unknown icon "${r.icon}". Icon omitted.`
          );
        }
      }
      if (r.media && typeof r.media === "object") {
        const nested = this.validateFaqNestedMedia(flowId, nodeId, r.media);
        if (nested) item.media = nested;
      }
      items.push(item);
    }
    let expandMode;
    if (raw.expandMode === "single" || raw.expandMode === "multiple") {
      expandMode = raw.expandMode;
    }
    const result = { type: "faq", items };
    if (expandMode) {
      result.expandMode = expandMode;
    }
    return result;
  }
  validateFaqNestedMedia(flowId, nodeId, raw) {
    const t = raw.type;
    if (t !== "image" && t !== "carousel" && t !== "video") {
      console.warn(
        `[JsonValidator] FAQ nested media on node "${nodeId}" in flow "${flowId}" has invalid type "${String(t)}". Skipped.`
      );
      return void 0;
    }
    const rawItems = Array.isArray(raw.items) ? raw.items : [];
    if (t === "carousel" && rawItems.length > MAX_FAQ_NESTED_CAROUSEL_ITEMS) {
      console.warn(
        `[JsonValidator] FAQ nested carousel on node "${nodeId}" in flow "${flowId}" has ${rawItems.length} slides; only first ${MAX_FAQ_NESTED_CAROUSEL_ITEMS} are kept.`
      );
    }
    const cap = t === "carousel" ? MAX_FAQ_NESTED_CAROUSEL_ITEMS : 1;
    const items = this.validateMediaItems(flowId, nodeId, rawItems.slice(0, cap));
    if (t === "image" && items.length === 0) {
      return void 0;
    }
    if (t === "video") {
      if (items.length === 0) {
        return void 0;
      }
      let first = items[0];
      if (first.kind === "image") {
        console.warn(
          `[JsonValidator] FAQ nested video on node "${nodeId}" in flow "${flowId}" has kind "image" on first item. Skipped.`
        );
        return void 0;
      }
      if (first.kind !== "video") {
        first = { ...first, kind: "video" };
      }
      return { type: "video", items: [first] };
    }
    if (t === "carousel" && items.length === 0) {
      return { type: "carousel", items: [] };
    }
    if (t === "carousel") {
      let layout;
      if (raw.layout === "mobile") layout = "mobile";
      else if (raw.layout === "default") layout = "default";
      else if (raw.layout !== void 0 && raw.layout !== null) {
        console.warn(
          `[JsonValidator] FAQ nested carousel on node "${nodeId}" in flow "${flowId}" has invalid layout "${String(raw.layout)}". Omitted.`
        );
      }
      const base = { type: "carousel", items };
      return layout ? { ...base, layout } : base;
    }
    return { type: t, items };
  }
}
class FlowRouter {
  constructor(flows) {
    this.nodeIndex = /* @__PURE__ */ new Map();
    this.flowEntries = /* @__PURE__ */ new Map();
    this.indexFlows(flows);
  }
  indexFlows(flows) {
    for (const flow of flows) {
      if (this.flowEntries.has(flow.id)) continue;
      this.flowEntries.set(flow.id, flow.entryNodeId);
      flow.nodes.forEach((node) => {
        this.nodeIndex.set(`${flow.id}::${node.id}`, node);
      });
    }
  }
  getEntryNode(flowId) {
    const entryNodeId = this.flowEntries.get(flowId);
    if (!entryNodeId) return void 0;
    return this.getNode(flowId, entryNodeId);
  }
  getNode(flowId, nodeId) {
    return this.nodeIndex.get(`${flowId}::${nodeId}`);
  }
  hasFlow(flowId) {
    return this.flowEntries.has(flowId);
  }
  getAllFlowIds() {
    return Array.from(this.flowEntries.keys());
  }
}
const SCHEMA_VERSION = 2;
class StateManager {
  // 80 KB
  constructor(consumerStorageKey, debug = false) {
    this.debug = debug;
    this.inMemoryStore = null;
    this.SIZE_LIMIT = 80 * 1024;
    this.consumerStorageKey = consumerStorageKey;
    this.storageKey = `cw_${consumerStorageKey}_state`;
    try {
      const testKey = "__cw_test__";
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
    } catch (e) {
      this.inMemoryStore = /* @__PURE__ */ new Map();
    }
  }
  getItem(key) {
    if (this.inMemoryStore) {
      return this.inMemoryStore.get(key) || null;
    }
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }
  setItem(key, value) {
    if (this.inMemoryStore) {
      this.inMemoryStore.set(key, value);
      return;
    }
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
    }
  }
  removeItem(key) {
    if (this.inMemoryStore) {
      this.inMemoryStore.delete(key);
      return;
    }
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
    }
  }
  getDefaultState() {
    return {
      version: SCHEMA_VERSION,
      activeFlowId: null,
      activeNodeId: null,
      flowStack: [],
      history: [],
      transcript: [],
      context: {},
      inputEnabled: true,
      isOpen: false
    };
  }
  save(data) {
    const stateToSave = { ...data, version: SCHEMA_VERSION, lastSeenAt: Date.now() };
    let serialized = JSON.stringify(stateToSave);
    if (serialized.length > this.SIZE_LIMIT) {
      let prunedState = {
        ...stateToSave,
        history: stateToSave.history.slice(-20)
      };
      serialized = JSON.stringify(prunedState);
      if (serialized.length > this.SIZE_LIMIT) {
        const transcript = [...prunedState.transcript];
        while (transcript.length > 30) {
          transcript.shift();
          prunedState = { ...prunedState, transcript: [...transcript] };
          serialized = JSON.stringify(prunedState);
          if (serialized.length <= this.SIZE_LIMIT) break;
        }
      }
      if (serialized.length > this.SIZE_LIMIT) {
        const fallbackTranscript = prunedState.transcript.slice(-10);
        serialized = JSON.stringify({ ...prunedState, transcript: fallbackTranscript });
      }
    }
    this.setItem(this.storageKey, serialized);
  }
  restore() {
    if (this.debug) {
      console.log(
        `[ChatWidget] restore() using storageKey: '${this.consumerStorageKey}'`
      );
    }
    const serialized = this.getItem(this.storageKey);
    if (!serialized) {
      return this.getDefaultState();
    }
    try {
      const parsed = JSON.parse(serialized);
      if (parsed.version !== SCHEMA_VERSION) {
        const storedVersion = parsed.version === void 0 || parsed.version === null ? "unknown" : String(parsed.version);
        console.warn(
          `[ChatWidget] Stored state schema mismatch (stored: ${storedVersion}, current: ${SCHEMA_VERSION}). Starting fresh. If this is unexpected, ensure storageKey is consistent across pages.`
        );
        return this.getDefaultState();
      }
      return {
        ...this.getDefaultState(),
        ...parsed
      };
    } catch (e) {
      return this.getDefaultState();
    }
  }
  clear() {
    this.removeItem(this.storageKey);
  }
}
class ActionProcessor {
  constructor(router, bus, state, debug = false) {
    this.router = router;
    this.bus = bus;
    this.state = state;
    this.debug = debug;
  }
  process(action, context) {
    var _a, _b, _c;
    switch (action.type) {
      case "goToNode": {
        const flowId = (_a = action.flowId) != null ? _a : context.activeFlowId;
        const node = this.router.getNode(flowId, action.nodeId);
        if (!node) {
          console.warn(`[ActionProcessor] goToNode: Node "${action.nodeId}" in flow "${flowId}" not found.`);
          return;
        }
        this.bus.emit("__goToNode", { nodeId: action.nodeId, flowId });
        break;
      }
      case "startFlow": {
        const node = this.router.getEntryNode(action.flowId);
        if (!node) {
          console.warn(`[ActionProcessor] startFlow: Flow "${action.flowId}" not found or lacks an entry node.`);
          return;
        }
        this.bus.emit("__startFlow", { flowId: action.flowId });
        break;
      }
      case "goToFlowStart": {
        this.bus.emit("__goToFlowStart", { flowId: action.flowId });
        break;
      }
      case "resetFlow": {
        this.bus.emit("__resetFlow");
        break;
      }
      case "back": {
        this.bus.emit("__back");
        break;
      }
      case "emitEvent": {
        this.bus.emit(action.eventName, action.payload);
        break;
      }
      case "openWidget": {
        this.bus.emit("__open");
        break;
      }
      case "closeWidget": {
        this.bus.emit("__close");
        break;
      }
      case "setEmbedVisible": {
        this.bus.emit("__setEmbedChromeVisible", { visible: action.visible });
        break;
      }
      case "enableInput": {
        const fc = (_b = context.flowContext) != null ? _b : {};
        const placeholder = action.placeholder != null ? interpolateAll(action.placeholder, fc, context.userInput, this.debug) : void 0;
        this.bus.emit("__enableInput", { placeholder });
        break;
      }
      case "disableInput": {
        this.bus.emit("__disableInput");
        break;
      }
      case "setContext": {
        const data = { ...action.data };
        for (const key in data) {
          if (typeof data[key] === "string" && data[key].includes("{{input}}")) {
            data[key] = data[key].replace(/\{\{input\}\}/g, (_c = context.userInput) != null ? _c : "");
          }
        }
        this.bus.emit("__setContext", { data });
        break;
      }
      default: {
        console.warn(`[ActionProcessor] Unknown action type`);
        break;
      }
    }
  }
}
class ConversationEngine {
  constructor(router, actionProcessor, state, bus, typingDelayMs = 0, debug = false) {
    this.router = router;
    this.actionProcessor = actionProcessor;
    this.state = state;
    this.bus = bus;
    this.typingDelayMs = typingDelayMs;
    this.debug = debug;
    this.activeFlowId = null;
    this.activeNodeId = null;
    this.history = [];
    this.flowStack = [];
    this.context = {};
    this.isTransitioning = false;
    this.pendingTypingTimer = null;
    this.pendingWaitTimer = null;
    this.renderGeneration = 0;
    this.restoreHydrationRender = false;
    this.isResumeFastForward = false;
    this.restoreState();
    this.bus.on("__goToNode", (payload) => this.goToNode(payload.nodeId, payload.flowId));
    this.bus.on("__startFlow", (payload) => this.startFlow(payload.flowId));
    this.bus.on("__goToFlowStart", (payload) => this.goToFlowStart(payload.flowId));
    this.bus.on("__resetFlow", () => this.resetFlow());
    this.bus.on("__back", () => this.back());
    this.bus.on("__processInput", (payload) => this.processInput(payload.text));
    this.bus.on(
      "__processFormSubmit",
      (payload) => this.processFormSubmit((payload == null ? void 0 : payload.values) && typeof payload.values === "object" ? payload.values : {})
    );
    this.bus.on("__optionClick", (payload) => this.processOptionClick(payload.actions, payload.nodeId));
    this.bus.on("__setContext", (payload) => {
      this.context = payload.replace ? { ...payload.data } : { ...this.context, ...payload.data };
      this.saveState();
      this.bus.emit("contextUpdated", { context: this.context });
    });
  }
  restoreState() {
    const currentState = this.state.restore();
    this.activeFlowId = currentState.activeFlowId;
    this.activeNodeId = currentState.activeNodeId;
    this.history = [...currentState.history];
    this.flowStack = [...currentState.flowStack];
    this.context = { ...currentState.context };
  }
  hasRestorableSession() {
    return Boolean(this.activeFlowId && this.activeNodeId);
  }
  resumeSession() {
    if (!this.activeFlowId || !this.activeNodeId) return false;
    const node = this.router.getNode(this.activeFlowId, this.activeNodeId);
    if (!node) return false;
    const persisted = this.state.restore();
    const hydratedEntries = [];
    for (const entry of persisted.transcript) {
      if (entry.kind !== "bot") {
        hydratedEntries.push(entry);
        continue;
      }
      const botNode = this.router.getNode(entry.flowId, entry.nodeId);
      if (!botNode) continue;
      hydratedEntries.push({ ...entry, node: botNode });
    }
    const historyEntries = hydratedEntries.filter((entry) => {
      if (entry.kind !== "bot") return true;
      return !(entry.flowId === this.activeFlowId && entry.nodeId === this.activeNodeId);
    });
    this.restoreHydrationRender = true;
    try {
      this.bus.emit("__transcriptReplayStart");
      this.bus.emit("__hydrateTranscript", {
        entries: historyEntries,
        context: this.context
      });
      this.renderNode(node, this.activeFlowId, { immediate: true, hydrate: true });
    } finally {
      this.restoreHydrationRender = false;
      this.bus.emit("__transcriptReplayEnd");
    }
    this.fastForwardAutoChainFromActiveNode();
    return true;
  }
  saveState() {
    const currentState = this.state.restore();
    const sessionOwnerRaw = this.context.cwSessionUserId;
    const sessionOwnerId = typeof sessionOwnerRaw === "string" ? sessionOwnerRaw.trim() : sessionOwnerRaw != null && (typeof sessionOwnerRaw === "number" || typeof sessionOwnerRaw === "boolean") ? String(sessionOwnerRaw).trim() : "";
    this.state.save({
      ...currentState,
      activeFlowId: this.activeFlowId,
      activeNodeId: this.activeNodeId,
      history: this.history,
      flowStack: this.flowStack,
      context: this.context,
      sessionOwnerId: sessionOwnerId || void 0
    });
  }
  pushHistory(flowId, nodeId) {
    this.history.push({ flowId, nodeId, timestamp: Date.now() });
  }
  /**
   * Sets a fresh flow stack (single entry) and clears breadcrumb history. Each call establishes
   * the active flow from its entry node; `back()` only traverses history created after this call.
   */
  startFlow(flowId) {
    if (this.isTransitioning) {
      console.warn(`[ChatWidget] startFlow("${flowId}") ignored — transition in progress`);
      return;
    }
    this.isTransitioning = true;
    try {
      this.clearPendingWait();
      if (this.activeFlowId && this.activeNodeId) {
        const currentNode = this.router.getNode(this.activeFlowId, this.activeNodeId);
        if (currentNode) this.exitNode(currentNode, this.activeFlowId);
      }
      const node = this.router.getEntryNode(flowId);
      if (!node) {
        console.warn(`[ChatWidget] startFlow: Flow "${flowId}" not found or has no entry node.`);
        return;
      }
      this.activeFlowId = flowId;
      this.activeNodeId = node.id;
      this.flowStack = [{ flowId, nodeId: node.id }];
      this.history = [];
      this.pushHistory(flowId, node.id);
      this.saveState();
      this.bus.emit("flowStarted", { flowId });
      this.renderNode(node, flowId);
    } finally {
      this.isTransitioning = false;
    }
  }
  /**
   * Updates persisted `activeFlowId` and `activeNodeId` before rendering so stored state always
   * matches the node about to be shown (including cross-flow navigation).
   */
  goToNode(nodeId, flowId) {
    const targetFlowId = flowId != null ? flowId : this.activeFlowId;
    if (!targetFlowId) return;
    if (this.isTransitioning) {
      console.warn(
        `[ChatWidget] goToNode("${nodeId}"${flowId !== void 0 ? `, "${flowId}"` : ""}) ignored — transition in progress`
      );
      return;
    }
    this.isTransitioning = true;
    try {
      this.clearPendingWait();
      if (this.activeFlowId && this.activeNodeId) {
        const currentNode = this.router.getNode(this.activeFlowId, this.activeNodeId);
        if (currentNode) this.exitNode(currentNode, this.activeFlowId);
      }
      const node = this.router.getNode(targetFlowId, nodeId);
      if (!node) {
        console.warn(`[ChatWidget] goToNode: Node "${nodeId}" not found in flow "${targetFlowId}"`);
        return;
      }
      this.activeFlowId = targetFlowId;
      this.activeNodeId = nodeId;
      this.pushHistory(targetFlowId, nodeId);
      this.saveState();
      this.renderNode(node, targetFlowId);
      this.bus.emit("flowNavigated", { nodeId, flowId: targetFlowId, source: "api" });
    } finally {
      this.isTransitioning = false;
    }
  }
  resetFlow() {
    if (this.isTransitioning) {
      console.warn("[ChatWidget] resetFlow() ignored — transition in progress");
      return;
    }
    if (this.activeFlowId) {
      this.startFlow(this.activeFlowId);
    }
  }
  back() {
    if (this.history.length <= 1) return;
    this.clearPendingWait();
    if (this.activeFlowId && this.activeNodeId) {
      const currentNode = this.router.getNode(this.activeFlowId, this.activeNodeId);
      if (currentNode) this.exitNode(currentNode, this.activeFlowId);
    }
    this.history.pop();
    const prev = this.history[this.history.length - 1];
    this.activeFlowId = prev.flowId;
    this.activeNodeId = prev.nodeId;
    this.saveState();
    const node = this.router.getNode(this.activeFlowId, this.activeNodeId);
    if (!node) return;
    this.bus.emit("flowNavigated", { nodeId: prev.nodeId, flowId: prev.flowId, source: "back" });
    this.renderNode(node, prev.flowId);
  }
  goToFlowStart(flowId) {
    if (this.isTransitioning) {
      console.warn(`[ChatWidget] goToFlowStart("${flowId}") ignored — transition in progress`);
      return;
    }
    this.startFlow(flowId);
  }
  clearSession() {
    this.clearPendingTyping();
    this.clearPendingWait();
    this.activeFlowId = null;
    this.activeNodeId = null;
    this.history = [];
    this.flowStack = [];
    this.context = {};
  }
  processInput(text) {
    var _a;
    if (!this.activeFlowId || !this.activeNodeId) return;
    const node = this.router.getNode(this.activeFlowId, this.activeNodeId);
    if (!node) return;
    if ((_a = node.input) == null ? void 0 : _a.form) {
      return;
    }
    if (node.input && node.input.onSubmit) {
      this.executeActions(node.input.onSubmit, text);
    }
  }
  /** Multi-field `input.form`: merges values into context, then runs `onSubmit` actions. */
  processFormSubmit(values) {
    var _a, _b, _c, _d, _e, _f;
    if (!this.activeFlowId || !this.activeNodeId) return;
    const node = this.router.getNode(this.activeFlowId, this.activeNodeId);
    if (!((_c = (_b = (_a = node == null ? void 0 : node.input) == null ? void 0 : _a.form) == null ? void 0 : _b.fields) == null ? void 0 : _c.length) || !((_d = node.input.onSubmit) == null ? void 0 : _d.length)) return;
    const data = {};
    for (const field of node.input.form.fields) {
      const key = (_e = field.contextKey) != null ? _e : field.id;
      data[key] = ((_f = values[field.id]) != null ? _f : "").trim();
    }
    this.context = { ...this.context, ...data };
    this.saveState();
    this.bus.emit("contextUpdated", { context: this.context });
    this.executeActions(node.input.onSubmit);
  }
  processOptionClick(actions, nodeId) {
    if (!this.activeFlowId) return;
    this.executeActions(actions);
  }
  executeActions(actions, userInput, options) {
    if (!this.activeFlowId || !this.activeNodeId) return;
    this.clearPendingWait();
    this.runActionSlice(actions, 0, userInput, (options == null ? void 0 : options.resumeMode) === true);
  }
  /**
   * Runs actions in order; `wait` defers the rest of the list until after `ms` (clamped 0–60_000).
   */
  runActionSlice(actions, startIndex, userInput, resumeMode = false) {
    if (!this.activeFlowId || !this.activeNodeId) return;
    for (let i = startIndex; i < actions.length; i++) {
      const action = actions[i];
      if (action.type === "wait") {
        const raw = action.ms;
        const ms = typeof raw === "number" && Number.isFinite(raw) ? Math.max(0, Math.min(6e4, Math.floor(raw))) : 0;
        const next = i + 1;
        if (resumeMode || ms <= 0) {
          continue;
        }
        this.pendingWaitTimer = setTimeout(() => {
          this.pendingWaitTimer = null;
          this.runActionSlice(actions, next, userInput, resumeMode);
        }, ms);
        return;
      }
      this.actionProcessor.process(action, {
        activeFlowId: this.activeFlowId,
        activeNodeId: this.activeNodeId,
        userInput,
        flowContext: this.context
      });
    }
  }
  getState() {
    const s = this.state.restore();
    return {
      activeFlowId: s.activeFlowId,
      activeNodeId: s.activeNodeId,
      history: s.history.map((h) => ({ flowId: h.flowId, nodeId: h.nodeId })),
      isOpen: s.isOpen,
      inputEnabled: s.inputEnabled
    };
  }
  clearPendingTyping() {
    if (this.pendingTypingTimer !== null) {
      clearTimeout(this.pendingTypingTimer);
      this.pendingTypingTimer = null;
    }
  }
  clearPendingWait() {
    if (this.pendingWaitTimer !== null) {
      clearTimeout(this.pendingWaitTimer);
      this.pendingWaitTimer = null;
    }
  }
  nodeWaitsForUser(node) {
    var _a, _b, _c, _d;
    if (node.terminal) return true;
    if (Array.isArray(node.options) && node.options.length > 0) return true;
    if ((_c = (_b = (_a = node.input) == null ? void 0 : _a.form) == null ? void 0 : _b.fields) == null ? void 0 : _c.length) return true;
    return ((_d = node.input) == null ? void 0 : _d.enabled) === true;
  }
  fastForwardAutoChainFromActiveNode(maxSteps = 20) {
    var _a;
    this.isResumeFastForward = true;
    let steps = 0;
    try {
      while (steps < maxSteps && this.activeFlowId && this.activeNodeId) {
        const node = this.router.getNode(this.activeFlowId, this.activeNodeId);
        if (!node) break;
        if (this.nodeWaitsForUser(node)) break;
        if (!((_a = node.onEnter) == null ? void 0 : _a.length)) break;
        const beforeFlowId = this.activeFlowId;
        const beforeNodeId = this.activeNodeId;
        this.executeActions(node.onEnter, void 0, { resumeMode: true });
        steps += 1;
        if (this.activeFlowId === beforeFlowId && this.activeNodeId === beforeNodeId) {
          break;
        }
      }
      this.saveState();
    } finally {
      this.isResumeFastForward = false;
    }
  }
  warnMissingContextKeysForRender(node) {
    if (!this.debug || !node.message) return;
    const paths = extractContextKeysFromTemplate(node.message);
    const seen = /* @__PURE__ */ new Set();
    for (const path of paths) {
      if (seen.has(path)) continue;
      seen.add(path);
      const value = path.split(".").reduce((obj, k) => obj == null ? void 0 : obj[k], this.context);
      if (value !== void 0) continue;
      console.warn(
        `[ChatWidget] Node '${node.id}' uses {{context.${path}}} but that key is not in context. Call setContext() before startFlow(). Current context: ${JSON.stringify(this.context)}`
      );
    }
  }
  emitRenderAndFollowup(node, flowId, options) {
    this.warnMissingContextKeysForRender(node);
    this.bus.emit("__render", { node, context: this.context, debug: this.debug, flowId });
    if (node.terminal && !this.restoreHydrationRender && !(options == null ? void 0 : options.hydrate)) {
      this.bus.emit("flowCompleted", { flowId });
    }
    const onEnter = node.onEnter;
    if (!(onEnter == null ? void 0 : onEnter.length) || this.restoreHydrationRender || (options == null ? void 0 : options.hydrate) || this.isResumeFastForward) return;
    const enterFlowId = flowId;
    const enterNodeId = node.id;
    queueMicrotask(() => {
      if (this.activeFlowId !== enterFlowId || this.activeNodeId !== enterNodeId) return;
      this.executeActions(onEnter);
    });
  }
  renderNode(node, flowId, options) {
    if (node.terminal) {
      this.bus.emit("__disableInput");
    }
    this.clearPendingTyping();
    this.renderGeneration += 1;
    const generation = this.renderGeneration;
    this.bus.emit("nodeEntered", { nodeId: node.id, flowId });
    const immediate = Boolean(this.isResumeFastForward || (options == null ? void 0 : options.immediate) || node.immediateRender);
    const delay = immediate || this.typingDelayMs <= 0 ? 0 : this.typingDelayMs;
    if (delay === 0) {
      this.emitRenderAndFollowup(node, flowId, options);
      return;
    }
    this.bus.emit("__typingStart", {});
    this.pendingTypingTimer = setTimeout(() => {
      this.pendingTypingTimer = null;
      if (generation !== this.renderGeneration) return;
      this.emitRenderAndFollowup(node, flowId, options);
    }, delay);
  }
  exitNode(node, flowId) {
    if (node.onExit) {
      this.executeActions(node.onExit);
    }
  }
}
const BUNDLED_BOT_AVATAR_URL = new URL(
  /* @vite-ignore */
  "bot-avatar.png",
  import.meta.url
).href;
function createBotAvatarElement(avatarSrc) {
  const img = document.createElement("img");
  img.className = "cw-bot-avatar";
  img.src = avatarSrc;
  img.alt = "";
  img.setAttribute("aria-hidden", "true");
  img.decoding = "async";
  img.width = 32;
  img.height = 32;
  return img;
}
function createTypingDotsElement() {
  const container = document.createElement("div");
  container.className = "cw-typing-indicator";
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("span");
    dot.className = "cw-typing-dot";
    container.appendChild(dot);
  }
  return container;
}
class MessageRenderer {
  constructor(bus, avatarSrc) {
    this.bus = bus;
    this.avatarSrc = avatarSrc;
  }
  /**
   * Renders a bot message. When both `message` and `media.type === "faq"` are set,
   * returns a `DocumentFragment` with two bubbles (intro text, then FAQ) so the accordion
   * is not nested inside the same container as the intro copy.
   */
  renderMessage(node, container, context = {}, userInput, debug = false) {
    var _a, _b, _c, _d, _e, _f;
    if (((_a = node.media) == null ? void 0 : _a.type) === "faq" && node.message) {
      return this.renderFaqWithIntro(node, context, userInput, debug);
    }
    const wrapper = document.createElement("div");
    wrapper.className = "cw-message";
    if (((_b = node.media) == null ? void 0 : _b.type) === "faq") {
      wrapper.classList.add("cw-message--faq-only");
    } else if (((_c = node.media) == null ? void 0 : _c.type) === "image_select" && !node.message) {
      wrapper.classList.add("cw-message--image-select-only");
    } else if (((_d = node.media) == null ? void 0 : _d.type) === "package_select" && !node.message) {
      wrapper.classList.add("cw-message--package-select-only");
    } else if (((_e = node.media) == null ? void 0 : _e.type) === "plain_image" && !node.message) {
      wrapper.classList.add("cw-message--plain-image");
    } else if (((_f = node.media) == null ? void 0 : _f.type) === "validation_pending") {
      wrapper.classList.add("cw-message--validation-pending");
    }
    if (node.message) {
      const textEl = document.createElement("p");
      textEl.className = "cw-message-text";
      this.setMessageParagraphText(textEl, interpolateAll(node.message, context, userInput, debug));
      wrapper.appendChild(textEl);
    }
    this.appendMedia(node, wrapper, context, userInput, debug, this.bus);
    if (wrapper.classList.contains("cw-message--faq-only")) {
      return wrapper;
    }
    return this.wrapBotRow(wrapper);
  }
  wrapBotRow(bubble) {
    const row = document.createElement("div");
    row.className = "cw-message-row";
    row.appendChild(createBotAvatarElement(this.avatarSrc));
    row.appendChild(bubble);
    return row;
  }
  renderFaqWithIntro(node, context, userInput, debug) {
    const frag = document.createDocumentFragment();
    const intro = document.createElement("div");
    intro.className = "cw-message";
    const textEl = document.createElement("p");
    textEl.className = "cw-message-text";
    this.setMessageParagraphText(textEl, interpolateAll(node.message, context, userInput, debug));
    intro.appendChild(textEl);
    frag.appendChild(this.wrapBotRow(intro));
    const faqShell = document.createElement("div");
    faqShell.className = "cw-message cw-message--faq-only";
    const faqPlaceholder = document.createElement("div");
    faqPlaceholder.className = "cw-faq-placeholder";
    faqShell.appendChild(faqPlaceholder);
    frag.appendChild(faqShell);
    import("./faq-BVDEs-g4.mjs").then((n) => n.F).then((module) => {
      module.FaqAccordionRenderer.render(node, faqPlaceholder, context, userInput, debug);
    }).catch((err) => {
      console.warn("[MessageRenderer] Failed to dynamically load FaqAccordionRenderer", err);
    });
    return frag;
  }
  /**
   * Renders `text` into a `<p>` using `textContent` only when there are no newlines; otherwise
   * inserts `<br>` between lines so breaks survive host-page CSS (e.g. `white-space` on `p`).
   */
  setMessageParagraphText(p, text) {
    if (!text.includes("\n")) {
      p.textContent = text;
      return;
    }
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) p.appendChild(document.createElement("br"));
      p.appendChild(document.createTextNode(lines[i]));
    }
  }
  appendMedia(node, wrapper, context, userInput, debug, bus) {
    if (!node.media) return;
    if ((node.media.type === "image" || node.media.type === "plain_image") && node.media.items && node.media.items.length > 0) {
      const img = document.createElement("img");
      img.className = "cw-media-image";
      img.src = node.media.items[0].src;
      img.alt = node.media.items[0].alt || "";
      wrapper.appendChild(img);
      const cap = node.media.items[0].caption;
      if (cap) {
        const capEl = document.createElement("p");
        capEl.className = "cw-media-caption";
        capEl.textContent = interpolateAll(cap, context, userInput, debug);
        wrapper.appendChild(capEl);
      }
    } else if (node.media.type === "video" && node.media.items && node.media.items.length > 0) {
      const first = node.media.items[0];
      const video = createInlineVideoElement(first, "cw-media-video");
      wrapper.appendChild(video);
      const cap = first.caption;
      if (cap) {
        const capEl = document.createElement("p");
        capEl.className = "cw-media-caption";
        capEl.textContent = interpolateAll(cap, context, userInput, debug);
        wrapper.appendChild(capEl);
      }
    } else if (node.media.type === "carousel") {
      const carouselPlaceholder = document.createElement("div");
      carouselPlaceholder.className = "cw-carousel-placeholder";
      wrapper.appendChild(carouselPlaceholder);
      import("./carousel-DC5Decd_.mjs").then((module) => {
        module.CarouselRenderer.render(node, carouselPlaceholder, context, userInput, debug);
      }).catch((err) => {
        console.warn("[MessageRenderer] Failed to dynamically load CarouselRenderer framework", err);
      });
    } else if (node.media.type === "image_select") {
      const ph = document.createElement("div");
      ph.className = "cw-image-select-placeholder";
      wrapper.appendChild(ph);
      import("./image-select-C-42eHjU.mjs").then((module) => {
        module.ImageSelectRenderer.render(node, ph, context, userInput, debug, bus);
      }).catch((err) => {
        console.warn("[MessageRenderer] Failed to dynamically load ImageSelectRenderer", err);
      });
    } else if (node.media.type === "package_select") {
      const ph = document.createElement("div");
      ph.className = "cw-package-select-placeholder";
      wrapper.appendChild(ph);
      import("./PackageSelectRenderer-BXkH8WNr.mjs").then((module) => {
        module.PackageSelectRenderer.render(node, ph, context, userInput, debug, bus);
      }).catch((err) => {
        console.warn("[MessageRenderer] Failed to dynamically load PackageSelectRenderer", err);
      });
    } else if (node.media.type === "faq") {
      const faqPlaceholder = document.createElement("div");
      faqPlaceholder.className = "cw-faq-placeholder";
      wrapper.appendChild(faqPlaceholder);
      import("./faq-BVDEs-g4.mjs").then((n) => n.F).then((module) => {
        module.FaqAccordionRenderer.render(node, faqPlaceholder, context, userInput, debug);
      }).catch((err) => {
        console.warn("[MessageRenderer] Failed to dynamically load FaqAccordionRenderer", err);
      });
    } else if (node.media.type === "validation_pending") {
      const pendingWrap = document.createElement("div");
      pendingWrap.className = "cw-validation-pending-indicator";
      pendingWrap.appendChild(createTypingDotsElement());
      wrapper.appendChild(pendingWrap);
    }
  }
}
const SVG_NS = "http://www.w3.org/2000/svg";
function appendCardChevron(btn) {
  const wrap = document.createElement("span");
  wrap.className = "cw-option-card-chevron";
  wrap.setAttribute("aria-hidden", "true");
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  const p = document.createElementNS(SVG_NS, "path");
  p.setAttribute("d", "M9 18l6-6-6-6");
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", "currentColor");
  p.setAttribute("stroke-width", "2");
  p.setAttribute("stroke-linecap", "round");
  p.setAttribute("stroke-linejoin", "round");
  svg.appendChild(p);
  wrap.appendChild(svg);
  btn.appendChild(wrap);
}
function fillCardOptionButton(btn, display) {
  btn.replaceChildren();
  if (display.icon) {
    const iconWrap = document.createElement("span");
    iconWrap.className = "cw-option-card-icon";
    iconWrap.appendChild(createOptionIcon(display.icon));
    btn.appendChild(iconWrap);
  }
  const body = document.createElement("span");
  body.className = "cw-option-card-body";
  const titleEl = document.createElement("span");
  titleEl.className = "cw-option-card-title";
  titleEl.textContent = display.label;
  body.appendChild(titleEl);
  if (display.subtitle) {
    const subEl = document.createElement("span");
    subEl.className = "cw-option-card-sub";
    subEl.textContent = display.subtitle;
    body.appendChild(subEl);
  }
  btn.appendChild(body);
  appendCardChevron(btn);
  btn.setAttribute(
    "aria-label",
    display.subtitle ? `${display.label}. ${display.subtitle}` : display.label
  );
}
class OptionsRenderer {
  renderOptions(options, onSelect, context = {}, userInput, debug = false) {
    const container = document.createElement("div");
    container.className = "cw-options";
    if (options.some((o) => o.layout === "card")) {
      container.classList.add("cw-options--has-card");
    }
    if (!options || options.length === 0) {
      return container;
    }
    const buttons = [];
    for (const option of options) {
      const isCard = option.layout === "card";
      const btn = document.createElement("button");
      btn.className = isCard ? "cw-option-btn cw-option-btn--card" : "cw-option-btn";
      const displayLabel = interpolateAll(option.label, context, userInput, debug);
      if (isCard) {
        const displaySubtitle = option.subtitle !== void 0 && option.subtitle !== "" ? interpolateAll(option.subtitle, context, userInput, debug) : "";
        fillCardOptionButton(btn, {
          label: displayLabel,
          ...displaySubtitle ? { subtitle: displaySubtitle } : {},
          ...option.icon ? { icon: option.icon } : {}
        });
      } else {
        btn.textContent = displayLabel;
      }
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        buttons.forEach((b) => {
          b.disabled = true;
          b.classList.add("cw-disabled");
        });
        onSelect(option.actions, displayLabel);
      });
      buttons.push(btn);
      container.appendChild(btn);
    }
    return container;
  }
  renderTypingIndicator() {
    return createTypingDotsElement();
  }
}
class InputManager {
  constructor(bus, defaultConfig) {
    this.bus = bus;
    this.defaultConfig = defaultConfig;
    this.previousState = null;
    this.flowContext = {};
    this.interpolateDebug = false;
    this.state = { ...defaultConfig };
    this.bus.on("__enableInput", (payload) => this.enable(payload == null ? void 0 : payload.placeholder));
    this.bus.on("__disableInput", () => this.disable());
    this.bus.on("__render", (payload) => {
      var _a;
      this.flowContext = (_a = payload.context) != null ? _a : {};
      this.interpolateDebug = Boolean(payload.debug);
      this.applyNodeConfig(payload.node.input, this.flowContext);
    });
  }
  enable(placeholder) {
    this.state.enabled = true;
    if (placeholder) {
      this.state.placeholder = interpolateAll(placeholder, this.flowContext, void 0, this.interpolateDebug);
    }
    this.previousState = null;
  }
  disable() {
    this.state.enabled = false;
    this.previousState = null;
  }
  setPlaceholder(text) {
    this.state.placeholder = text;
    this.previousState = null;
  }
  isEnabled() {
    return this.state.enabled;
  }
  getPlaceholder() {
    return this.state.placeholder;
  }
  applyNodeConfig(nodeInputConfig, context = {}) {
    if (nodeInputConfig !== void 0) {
      if (!this.previousState) {
        this.previousState = { ...this.state };
      }
      this.state.enabled = nodeInputConfig.enabled !== false;
      if (nodeInputConfig.placeholder) {
        this.state.placeholder = interpolateAll(
          nodeInputConfig.placeholder,
          context,
          void 0,
          this.interpolateDebug
        );
      }
    } else {
      if (this.previousState) {
        this.state = { ...this.previousState };
        this.previousState = null;
      }
    }
  }
  handleSubmit(text, context) {
    const sanitized = text.replace(/<[^>]*>?/gm, "").trim();
    if (!sanitized) return;
    this.bus.emit("messageSent", {
      text: sanitized,
      nodeId: context.activeNodeId,
      flowId: context.activeFlowId
    });
    this.bus.emit("__processInput", { text: sanitized });
  }
}
const BASE_CSS = `
@import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap');

#chat-widget-root {
  --cw-gradient-from: #7a3cff;
  --cw-gradient-to: #3f66ff;
  --cw-primary: #6b33f1;
  --cw-primary-gradient: linear-gradient(135deg, var(--cw-gradient-from) 0%, var(--cw-gradient-to) 100%);
  --cw-bg-main: radial-gradient(120% 120% at 12% 0%, rgba(122, 60, 255, 0.24) 0%, rgba(122, 60, 255, 0) 45%), radial-gradient(120% 140% at 92% 100%, rgba(63, 102, 255, 0.22) 0%, rgba(63, 102, 255, 0) 50%), linear-gradient(180deg, #1b1335 0%, #12162f 56%, #090b18 100%);
  --cw-on-primary: #ffffff;
  --cw-surface: rgba(20, 20, 40, 0.6);
  --cw-surface-elevated: rgba(30, 30, 46, 0.95);
  --cw-surface-muted: rgba(32, 36, 66, 0.78);
  --cw-glass: rgba(255, 255, 255, 0.06);
  --cw-text: #ffffff;
  --cw-text-primary: #ffffff;
  --cw-text-secondary: rgba(255, 255, 255, 0.6);
  --cw-text-muted: #94a3b8;
  --cw-border: rgba(255, 255, 255, 0.08);
  --cw-border-strong: rgba(255, 255, 255, 0.14);
  --cw-shadow: 0 24px 48px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.06), 0 0 40px rgba(107, 51, 241, 0.2);
  --cw-fab-shadow: 0 8px 32px rgba(99, 102, 241, 0.45), 0 4px 12px rgba(0, 0, 0, 0.35);
  --cw-input-bg: rgba(15, 15, 24, 0.75);
  --cw-input-border: rgba(255, 255, 255, 0.12);
  --cw-input-focus-ring: #a78bfa;
  --cw-typing-dot: #ede9fe;
  --cw-typing-dot-mid: #c4b5fd;
  --cw-typing-dot-glow: rgba(167, 139, 250, 0.85);
  --cw-user-text: #ffffff;
  --cw-send-disabled-opacity: 0.45;
  --cw-radius: 12px;
  --cw-radius-input: 8px;
  --cw-input-bar-gutter: 14px;
  --cw-radius-bubble: 13px;
  --cw-bot-bubble-bg: #f1f5f9;
  --cw-bot-bubble-text: #0f172a;
  --cw-font: "Satoshi", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --cw-z: 9999;
  --cw-width: 360px;
  /* Desktop: nearly full viewport height with a small top gap; bottom matches root inset (see bottom: max(20px, …)). */
  --cw-panel-top-clearance: 52px;
  --cw-panel-bottom-offset: max(20px, env(safe-area-inset-bottom, 0px));
  --cw-panel-fill-height: calc(100dvh - env(safe-area-inset-top, 0px) - var(--cw-panel-top-clearance) - var(--cw-panel-bottom-offset));
  --cw-panel-max-height: min(1680px, var(--cw-panel-fill-height));
  --cw-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --cw-glow: 0 0 20px rgba(168, 85, 247, 0.25);

  position: fixed;
  z-index: var(--cw-z);
  bottom: max(20px, env(safe-area-inset-bottom, 0px));
  width: var(--cw-width);
  max-width: calc(100vw - 40px - env(safe-area-inset-right, 0px) - env(safe-area-inset-left, 0px));
  font-family: var(--cw-font);
  pointer-events: none;
  box-sizing: border-box;
}

#chat-widget-root.cw-embed-hidden {
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

#chat-widget-root *,
#chat-widget-root *::before,
#chat-widget-root *::after {
  box-sizing: border-box;
}

#chat-widget-root .cw-fab {
  pointer-events: auto;
}

#chat-widget-root.cw-open .cw-panel {
  pointer-events: auto;
}

#chat-widget-root:not(.cw-open) .cw-panel,
#chat-widget-root:not(.cw-open) .cw-panel * {
  pointer-events: none !important;
}

#chat-widget-root.cw-placement-right .cw-fab,
#chat-widget-root.cw-placement-right .cw-panel {
  right: 0;
  left: auto;
}

#chat-widget-root.cw-placement-left .cw-fab,
#chat-widget-root.cw-placement-left .cw-panel {
  left: 0;
  right: auto;
}

#chat-widget-root .cw-fab {
  width: 60px;
  height: 60px;
  min-width: 60px;
  min-height: 60px;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--cw-gradient-from) 0%, var(--cw-gradient-to) 100%);
  color: var(--cw-on-primary);
  cursor: pointer;
  box-shadow: var(--cw-fab-shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  bottom: 0;
}

#chat-widget-root .cw-fab:hover {
  transform: scale(1.05) translateY(-2px);
  box-shadow: var(--cw-fab-shadow), var(--cw-glow);
}

#chat-widget-root .cw-fab:active {
  transform: scale(0.98);
}

#chat-widget-root .cw-fab:focus-visible {
  outline: 2px solid var(--cw-input-focus-ring);
  outline-offset: 3px;
  box-shadow: var(--cw-fab-shadow), 0 0 0 4px rgba(167, 139, 250, 0.35);
}

#chat-widget-root .cw-fab svg {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

#chat-widget-root.cw-open .cw-fab {
  opacity: 0;
  transform: scale(0.8);
  pointer-events: none;
}

#chat-widget-root .cw-panel {
  position: absolute;
  bottom: 0;
  width: var(--cw-width);
  max-height: var(--cw-panel-max-height);
  height: var(--cw-panel-max-height);
  background: var(--cw-bg-main), var(--cw-surface);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: var(--cw-text);
  border-radius: var(--cw-radius);
  border: 1px solid var(--cw-border);
  box-shadow: var(--cw-shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  opacity: 0;
  transform: translateY(16px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

#chat-widget-root.cw-open .cw-panel {
  opacity: 1;
  transform: translateY(0);
}

#chat-widget-root .cw-header {
  position: sticky;
  top: 0;
  z-index: 4;
  padding: 14px 16px;
  min-height: 52px;
  background: linear-gradient(180deg, rgba(122, 60, 255, 0.24) 0%, rgba(18, 22, 46, 0.72) 100%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--cw-text);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: -0.02em;
  border-top-left-radius: var(--cw-radius);
  border-top-right-radius: var(--cw-radius);
  flex-shrink: 0;
}

#chat-widget-root .cw-header-main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

#chat-widget-root .cw-header-avatar {
  width: 40px;
  height: 40px;
  object-fit: contain;
  flex-shrink: 0;
  background: transparent;
  display: block;
}

#chat-widget-root .cw-header-text-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

#chat-widget-root .cw-header-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--cw-text-secondary);
}

#chat-widget-root .cw-header-status-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: #39e27d;
  box-shadow: 0 0 8px rgba(57, 226, 125, 0.85);
  flex-shrink: 0;
}

#chat-widget-root .cw-header-avatar[hidden] {
  display: none;
}

#chat-widget-root .cw-header-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
}

#chat-widget-root .cw-close-btn {
  background: rgba(255, 255, 255, 0.06);
  color: var(--cw-text);
  border: 1px solid transparent;
  cursor: pointer;
  padding: 10px;
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

#chat-widget-root .cw-close-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: var(--cw-border);
  transform: translateY(-1px);
}

#chat-widget-root .cw-close-btn:active {
  transform: scale(0.98);
}

#chat-widget-root .cw-close-btn:focus-visible {
  outline: 2px solid var(--cw-input-focus-ring);
  outline-offset: 2px;
}

#chat-widget-root .cw-close-btn svg {
  width: 20px;
  height: 20px;
  display: block;
}

#chat-widget-root .cw-messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 18px 16px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: transparent;
}

#chat-widget-root .cw-messages.cw-scrollbar-hidden,
#chat-widget-root .cw-input-field.cw-scrollbar-hidden {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

#chat-widget-root .cw-messages.cw-scrollbar-hidden::-webkit-scrollbar,
#chat-widget-root .cw-input-field.cw-scrollbar-hidden::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

#chat-widget-root .cw-message-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  width: 100%;
  max-width: 100%;
  align-self: flex-start;
  animation: cwMessageIn 0.24s var(--cw-ease) both;
  scroll-margin-bottom: 10px;
}

#chat-widget-root .cw-bot-avatar {
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  flex-shrink: 0;
  object-fit: contain;
  display: block;
}

#chat-widget-root .cw-message {
  padding: 12px 16px;
  background: var(--cw-bot-bubble-bg);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: var(--cw-radius-bubble) var(--cw-radius-bubble) var(--cw-radius-bubble) 6px;
  max-width: 85%;
  /* In the transcript column, do not grow vertically (avoids empty bubble height on mobile). */
  flex: 0 1 auto;
  min-width: 0;
  align-self: flex-start;
  color: var(--cw-bot-bubble-text);
  line-height: 1.45;
  word-wrap: break-word;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  animation: cwMessageIn 0.24s var(--cw-ease) both;
}

#chat-widget-root .cw-message-row .cw-message {
  max-width: min(85%, calc(100% - 42px));
  animation: none;
  /* Beside the avatar, grow along the row main axis so the bubble uses remaining width. */
  flex: 1 1 auto;
}

#chat-widget-root .cw-message.cw-message--faq-only {
  max-width: 100%;
  width: 100%;
  align-self: stretch;
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  animation: none;
  color: var(--cw-text);
}

#chat-widget-root .cw-message.cw-message--image-select-only {
  max-width: 100%;
  width: 100%;
  align-self: stretch;
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  animation: none;
  color: var(--cw-text);
}

#chat-widget-root .cw-message.cw-message--package-select-only {
  max-width: 100%;
  width: 100%;
  align-self: stretch;
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  animation: none;
  color: var(--cw-text);
}

#chat-widget-root .cw-message.cw-message--plain-image {
  max-width: 100%;
  width: 100%;
  align-self: stretch;
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  animation: none;
  color: var(--cw-text);
}

#chat-widget-root .cw-message--plain-image .cw-media-image {
  margin-top: 0;
  border: none;
}

#chat-widget-root .cw-message--image-select-only .cw-image-select-placeholder {
  margin-top: 0;
}

#chat-widget-root .cw-message--package-select-only .cw-package-select-placeholder {
  margin-top: 0;
}

#chat-widget-root .cw-user-message {
  align-self: flex-end;
  background: linear-gradient(135deg, var(--cw-gradient-from) 0%, var(--cw-gradient-to) 100%);
  color: var(--cw-user-text);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--cw-radius-bubble) var(--cw-radius-bubble) 6px var(--cw-radius-bubble);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35), var(--cw-glow);
  max-width: 85%;
}

#chat-widget-root .cw-message-text {
  margin: 0;
}

#chat-widget-root .cw-media-image {
  max-width: 100%;
  border-radius: calc(var(--cw-radius) * 0.55);
  margin-top: 8px;
  display: block;
  border: 1px solid var(--cw-border);
}

#chat-widget-root .cw-media-video {
  max-width: 100%;
  width: 100%;
  border-radius: calc(var(--cw-radius) * 0.55);
  margin-top: 8px;
  display: block;
  border: 1px solid var(--cw-border);
  background: #0f0f18;
}

#chat-widget-root .cw-media-caption {
  margin: 6px 0 0;
  font-size: 0.85rem;
  color: #64748b;
  white-space: pre-line;
}

#chat-widget-root .cw-faq-panel .cw-media-caption {
  color: var(--cw-text-muted);
}

#chat-widget-root .cw-carousel {
  position: relative;
  margin-top: 8px;
  max-width: 100%;
}

#chat-widget-root .cw-carousel-track {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding: 0 4px;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

#chat-widget-root .cw-carousel-track::-webkit-scrollbar {
  display: none;
}

#chat-widget-root .cw-carousel--with-nav .cw-carousel-track {
  scroll-padding-inline: 40px;
}

#chat-widget-root .cw-carousel-nav {
  position: absolute;
  top: var(--cw-carousel-nav-top, 50%);
  transform: translateY(-50%);
  z-index: 2;
  min-width: 36px;
  min-height: 36px;
  padding: 4px 6px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.55rem;
  font-weight: 600;
  line-height: 1;
  font-family: var(--cw-font);
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--cw-text-primary);
  cursor: pointer;
  box-shadow: none;
  transition: background 0.15s ease, opacity 0.15s ease;
}

#chat-widget-root .cw-carousel-nav:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

#chat-widget-root .cw-carousel-nav:focus-visible {
  outline: 2px solid var(--cw-input-focus-ring);
  outline-offset: 2px;
}

#chat-widget-root .cw-carousel-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

#chat-widget-root .cw-carousel-nav--prev {
  left: 0;
}

#chat-widget-root .cw-carousel-nav--next {
  right: 0;
}

#chat-widget-root .cw-message:not(.cw-user-message):not(.cw-message--faq-only) .cw-carousel-nav {
  color: var(--cw-bot-bubble-text);
}

#chat-widget-root .cw-message:not(.cw-user-message):not(.cw-message--faq-only) .cw-carousel-nav:hover:not(:disabled) {
  background: rgba(15, 23, 42, 0.08);
}

#chat-widget-root .cw-user-message .cw-carousel-nav {
  color: var(--cw-user-text);
}

#chat-widget-root .cw-user-message .cw-carousel-nav:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.18);
}

#chat-widget-root .cw-carousel-slide {
  flex: 0 0 min(280px, 88%);
  margin: 0;
  padding: 0;
  border: none;
  scroll-snap-align: start;
}

#chat-widget-root .cw-carousel-img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: calc(var(--cw-radius) * 0.55);
  border: 1px solid var(--cw-border);
}

#chat-widget-root .cw-carousel-video {
  width: 100%;
  max-height: min(50vh, 360px);
  height: auto;
  display: block;
  border-radius: calc(var(--cw-radius) * 0.55);
  border: 1px solid var(--cw-border);
  background: #0f0f18;
}

#chat-widget-root .cw-carousel-caption {
  margin: 6px 0 0;
  font-size: 0.8rem;
  color: var(--cw-text-muted);
  line-height: 1.35;
  white-space: pre-line;
}

/* FAQ answer: portrait strip for nested carousel layout mobile (phone-recorded media). */
#chat-widget-root .cw-carousel--faq-mobile {
  margin-top: 12px;
}

#chat-widget-root .cw-carousel--faq-mobile .cw-carousel-track {
  gap: 14px;
  scroll-padding: 0 8px;
}

#chat-widget-root .cw-carousel--faq-mobile .cw-carousel-slide {
  flex: 0 0 clamp(176px, 48vw, 280px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

/* Taller than default carousel video cap; use intrinsic portrait ratio — no forced 9:16 box (avoids square crop). */
#chat-widget-root .cw-faq-panel .cw-carousel--faq-mobile .cw-carousel-img,
#chat-widget-root .cw-faq-panel .cw-carousel--faq-mobile .cw-carousel-video {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  max-height: min(92vh, 960px);
  min-height: 240px;
  object-fit: contain;
  object-position: center;
  background: #0f0f18;
  border-radius: calc(var(--cw-radius) * 0.65);
  border: 1px solid var(--cw-border);
}

#chat-widget-root .cw-carousel--faq-mobile .cw-carousel-caption {
  max-width: 100%;
  text-align: center;
}

#chat-widget-root .cw-faq-panel .cw-carousel--faq-mobile .cw-carousel-nav {
  color: var(--cw-text-primary);
}

#chat-widget-root .cw-faq-panel .cw-carousel--faq-mobile .cw-carousel-nav:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
}

/* Desktop: smaller portrait media + ~1.5-slide horizontal peek (mobile max-width sheet unchanged). */
@media (min-width: 421px) {
  #chat-widget-root .cw-faq-panel .cw-carousel--faq-mobile .cw-carousel-slide {
    flex: 0 0 calc(100% - 96px);
  }

  #chat-widget-root .cw-faq-panel .cw-carousel--faq-mobile .cw-carousel-img,
  #chat-widget-root .cw-faq-panel .cw-carousel--faq-mobile .cw-carousel-video {
    max-height: min(42dvh, 360px);
    min-height: 0;
  }
}

#chat-widget-root .cw-image-select-placeholder {
  margin-top: 10px;
  max-width: 100%;
}

#chat-widget-root .cw-image-select-track {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 6px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

#chat-widget-root .cw-image-select-track::-webkit-scrollbar {
  display: none;
}

#chat-widget-root .cw-image-select-card {
  flex: 0 0 min(200px, 78%);
  scroll-snap-align: start;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  border-radius: calc(var(--cw-radius) * 0.7);
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: linear-gradient(
    165deg,
    rgba(255, 255, 255, 0.2) 0%,
    rgba(255, 255, 255, 0.07) 38%,
    rgba(18, 22, 45, 0.72) 100%
  );
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.28) inset,
    0 10px 32px rgba(0, 0, 0, 0.35),
    0 2px 10px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s var(--cw-ease);
}

#chat-widget-root .cw-image-select-card::after {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 48%;
  pointer-events: none;
  border-radius: inherit;
  background: linear-gradient(
    118deg,
    rgba(255, 255, 255, 0.42) 0%,
    rgba(255, 255, 255, 0.12) 35%,
    transparent 72%
  );
}

#chat-widget-root .cw-message:not(.cw-message--image-select-only):not(.cw-user-message) .cw-image-select-card {
  border-color: rgba(15, 23, 42, 0.12);
  background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 55%, #e8edf3 100%);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.95) inset,
    0 6px 20px rgba(15, 23, 42, 0.1),
    0 2px 8px rgba(15, 23, 42, 0.06);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

#chat-widget-root .cw-message:not(.cw-message--image-select-only):not(.cw-user-message) .cw-image-select-card::after {
  background: linear-gradient(
    118deg,
    rgba(255, 255, 255, 0.85) 0%,
    rgba(255, 255, 255, 0.25) 40%,
    transparent 75%
  );
}

#chat-widget-root .cw-message.cw-user-message .cw-image-select-card {
  border-color: rgba(255, 255, 255, 0.2);
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 100%);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.2) inset,
    0 8px 24px rgba(0, 0, 0, 0.25);
}

#chat-widget-root .cw-image-select-card:hover:not(.cw-image-select-card--disabled) {
  border-color: rgba(167, 139, 250, 0.55);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.32) inset,
    0 12px 36px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(167, 139, 250, 0.25),
    0 4px 16px rgba(107, 51, 241, 0.2);
  transform: translateY(-1px);
}

#chat-widget-root .cw-message:not(.cw-message--image-select-only):not(.cw-user-message) .cw-image-select-card:hover:not(.cw-image-select-card--disabled) {
  border-color: rgba(107, 51, 241, 0.35);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 1) inset,
    0 8px 28px rgba(15, 23, 42, 0.12),
    0 0 0 1px rgba(107, 51, 241, 0.12),
    0 4px 14px rgba(107, 51, 241, 0.12);
}

#chat-widget-root .cw-image-select-card:focus-within:not(.cw-image-select-card--disabled) {
  outline: 2px solid var(--cw-input-focus-ring);
  outline-offset: 3px;
}

#chat-widget-root .cw-image-select-card--disabled {
  opacity: 0.55;
  cursor: not-allowed;
  pointer-events: none;
}

#chat-widget-root .cw-image-select-img {
  position: relative;
  z-index: 0;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
  border: none;
  border-radius: 0;
  transition: filter 0.2s ease;
}

#chat-widget-root .cw-image-select-card:hover:not(.cw-image-select-card--disabled) .cw-image-select-img {
  filter: brightness(1.03) saturate(1.02);
}

#chat-widget-root .cw-image-select-choice {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 8px 10px 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(0, 0, 0, 0.18) 100%);
}

#chat-widget-root .cw-message:not(.cw-message--image-select-only):not(.cw-user-message) .cw-image-select-choice {
  border-top-color: rgba(15, 23, 42, 0.1);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.65) 0%, rgba(241, 245, 249, 0.98) 100%);
}

#chat-widget-root .cw-message.cw-user-message .cw-image-select-choice {
  border-top-color: rgba(255, 255, 255, 0.12);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0.15) 100%);
}

#chat-widget-root .cw-image-select-choice--radio-only {
  justify-content: center;
}

#chat-widget-root .cw-image-select-radio {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  accent-color: var(--cw-primary);
  cursor: pointer;
}

#chat-widget-root .cw-image-select-label {
  font-size: 0.875rem;
  color: var(--cw-bot-bubble-text);
  line-height: 1.3;
  text-align: left;
}

#chat-widget-root .cw-message--image-select-only .cw-image-select-label {
  color: rgba(255, 255, 255, 0.94);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
}

#chat-widget-root .cw-user-message .cw-image-select-label {
  color: var(--cw-user-text);
}

#chat-widget-root .cw-package-select-placeholder {
  margin-top: 10px;
  max-width: 100%;
}

#chat-widget-root .cw-package-select-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: 12px;
  padding: 16px 2px 8px;
}

/* Tier: title tint only; shared purple card chrome for all */
#chat-widget-root .cw-package-select-card--tier-bronze {
  --cw-pkg-title: #e8a878;
}
#chat-widget-root .cw-package-select-card--tier-silver {
  --cw-pkg-title: #e4e9f2;
}
#chat-widget-root .cw-package-select-card--tier-gold {
  --cw-pkg-title: #fde68a;
}
#chat-widget-root .cw-package-select-card--tier-black {
  --cw-pkg-title: #f8fafc;
}

#chat-widget-root .cw-package-select-card {
  position: relative;
  overflow: visible;
  width: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  aspect-ratio: 1 / 1.12;
  max-width: 100%;
  border: 1px solid rgba(196, 181, 253, 0.4);
  border-radius: 16px;
  background:
    radial-gradient(120% 80% at 50% 0%, rgba(167, 139, 250, 0.16) 0%, transparent 52%),
    linear-gradient(155deg, rgba(72, 35, 120, 0.92) 0%, rgba(42, 18, 82, 0.96) 45%, rgba(18, 10, 36, 0.99) 100%);
  color: var(--cw-on-primary);
  text-align: left;
  cursor: pointer;
  box-shadow:
    0 0 28px rgba(139, 92, 246, 0.42),
    0 6px 22px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    inset 0 -1px 0 rgba(0, 0, 0, 0.38);
  transition: transform 0.2s var(--cw-ease), box-shadow 0.2s ease, border-color 0.2s ease;
}

#chat-widget-root .cw-package-select-card--most-popular {
  box-shadow:
    0 0 32px rgba(167, 139, 250, 0.52),
    0 0 0 1px rgba(196, 181, 253, 0.45),
    0 6px 22px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.14);
}

#chat-widget-root .cw-package-select-card:hover:not(.cw-package-select-card--disabled) {
  transform: translateY(-3px);
  border-color: rgba(221, 214, 254, 0.72);
  box-shadow:
    0 0 36px rgba(167, 139, 250, 0.55),
    0 16px 40px rgba(0, 0, 0, 0.5),
    0 0 30px rgba(139, 92, 246, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.14);
}

#chat-widget-root .cw-package-select-card:focus-visible {
  outline: 2px solid var(--cw-input-focus-ring);
  outline-offset: 2px;
}

#chat-widget-root .cw-package-select-card--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ~Top half: 3D card artwork */
#chat-widget-root .cw-package-select-thumb-wrap {
  flex: 1 1 48%;
  min-height: 0;
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 14px 12px 6px;
  overflow: visible;
  background: transparent;
}

#chat-widget-root .cw-package-select-thumb {
  width: 82%;
  max-width: 100%;
  max-height: 100%;
  height: auto;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 12px 20px rgba(0, 0, 0, 0.45));
}

/* POPULAIRE: pill half inside / half outside card top edge (center on border) */
#chat-widget-root .cw-package-select-ribbon {
  position: absolute;
  top: 0;
  left: 50%;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

#chat-widget-root .cw-package-select-badge {
  box-sizing: border-box;
  width: max-content;
  max-width: calc(100% - 4px);
  padding: 4px 12px 5px;
  text-align: center;
  font-size: max(0.56rem, 9px);
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  background: linear-gradient(180deg, #ddd6fe 0%, #8b5cf6 45%, #5b21b6 100%);
  border: 1px solid rgba(237, 233, 254, 0.5);
  border-radius: 999px;
  box-shadow:
    0 4px 14px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(139, 92, 246, 0.45);
}

/* ~Bottom half: title, rule, inset offer */
#chat-widget-root .cw-package-select-copy {
  flex: 1 1 52%;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 4px 10px 12px;
}

#chat-widget-root .cw-package-select-title {
  font-size: clamp(0.72rem, 2.9vw, 0.84rem);
  font-weight: 800;
  color: var(--cw-pkg-title);
  line-height: 1.15;
  text-align: center;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.65);
}

#chat-widget-root .cw-package-select-rule {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 6px;
  padding: 0 4px;
}

#chat-widget-root .cw-package-select-rule-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
}

#chat-widget-root .cw-package-select-rule-dots {
  flex: 0 0 auto;
  font-size: 0.5rem;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.28);
}

#chat-widget-root .cw-package-select-offer-panel {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  border-radius: 11px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(167, 139, 250, 0.12);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.5);
}

#chat-widget-root .cw-package-select-offer {
  display: block;
  width: 100%;
  min-width: 0;
  font-size: clamp(0.56rem, 2.2vw, 0.62rem);
  font-weight: 600;
  color: rgba(248, 250, 252, 0.9);
  line-height: 1.28;
  text-align: center;
  text-wrap: balance;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

#chat-widget-root .cw-package-select-offer-amount {
  color: #34f174;
  font-weight: 800;
}


#chat-widget-root .cw-faq {
  margin-top: 0;
  max-width: 100%;
  border: 1px solid var(--cw-border);
  border-radius: var(--cw-radius);
  overflow: hidden;
  background: var(--cw-surface-elevated);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

#chat-widget-root .cw-message:not(.cw-message--faq-only) .cw-faq {
  margin-top: 8px;
}

#chat-widget-root .cw-faq-item {
  scroll-margin-top: 8px;
}

#chat-widget-root .cw-faq-item + .cw-faq-item {
  border-top: 1px solid var(--cw-border);
}

#chat-widget-root .cw-faq-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  margin: 0;
  border: none;
  background: transparent;
  color: var(--cw-text);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s var(--cw-ease), box-shadow 0.2s ease;
}

#chat-widget-root .cw-faq-trigger:hover {
  background: rgba(99, 102, 241, 0.12);
}

#chat-widget-root .cw-faq-trigger:focus-visible {
  outline: 2px solid var(--cw-input-focus-ring);
  outline-offset: -2px;
  z-index: 1;
}

#chat-widget-root .cw-faq-trigger[aria-expanded="true"] {
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.35) 0%, rgba(168, 85, 247, 0.2) 100%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

#chat-widget-root .cw-faq-question {
  flex: 1;
  line-height: 1.35;
  font-size: 0.92rem;
}

#chat-widget-root .cw-faq-icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: linear-gradient(145deg, rgba(129, 140, 248, 0.42) 0%, rgba(167, 139, 250, 0.34) 100%);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: var(--cw-on-primary);
}

#chat-widget-root .cw-faq-icon svg {
  width: 16px;
  height: 16px;
}

#chat-widget-root .cw-faq-chevron {
  flex-shrink: 0;
  display: inline-block;
  width: 0.85em;
  height: 0.85em;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(45deg);
  transform-origin: 50% 50%;
  margin-top: -2px;
  transition: transform 0.25s var(--cw-ease);
  opacity: 0.85;
}

#chat-widget-root .cw-faq-trigger[aria-expanded="true"] .cw-faq-chevron {
  transform: rotate(225deg);
  margin-top: 2px;
}

#chat-widget-root .cw-faq-panel {
  padding: 0 14px;
  border-top: 1px solid transparent;
  background: rgba(12, 12, 20, 0.65);
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  visibility: hidden;
  padding-top: 0;
  padding-bottom: 0;
  transition: max-height 0.32s var(--cw-ease), opacity 0.22s var(--cw-ease), padding 0.28s var(--cw-ease), border-color 0.2s ease, visibility 0s linear 0.32s;
}

#chat-widget-root .cw-faq-panel.cw-faq-panel--open {
  /* Must exceed nested mobile carousel media (up to min(92vh, 960px)) plus long answer copy, or content clips and can stack badly with the next row. */
  max-height: min(260vh, 6000px);
  opacity: 1;
  visibility: visible;
  padding-bottom: 14px;
  border-top-color: var(--cw-border);
  transition: max-height 0.36s var(--cw-ease), opacity 0.24s var(--cw-ease), padding 0.28s var(--cw-ease), border-color 0.2s ease, visibility 0s linear 0s;
}

#chat-widget-root .cw-faq-answer-body {
  margin: 12px 0 0;
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--cw-text-muted);
  display: flex;
  flex-direction: column;
  gap: 0.65em;
}

#chat-widget-root .cw-faq-answer-para {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

#chat-widget-root .cw-faq-answer-list {
  margin: 0;
  padding-left: 1.2em;
  list-style-type: disc;
}

#chat-widget-root .cw-faq-answer-list li {
  margin: 0.2em 0;
  padding-left: 0.15em;
}

#chat-widget-root .cw-faq-nested-img {
  margin-top: 8px;
}

#chat-widget-root .cw-faq-nested-video {
  margin-top: 8px;
}

#chat-widget-root .cw-faq-carousel-placeholder {
  margin-top: 8px;
}

#chat-widget-root .cw-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 6px;
}

#chat-widget-root .cw-options--has-card {
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  gap: 12px;
}

#chat-widget-root .cw-option-btn {
  padding: 12px 18px;
  border: 1px solid var(--cw-border-strong);
  color: var(--cw-text);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

#chat-widget-root .cw-option-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.35) 0%, rgba(168, 85, 247, 0.25) 100%);
  border-color: rgba(167, 139, 250, 0.45);
  color: var(--cw-on-primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.25), var(--cw-glow);
}

#chat-widget-root .cw-option-btn:active:not(:disabled) {
  transform: scale(0.98);
}

#chat-widget-root .cw-option-btn:focus-visible {
  outline: 2px solid var(--cw-input-focus-ring);
  outline-offset: 2px;
}

#chat-widget-root .cw-option-btn:disabled:not(.cw-form-submit),
#chat-widget-root .cw-option-btn.cw-disabled:not(.cw-form-submit) {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

#chat-widget-root .cw-option-btn--card {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 14px;
  width: 100%;
  flex-basis: 100%;
  padding: 14px 16px;
  text-align: left;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.55) 0%, rgba(124, 58, 237, 0.45) 50%, rgba(59, 130, 246, 0.4) 100%);
  border: 1px solid rgba(167, 139, 250, 0.35);
  box-shadow: 0 4px 20px rgba(79, 70, 229, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  color: var(--cw-on-primary);
}

#chat-widget-root .cw-option-btn--card:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.65) 0%, rgba(139, 92, 246, 0.55) 50%, rgba(59, 130, 246, 0.5) 100%);
  border-color: rgba(196, 181, 253, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(99, 102, 241, 0.35), var(--cw-glow);
}

#chat-widget-root .cw-option-btn--card:active:not(:disabled) {
  transform: scale(0.99);
}

#chat-widget-root .cw-option-btn--card:focus-visible {
  outline: 2px solid var(--cw-input-focus-ring);
  outline-offset: 2px;
}

#chat-widget-root .cw-option-btn--card:disabled,
#chat-widget-root .cw-option-btn--card.cw-disabled {
  opacity: 0.5;
  transform: none;
}

#chat-widget-root .cw-option-card-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(145deg, rgba(129, 140, 248, 0.55) 0%, rgba(167, 139, 250, 0.45) 100%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--cw-on-primary);
}

#chat-widget-root .cw-option-card-icon svg {
  width: 26px;
  height: 26px;
}

#chat-widget-root .cw-option-card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

#chat-widget-root .cw-option-card-title {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.25;
  color: var(--cw-on-primary);
}

#chat-widget-root .cw-option-card-sub {
  font-size: 0.8125rem;
  font-weight: 400;
  line-height: 1.35;
  color: rgba(255, 255, 255, 0.82);
}

#chat-widget-root .cw-option-card-chevron {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.95);
  opacity: 0.9;
}

#chat-widget-root .cw-option-card-chevron svg {
  width: 22px;
  height: 22px;
}

#chat-widget-root .cw-footer-slot {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
}

#chat-widget-root .cw-footer-links {
  flex-shrink: 0;
  display: none;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px 14px;
  width: 100%;
  padding: 8px var(--cw-input-bar-gutter) 4px;
  margin: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  box-sizing: border-box;
}

/** Stacked sticky nav (order flow package steps): full-width rows, icon + label + chevron — scale ~ footer CTA bar */
#chat-widget-root .cw-footer-links--stack {
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  justify-content: flex-start;
  gap: 0;
  padding: 8px var(--cw-input-bar-gutter) 10px;
}

#chat-widget-root .cw-footer-links--stack .cw-footer-link-btn {
  width: 100%;
  max-width: none;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  margin: 0;
  text-align: left;
  border-radius: 0;
  background: rgba(36, 40, 68, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: none;
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(248, 250, 252, 0.98);
  text-decoration: none;
  line-height: 1.25;
  box-sizing: border-box;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

#chat-widget-root .cw-footer-links--stack .cw-footer-link-btn:first-of-type {
  border-radius: 14px 14px 0 0;
}

#chat-widget-root .cw-footer-links--stack .cw-footer-link-btn:last-of-type {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0 0 14px 14px;
}

#chat-widget-root .cw-footer-links--stack .cw-footer-link-btn:only-of-type {
  border-radius: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

#chat-widget-root .cw-footer-links--stack .cw-footer-link-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.95);
}

#chat-widget-root .cw-footer-links--stack .cw-footer-link-icon svg {
  width: 17px;
  height: 17px;
}

#chat-widget-root .cw-footer-links--stack .cw-footer-link-label {
  flex: 1;
  min-width: 0;
  text-align: left;
}

#chat-widget-root .cw-footer-links--stack .cw-footer-link-btn .cw-option-card-chevron {
  flex-shrink: 0;
  opacity: 0.85;
}

#chat-widget-root .cw-footer-links--stack .cw-footer-link-btn .cw-option-card-chevron svg {
  width: 16px;
  height: 16px;
}

#chat-widget-root .cw-footer-links--stack .cw-footer-link-btn:hover {
  background: rgba(50, 55, 90, 0.98);
  color: #fff;
}

#chat-widget-root .cw-footer-links--stack .cw-footer-link-btn:focus-visible {
  outline: 2px solid var(--cw-input-focus-ring);
  outline-offset: -2px;
  z-index: 1;
}

#chat-widget-root .cw-footer-link-btn {
  appearance: none;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(147, 197, 253, 0.95);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 8px;
  line-height: 1.3;
  max-width: 100%;
  text-align: center;
}

#chat-widget-root .cw-footer-link-btn:hover {
  color: #e0e7ff;
  background: rgba(255, 255, 255, 0.06);
  text-decoration: none;
}

#chat-widget-root .cw-footer-link-btn:focus-visible {
  outline: 2px solid var(--cw-input-focus-ring);
  outline-offset: 2px;
}

#chat-widget-root .cw-footer-cta {
  margin: 6px var(--cw-input-bar-gutter) var(--cw-input-bar-gutter);
  width: calc(100% - (2 * var(--cw-input-bar-gutter)));
  box-sizing: border-box;
  align-self: center;
  /* Compact bar: ~same visual weight as the single-line input row (not full card-option size) */
  gap: 6px;
  padding: 5px 10px 5px 8px;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(79, 70, 229, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

#chat-widget-root .cw-footer-cta:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(99, 102, 241, 0.28), var(--cw-glow);
}

#chat-widget-root .cw-footer-cta .cw-option-card-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
}

#chat-widget-root .cw-footer-cta .cw-option-card-icon svg {
  width: 17px;
  height: 17px;
}

#chat-widget-root .cw-footer-cta .cw-option-card-body {
  gap: 1px;
}

#chat-widget-root .cw-footer-cta .cw-option-card-title {
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.2;
}

#chat-widget-root .cw-footer-cta .cw-option-card-sub {
  font-size: 0.6875rem;
  line-height: 1.25;
}

#chat-widget-root .cw-footer-cta .cw-option-card-chevron svg {
  width: 16px;
  height: 16px;
}

#chat-widget-root .cw-input-area {
  position: relative;
  isolation: isolate;
  flex-shrink: 0;
  margin: 8px var(--cw-input-bar-gutter) var(--cw-input-bar-gutter);
  width: calc(100% - (2 * var(--cw-input-bar-gutter)));
  box-sizing: border-box;
  padding: 6px 8px;
  display: flex;
  align-items: center;
  gap: 0;
  background: transparent;
  border: none;
  border-radius: var(--cw-radius-input);
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

#chat-widget-root .cw-input-area::before {
  content: '';
  position: absolute;
  z-index: 0;
  inset: 0;
  border-radius: inherit;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: none;
  pointer-events: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

#chat-widget-root .cw-input-area:focus-within::before {
  border-color: rgba(107, 51, 241, 0.55);
  background: rgba(255, 255, 255, 0.05);
}

#chat-widget-root .cw-input-field {
  position: relative;
  z-index: 1;
  flex: 1;
  resize: none;
  min-width: 0;
  padding: 7px 4px 7px 12px;
  min-height: 36px;
  max-height: 120px;
  line-height: 1.45;
  border: none;
  border-radius: 0;
  font-family: inherit;
  outline: none;
  font-size: 0.95rem;
  background: transparent;
  color: var(--cw-text);
  box-shadow: none;
  transition: color 0.2s ease;
}

#chat-widget-root .cw-input-field::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

#chat-widget-root .cw-input-field:focus {
  border: none;
  box-shadow: none;
  outline: none;
}

#chat-widget-root .cw-send-btn {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  align-self: center;
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  margin: 2px 4px 2px 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: color 0.2s ease, transform 0.2s ease, background 0.2s ease;
  box-shadow: none;
}

#chat-widget-root .cw-send-btn:hover:not(:disabled) {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.06);
  transform: scale(1.05);
}

#chat-widget-root .cw-send-btn:active:not(:disabled) {
  transform: scale(0.95);
}

#chat-widget-root .cw-send-btn:disabled {
  opacity: var(--cw-send-disabled-opacity);
  cursor: not-allowed;
  transform: none;
}

#chat-widget-root .cw-send-btn:focus-visible {
  outline: 2px solid var(--cw-input-focus-ring);
  outline-offset: 2px;
}

#chat-widget-root .cw-send-btn svg {
  width: 20px;
  height: 20px;
  display: block;
}

#chat-widget-root .cw-typing-indicator {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 4px 10px 2px;
  margin: 0;
  background: none;
  border: none;
  border-radius: 0;
  box-shadow: none;
  align-self: flex-end;
  width: fit-content;
  max-width: min(85%, calc(100% - 42px));
  flex: 0 0 auto;
  min-width: 0;
}

#chat-widget-root .cw-typing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, var(--cw-typing-dot) 0%, var(--cw-typing-dot-mid) 100%);
  box-shadow: 0 0 12px var(--cw-typing-dot-glow), 0 0 4px rgba(255, 255, 255, 0.3);
  animation: cwTypingDot 1.35s infinite ease-in-out both;
  will-change: transform, opacity;
}

#chat-widget-root .cw-typing-dot:nth-child(1) { animation-delay: -0.36s; }
#chat-widget-root .cw-typing-dot:nth-child(2) { animation-delay: -0.18s; }

#chat-widget-root .cw-message--validation-pending .cw-validation-pending-indicator {
  margin-top: 10px;
}

#chat-widget-root .cw-message--validation-pending .cw-validation-pending-indicator .cw-typing-indicator {
  align-self: flex-start;
  padding: 4px 4px 6px 2px;
}

#chat-widget-root .cw-message--validation-pending .cw-validation-pending-indicator .cw-typing-dot {
  background: radial-gradient(circle at 30% 30%, #7c3aed 0%, #5b21b6 100%);
  box-shadow: 0 0 10px rgba(91, 33, 182, 0.35), 0 0 3px rgba(255, 255, 255, 0.2);
}

@keyframes cwTypingDot {
  0%, 70%, 100% {
    transform: translateY(0) scale(0.62);
    opacity: 0.4;
  }
  35% {
    transform: translateY(-4px) scale(1);
    opacity: 1;
  }
}

@keyframes cwMessageIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

#chat-widget-root .cw-form-row {
  animation: cwMessageIn 0.35s var(--cw-ease) both;
}

#chat-widget-root .cw-form-message {
  flex: 1;
  min-width: 0;
  max-width: min(92%, calc(100% - 42px));
  padding: 12px 14px;
  border-radius: var(--cw-radius-bubble);
  background: var(--cw-bot-bubble-bg);
  color: var(--cw-bot-bubble-text);
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.06);
}

#chat-widget-root .cw-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

#chat-widget-root .cw-form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

#chat-widget-root .cw-form-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--cw-bot-bubble-text);
  opacity: 0.92;
}

#chat-widget-root .cw-form-input {
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.95);
  color: #0f172a;
  font-family: inherit;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

#chat-widget-root .cw-form-input:focus {
  border-color: rgba(107, 51, 241, 0.45);
  box-shadow: 0 0 0 3px rgba(107, 51, 241, 0.12);
}

#chat-widget-root .cw-form-input--error {
  border-color: #dc2626;
}

#chat-widget-root .cw-form-field-error {
  font-size: 0.75rem;
  line-height: 1.35;
  color: #b91c1c;
  white-space: pre-wrap;
}

#chat-widget-root .cw-form-submit {
  margin-top: 4px;
  align-self: stretch;
  justify-content: center;
}

/* Form bubble is light (#f1f5f9); generic .cw-option-btn uses white text + faint fill and disappears here. */
#chat-widget-root .cw-form-submit.cw-option-btn {
  color: #ffffff;
  background: linear-gradient(135deg, #6366f1 0%, #7c3aed 52%, #4f46e5 100%);
  border: 1px solid rgba(167, 139, 250, 0.55);
  box-shadow: 0 2px 10px rgba(79, 70, 229, 0.28);
  font-weight: 600;
  opacity: 1;
}

/* Incomplete required fields — not native :disabled (avoids UA greying / white-on-wash). Matches widget indigo + slate. */
#chat-widget-root .cw-form-submit.cw-option-btn.cw-form-submit--invalid {
  color: #1e293b !important;
  -webkit-text-fill-color: #1e293b !important;
  background: linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%) !important;
  border: 1px solid rgba(99, 102, 241, 0.22) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.85),
    0 1px 2px rgba(15, 23, 42, 0.06) !important;
  cursor: not-allowed;
  opacity: 1 !important;
}

#chat-widget-root .cw-form-submit.cw-option-btn:hover:not(:disabled):not(.cw-form-submit--invalid) {
  background: linear-gradient(135deg, #4f46e5 0%, #6d28d9 50%, #4338ca 100%);
  border-color: rgba(196, 181, 253, 0.65);
  color: #ffffff;
  -webkit-text-fill-color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(99, 102, 241, 0.35);
}

/* After successful submit */
#chat-widget-root .cw-form-submit.cw-option-btn:disabled,
#chat-widget-root .cw-form-submit.cw-option-btn.cw-disabled {
  opacity: 1 !important;
  cursor: default;
  transform: none;
  color: #312e81 !important;
  -webkit-text-fill-color: #312e81 !important;
  background: linear-gradient(180deg, #e0e7ff 0%, #c7d2fe 100%) !important;
  border: 1px solid rgba(99, 102, 241, 0.38) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5) !important;
}

@media (prefers-reduced-motion: reduce) {
  #chat-widget-root .cw-panel,
  #chat-widget-root .cw-fab,
  #chat-widget-root .cw-option-btn,
  #chat-widget-root .cw-option-btn--card,
  #chat-widget-root .cw-footer-cta,
  #chat-widget-root .cw-send-btn,
  #chat-widget-root .cw-close-btn {
    transition-duration: 0.01ms !important;
  }
  #chat-widget-root .cw-message,
  #chat-widget-root .cw-user-message,
  #chat-widget-root .cw-message-row {
    animation: none !important;
  }
  #chat-widget-root .cw-typing-dot {
    animation: none;
  }
  #chat-widget-root .cw-faq-panel {
    transition-duration: 0.01ms !important;
  }
  #chat-widget-root .cw-image-select-card,
  #chat-widget-root .cw-package-select-card {
    transition-duration: 0.01ms !important;
    transform: none !important;
  }
  #chat-widget-root .cw-image-select-card:hover:not(.cw-image-select-card--disabled),
  #chat-widget-root .cw-package-select-card:hover:not(.cw-package-select-card--disabled) {
    transform: none !important;
  }
}

@media (max-width: 420px) {
  #chat-widget-root {
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100%;
    max-width: none;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    padding-left: env(safe-area-inset-left, 0px);
    padding-right: env(safe-area-inset-right, 0px);
  }

  #chat-widget-root .cw-panel {
    position: fixed;
    bottom: 0;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    max-height: 100dvh !important;
    height: 100dvh !important;
    border-radius: 24px 24px 0 0;
    transform: translateY(100%);
  }

  #chat-widget-root.cw-open .cw-panel {
    transform: translateY(0);
  }

  #chat-widget-root .cw-fab {
    position: fixed;
    bottom: max(20px, env(safe-area-inset-bottom, 0px));
    right: max(20px, env(safe-area-inset-right, 0px));
  }

  #chat-widget-root.cw-placement-left .cw-fab {
    right: auto;
    left: max(20px, env(safe-area-inset-left, 0px));
  }

  #chat-widget-root .cw-package-select-list {
    gap: 10px;
    padding: 14px 0 6px;
  }

  #chat-widget-root .cw-package-select-card {
    aspect-ratio: 1 / 1.15;
  }

  #chat-widget-root .cw-package-select-ribbon {
    transform: translate(-50%, -50%);
  }

  #chat-widget-root .cw-package-select-badge {
    padding: 3px 10px 4px;
    font-size: max(0.5rem, 8px);
  }

  #chat-widget-root .cw-package-select-copy {
    padding: 2px 8px 10px;
  }
}
`;
function valueMatchesPattern(pattern, value, debug) {
  try {
    return new RegExp(pattern).test(value);
  } catch (e) {
    if (debug) {
      console.warn("[FormRenderer] Invalid form field pattern (regex):", pattern);
    } else {
      console.warn("[FormRenderer] Invalid form field pattern; treating as non-match.");
    }
    return false;
  }
}
function renderFormBlock(node, context, onValidSubmit, debug, avatarSrc) {
  var _a, _b, _c, _d;
  const formDef = (_a = node.input) == null ? void 0 : _a.form;
  if (!((_b = formDef == null ? void 0 : formDef.fields) == null ? void 0 : _b.length)) {
    const empty = document.createElement("div");
    return empty;
  }
  const row = document.createElement("div");
  row.className = "cw-message-row cw-form-row";
  const bubble = document.createElement("div");
  bubble.className = "cw-message cw-form-message";
  bubble.setAttribute("role", "group");
  const form = document.createElement("form");
  form.className = "cw-form";
  form.setAttribute("novalidate", "");
  const fields = formDef.fields;
  const inputs = [];
  const hintEls = [];
  for (const field of fields) {
    const wrap = document.createElement("div");
    wrap.className = "cw-form-field";
    const lab = document.createElement("label");
    lab.className = "cw-form-label";
    lab.htmlFor = `cw-form-${node.id}-${field.id}`;
    lab.textContent = interpolateAll(field.label, context, void 0, debug);
    const input = document.createElement("input");
    input.className = "cw-form-input";
    input.id = `cw-form-${node.id}-${field.id}`;
    input.name = field.id;
    input.type = (_c = field.type) != null ? _c : "text";
    input.autocomplete = "off";
    if (field.placeholder !== void 0 && field.placeholder.trim() !== "") {
      input.placeholder = interpolateAll(field.placeholder, context, void 0, debug);
    }
    if (typeof field.maxLength === "number" && field.maxLength >= 1) {
      input.maxLength = field.maxLength;
    }
    const ck = (_d = field.contextKey) != null ? _d : field.id;
    const existing = context[ck];
    if (typeof existing === "string" || typeof existing === "number") {
      input.value = String(existing);
    }
    let hintEl = null;
    if (field.pattern !== void 0 && field.validationMessage !== void 0) {
      hintEl = document.createElement("div");
      hintEl.className = "cw-form-field-error";
      hintEl.setAttribute("role", "alert");
      hintEl.hidden = true;
    }
    wrap.appendChild(lab);
    wrap.appendChild(input);
    if (hintEl) wrap.appendChild(hintEl);
    form.appendChild(wrap);
    inputs.push(input);
    hintEls.push(hintEl);
  }
  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.className = "cw-form-submit cw-option-btn";
  const submitLabel = formDef.submitLabel && formDef.submitLabel.trim() !== "" ? interpolateAll(formDef.submitLabel, context, void 0, debug) : "Continuer";
  submitBtn.textContent = submitLabel;
  form.appendChild(submitBtn);
  const syncSubmitValidity = () => {
    let ok = true;
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      const el = inputs[i];
      if (!f.required) continue;
      const v = el.value.trim();
      if (!v) ok = false;
    }
    submitBtn.classList.toggle("cw-form-submit--invalid", !ok);
    submitBtn.setAttribute("aria-disabled", String(!ok));
  };
  const clearPatternHint = (index) => {
    const hint = hintEls[index];
    if (!hint) return;
    hint.textContent = "";
    hint.hidden = true;
  };
  syncSubmitValidity();
  for (let i = 0; i < inputs.length; i++) {
    const idx = i;
    inputs[i].addEventListener("input", () => {
      syncSubmitValidity();
      clearPatternHint(idx);
      inputs[idx].classList.remove("cw-form-input--error");
      inputs[idx].removeAttribute("aria-invalid");
    });
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const values = {};
    let ok = true;
    let firstErrorIndex = null;
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      const el = inputs[i];
      const hint = hintEls[i];
      if (hint) {
        hint.textContent = "";
        hint.hidden = true;
      }
      const v = el.value.replace(/<[^>]*>?/gm, "").trim();
      values[f.id] = v;
      if (f.required && !v) {
        ok = false;
        el.classList.add("cw-form-input--error");
        el.setAttribute("aria-invalid", "true");
        if (firstErrorIndex === null) firstErrorIndex = i;
      } else {
        el.classList.remove("cw-form-input--error");
        el.removeAttribute("aria-invalid");
      }
    }
    if (!ok) {
      if (firstErrorIndex !== null) inputs[firstErrorIndex].focus();
      return;
    }
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      const el = inputs[i];
      const hint = hintEls[i];
      const v = values[f.id];
      if (f.pattern !== void 0 && f.validationMessage !== void 0 && hint) {
        if (!valueMatchesPattern(f.pattern, v, debug)) {
          ok = false;
          el.classList.add("cw-form-input--error");
          el.setAttribute("aria-invalid", "true");
          hint.textContent = interpolateAll(f.validationMessage, context, void 0, debug);
          hint.hidden = false;
          if (firstErrorIndex === null) firstErrorIndex = i;
        }
      }
    }
    if (!ok) {
      if (firstErrorIndex !== null) inputs[firstErrorIndex].focus();
      return;
    }
    submitBtn.classList.remove("cw-form-submit--invalid");
    submitBtn.setAttribute("aria-disabled", "false");
    submitBtn.disabled = true;
    submitBtn.classList.add("cw-disabled");
    for (const el of inputs) {
      el.disabled = true;
    }
    onValidSubmit(values);
  });
  bubble.appendChild(form);
  row.appendChild(createBotAvatarElement(avatarSrc));
  row.appendChild(bubble);
  return row;
}
const SVG_CHAT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;
const SVG_SEND = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`;
const SVG_CLOSE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>`;
const SCROLL_NEAR_BOTTOM_PX = 64;
class ChatUI {
  constructor(bus, avatarSrc) {
    this.bus = bus;
    this.avatarSrc = avatarSrc;
    this.footerCtaConfig = null;
    this.optionsRenderer = new OptionsRenderer();
    this.activeFlowId = "";
    this.activeNodeId = "";
    this.lastContext = {};
    this.interpolateDebug = false;
    this.typingIndicatorEl = null;
    this.lastNodeWasTerminal = false;
    this.lastRenderedNode = null;
    this.pendingForceScroll = false;
    this.followLatest = true;
    this.messagesScrollHandler = null;
    this.messagesLoadCaptureHandler = null;
    this.messagesMutationObserver = null;
    this.mutationScrollScheduled = false;
    this.messageRenderer = new MessageRenderer(bus, avatarSrc);
    this.inputManager = new InputManager(bus, { enabled: true, placeholder: "Type your message..." });
    this.bus.on("nodeEntered", (p) => {
      this.activeFlowId = p.flowId;
      this.activeNodeId = p.nodeId;
    });
    this.bus.on("flowStarted", () => {
      this.pendingForceScroll = true;
    });
    this.bus.on("__open", () => {
      var _a;
      (_a = this.root) == null ? void 0 : _a.classList.add("cw-open");
      this.followLatest = true;
    });
    this.bus.on("__close", () => {
      var _a;
      return (_a = this.root) == null ? void 0 : _a.classList.remove("cw-open");
    });
    this.bus.on("__typingStart", () => this.showTypingIndicator());
    this.bus.on("__render", (payload) => {
      var _a;
      this.lastContext = (_a = payload.context) != null ? _a : {};
      this.interpolateDebug = Boolean(payload.debug);
      this.lastNodeWasTerminal = Boolean(payload.node.terminal);
      this.lastRenderedNode = payload.node;
      this.removeTypingIndicator();
      this.renderNode(payload.node, this.lastContext);
      this.syncFooterLinks(payload.node);
      this.syncFooterCtaContent();
      this.syncFooterVisibility();
    });
    this.bus.on("__hydrateTranscript", (payload) => {
      var _a;
      const entries = Array.isArray(payload == null ? void 0 : payload.entries) ? payload.entries : [];
      const context = (_a = payload == null ? void 0 : payload.context) != null ? _a : {};
      this.hydrateTranscript(entries, context);
    });
    this.bus.on("__setFooterCta", (payload) => {
      this.footerCtaConfig = payload.config;
      if (this.footerCtaBtn && payload.config) {
        this.footerCtaBtn.disabled = false;
        this.footerCtaBtn.classList.remove("cw-disabled");
      }
      this.syncFooterCtaContent();
      this.syncFooterVisibility();
    });
    this.bus.on("__enableInput", (p) => {
      if ((p == null ? void 0 : p.placeholder) && this.inputField) {
        this.inputField.placeholder = interpolateAll(
          p.placeholder,
          this.lastContext,
          void 0,
          this.interpolateDebug
        );
      }
      this.syncFooterVisibility();
    });
    this.bus.on("__disableInput", () => {
      this.syncFooterVisibility();
    });
    this.bus.on("__simulateUserMessage", (text) => {
      this.inputManager.handleSubmit(text, {
        activeFlowId: this.activeFlowId,
        activeNodeId: this.activeNodeId
      });
      this.renderUserMessage(text.replace(/<[^>]*>?/gm, "").trim());
    });
    this.bus.on("__renderUserEcho", (text) => {
      this.renderUserMessage(String(text).replace(/<[^>]*>?/gm, "").trim());
    });
    this.bus.on("stateCleared", () => this.clearTranscript());
  }
  /** Hide or show the entire widget chrome (launcher + panel). Host-facing API delegates here. */
  setEmbedVisible(visible) {
    if (!this.root) return;
    if (visible) {
      this.root.classList.remove("cw-embed-hidden");
      this.root.removeAttribute("aria-hidden");
    } else {
      this.root.classList.add("cw-embed-hidden");
      this.root.setAttribute("aria-hidden", "true");
    }
  }
  mount() {
    if (this.root) return;
    this.injectStyles();
    this.root = document.createElement("div");
    this.root.id = "chat-widget-root";
    const fab = document.createElement("button");
    fab.type = "button";
    fab.className = "cw-fab";
    fab.setAttribute("aria-label", "Open chat");
    fab.innerHTML = SVG_CHAT;
    fab.addEventListener("click", () => {
      this.bus.emit("__open");
    });
    this.panel = document.createElement("div");
    this.panel.className = "cw-panel";
    const header = document.createElement("div");
    header.className = "cw-header";
    const headerMain = document.createElement("div");
    headerMain.className = "cw-header-main";
    this.avatarEl = document.createElement("img");
    this.avatarEl.className = "cw-header-avatar";
    this.avatarEl.hidden = true;
    this.avatarEl.decoding = "async";
    this.titleEl = document.createElement("span");
    this.titleEl.className = "cw-header-title";
    const headerTextBlock = document.createElement("div");
    headerTextBlock.className = "cw-header-text-block";
    const headerStatus = document.createElement("span");
    headerStatus.className = "cw-header-status";
    headerStatus.innerHTML = '<span class="cw-header-status-dot"></span> En ligne';
    headerTextBlock.appendChild(this.titleEl);
    headerTextBlock.appendChild(headerStatus);
    headerMain.appendChild(this.avatarEl);
    headerMain.appendChild(headerTextBlock);
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "cw-close-btn";
    closeBtn.setAttribute("aria-label", "Close chat");
    closeBtn.innerHTML = SVG_CLOSE;
    closeBtn.addEventListener("click", () => {
      this.bus.emit("__close");
    });
    header.appendChild(headerMain);
    header.appendChild(closeBtn);
    this.messagesArea = document.createElement("div");
    this.messagesArea.className = "cw-messages cw-scrollbar-hidden";
    this.footerSlot = document.createElement("div");
    this.footerSlot.className = "cw-footer-slot";
    this.footerLinksRow = document.createElement("div");
    this.footerLinksRow.className = "cw-footer-links cw-footer-links--stack";
    this.footerLinksRow.setAttribute("role", "toolbar");
    this.footerLinksRow.style.display = "none";
    this.footerCtaBtn = document.createElement("button");
    this.footerCtaBtn.type = "button";
    this.footerCtaBtn.className = "cw-option-btn cw-option-btn--card cw-footer-cta";
    this.footerCtaBtn.style.display = "none";
    this.footerCtaBtn.addEventListener("click", () => this.onFooterCtaClick());
    this.inputContainer = document.createElement("div");
    this.inputContainer.className = "cw-input-area";
    this.inputField = document.createElement("textarea");
    this.inputField.className = "cw-input-field cw-scrollbar-hidden";
    this.inputField.rows = 1;
    this.inputField.placeholder = "Type your message...";
    this.inputField.setAttribute("aria-label", "Message");
    this.inputField.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.submitInput();
      }
    });
    this.inputField.addEventListener("input", () => {
      this.resizeInputField();
      this.updateSendDisabled();
    });
    this.sendBtn = document.createElement("button");
    this.sendBtn.type = "button";
    this.sendBtn.className = "cw-send-btn";
    this.sendBtn.setAttribute("aria-label", "Send message");
    this.sendBtn.innerHTML = SVG_SEND;
    this.sendBtn.disabled = true;
    this.sendBtn.addEventListener("click", () => {
      this.submitInput();
    });
    this.inputContainer.appendChild(this.inputField);
    this.inputContainer.appendChild(this.sendBtn);
    this.footerSlot.appendChild(this.footerLinksRow);
    this.footerSlot.appendChild(this.inputContainer);
    this.footerSlot.appendChild(this.footerCtaBtn);
    this.panel.appendChild(header);
    this.panel.appendChild(this.messagesArea);
    this.panel.appendChild(this.footerSlot);
    this.root.appendChild(fab);
    this.root.appendChild(this.panel);
    document.body.appendChild(this.root);
    this.attachTranscriptScrollBehavior();
    this.applyStaticUiDefaults();
    this.resizeInputField();
    this.updateSendDisabled();
    this.syncFooterVisibility();
  }
  /** Pin-to-bottom when the user is following; re-scroll after lazy media / staged DOM without ResizeObserver on scrollHeight-only growth. */
  attachTranscriptScrollBehavior() {
    this.messagesScrollHandler = () => {
      this.followLatest = this.isNearBottom();
    };
    this.messagesArea.addEventListener("scroll", this.messagesScrollHandler, { passive: true });
    this.messagesLoadCaptureHandler = (e) => {
      const t = e.target;
      if (!(t instanceof HTMLImageElement) && !(t instanceof HTMLVideoElement)) return;
      if (isInsideFaqSubtree(t) || isFaqPinLocked(this.messagesArea)) return;
      if (this.followLatest) {
        this.scrollToLatest(false);
      }
    };
    this.messagesArea.addEventListener("load", this.messagesLoadCaptureHandler, true);
    this.messagesMutationObserver = new MutationObserver((records) => {
      if (!this.followLatest || isFaqPinLocked(this.messagesArea)) return;
      if (records.length > 0 && records.every((r) => isInsideFaqSubtree(r.target))) {
        return;
      }
      if (this.mutationScrollScheduled) return;
      this.mutationScrollScheduled = true;
      requestAnimationFrame(() => {
        this.mutationScrollScheduled = false;
        if (this.followLatest) {
          this.scrollToLatest(false);
        }
      });
    });
    this.messagesMutationObserver.observe(this.messagesArea, {
      childList: true,
      subtree: true,
      attributes: true
    });
  }
  renderNode(node, context = {}, options) {
    var _a, _b, _c, _d, _e, _f, _g;
    const readOnly = Boolean(options == null ? void 0 : options.readOnly);
    const hasForm = Boolean((_c = (_b = (_a = node.input) == null ? void 0 : _a.form) == null ? void 0 : _b.fields) == null ? void 0 : _c.length);
    const skipEmptyIntroBubble = hasForm && !((_d = node.message) == null ? void 0 : _d.trim()) && !node.media;
    if (!skipEmptyIntroBubble) {
      const msgEl = this.messageRenderer.renderMessage(
        node,
        this.messagesArea,
        context,
        void 0,
        this.interpolateDebug
      );
      this.messagesArea.appendChild(msgEl);
    }
    if (!readOnly && node.options && node.options.length > 0) {
      const optsEl = this.optionsRenderer.renderOptions(
        node.options,
        (actions, label) => {
          this.pendingForceScroll = true;
          this.renderUserMessage(label);
          this.bus.emit("__recordUserOption", { label, nodeId: node.id, flowId: this.activeFlowId });
          this.bus.emit("__optionClick", { actions, nodeId: node.id, flowId: this.activeFlowId });
        },
        context,
        void 0,
        this.interpolateDebug
      );
      this.messagesArea.appendChild(optsEl);
    }
    if (!readOnly && ((_g = (_f = (_e = node.input) == null ? void 0 : _e.form) == null ? void 0 : _f.fields) == null ? void 0 : _g.length)) {
      const formEl = renderFormBlock(
        node,
        context,
        (values) => {
          var _a2;
          const fd = (_a2 = node.input) == null ? void 0 : _a2.form;
          const ctxForEcho = this.mergeFormValuesIntoContext(this.lastContext, node, values);
          const messageSentText = (fd == null ? void 0 : fd.submitMessage) && fd.submitMessage.trim() !== "" ? interpolateAll(fd.submitMessage, ctxForEcho, void 0, this.interpolateDebug) : (fd == null ? void 0 : fd.submitLabel) && fd.submitLabel.trim() !== "" ? interpolateAll(fd.submitLabel, ctxForEcho, void 0, this.interpolateDebug) : "Continuer";
          this.pendingForceScroll = true;
          this.bus.emit("messageSent", {
            text: messageSentText,
            nodeId: node.id,
            flowId: this.activeFlowId
          });
          this.bus.emit("__formSubmitted", {
            submitEcho: messageSentText,
            nodeId: node.id,
            flowId: this.activeFlowId
          });
          this.bus.emit("__processFormSubmit", { values });
        },
        this.interpolateDebug,
        this.avatarSrc
      );
      this.messagesArea.appendChild(formEl);
    }
    if (this.inputField) {
      this.inputField.placeholder = this.inputManager.getPlaceholder();
    }
    const force = this.pendingForceScroll;
    this.pendingForceScroll = false;
    this.scrollToLatest(force);
  }
  /** Same key mapping as `ConversationEngine.processFormSubmit`, so `submitMessage` can interpolate before the engine runs. */
  mergeFormValuesIntoContext(base, node, values) {
    var _a, _b, _c, _d;
    const out = { ...base };
    const fields = (_b = (_a = node.input) == null ? void 0 : _a.form) == null ? void 0 : _b.fields;
    if (!fields) return out;
    for (const f of fields) {
      const key = (_c = f.contextKey) != null ? _c : f.id;
      out[key] = ((_d = values[f.id]) != null ? _d : "").trim();
    }
    return out;
  }
  submitInput() {
    const text = this.inputField.value;
    if (!text.trim()) return;
    this.inputManager.handleSubmit(text, {
      activeFlowId: this.activeFlowId,
      activeNodeId: this.activeNodeId
    });
    this.renderUserMessage(text.replace(/<[^>]*>?/gm, "").trim());
    this.inputField.value = "";
    this.resizeInputField();
    this.updateSendDisabled();
    this.scrollToLatest(true);
  }
  renderUserMessage(text) {
    const userMsg = document.createElement("div");
    userMsg.className = "cw-message cw-user-message";
    userMsg.textContent = text;
    this.messagesArea.appendChild(userMsg);
    this.scrollToLatest(true);
  }
  clearTranscript() {
    if (!this.messagesArea) return;
    this.messagesArea.replaceChildren();
    this.removeTypingIndicator();
    this.followLatest = true;
  }
  hydrateTranscript(entries, context) {
    this.clearTranscript();
    this.lastContext = context != null ? context : {};
    for (const entry of entries) {
      if (entry.kind === "bot") {
        const botNode = entry.node;
        if (!botNode) continue;
        this.renderNode(botNode, this.lastContext, { readOnly: true });
        continue;
      }
      if (entry.kind === "user_text") {
        this.renderUserMessage(entry.text);
        continue;
      }
      if (entry.kind === "user_option") {
        this.renderUserMessage(entry.label);
        continue;
      }
      this.renderUserMessage(entry.submitEcho);
    }
  }
  unmount() {
    var _a;
    if (this.messagesArea && this.messagesScrollHandler) {
      this.messagesArea.removeEventListener("scroll", this.messagesScrollHandler);
      this.messagesScrollHandler = null;
    }
    if (this.messagesArea && this.messagesLoadCaptureHandler) {
      this.messagesArea.removeEventListener("load", this.messagesLoadCaptureHandler, true);
      this.messagesLoadCaptureHandler = null;
    }
    (_a = this.messagesMutationObserver) == null ? void 0 : _a.disconnect();
    this.messagesMutationObserver = null;
    if (this.root && this.root.parentNode) {
      this.root.parentNode.removeChild(this.root);
    }
  }
  resizeInputField() {
    if (!this.inputField) return;
    const el = this.inputField;
    const cs = getComputedStyle(el);
    let lh = parseFloat(cs.lineHeight);
    if (Number.isNaN(lh) || lh < 6) {
      const fs = parseFloat(cs.fontSize) || 16;
      lh = fs * 1.45;
    }
    const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const maxH = lh * 4 + padY;
    el.style.maxHeight = `${maxH}px`;
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, maxH);
    el.style.height = `${Math.max(next, lh + padY)}px`;
  }
  updateSendDisabled() {
    if (!this.sendBtn || !this.inputField) return;
    this.sendBtn.disabled = !this.inputManager.isEnabled() || !this.inputField.value.trim();
  }
  syncFooterLinks(node) {
    if (!this.footerLinksRow) return;
    this.footerLinksRow.replaceChildren();
    const links = node.footerLinks;
    if (!(links == null ? void 0 : links.length)) {
      this.footerLinksRow.style.display = "none";
      return;
    }
    this.footerLinksRow.style.display = "flex";
    for (const link of links) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cw-footer-link-btn";
      const label = interpolateAll(link.label, this.lastContext, void 0, this.interpolateDebug);
      if (link.icon) {
        const iconWrap = document.createElement("span");
        iconWrap.className = "cw-footer-link-icon";
        iconWrap.setAttribute("aria-hidden", "true");
        iconWrap.appendChild(createOptionIcon(link.icon));
        btn.appendChild(iconWrap);
      }
      const labelEl = document.createElement("span");
      labelEl.className = "cw-footer-link-label";
      labelEl.textContent = label;
      btn.appendChild(labelEl);
      appendCardChevron(btn);
      btn.setAttribute("aria-label", label);
      btn.addEventListener("click", () => {
        this.pendingForceScroll = true;
        this.bus.emit("__optionClick", { actions: link.actions, label, nodeId: node.id, flowId: this.activeFlowId });
      });
      this.footerLinksRow.appendChild(btn);
    }
  }
  applyStaticUiDefaults() {
    if (!this.root) return;
    this.root.classList.remove("cw-placement-left");
    this.root.classList.add("cw-placement-right");
    this.root.style.setProperty("right", "max(20px, env(safe-area-inset-right, 0px))");
    this.root.style.removeProperty("left");
    this.titleEl.textContent = "Ca$hy";
    this.avatarEl.src = this.avatarSrc;
    this.avatarEl.alt = "Ca$hy";
    this.avatarEl.hidden = false;
  }
  injectStyles() {
    if (document.getElementById("cw-theme-styles")) return;
    const style = document.createElement("style");
    style.id = "cw-theme-styles";
    style.textContent = BASE_CSS;
    document.head.appendChild(style);
  }
  isNearBottom() {
    const el = this.messagesArea;
    if (!el) return true;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll <= 0) return true;
    return el.scrollTop >= maxScroll - SCROLL_NEAR_BOTTOM_PX;
  }
  /**
   * Scrolls so the latest message is in view. When `force` is false, scrolls only if the user is
   * following new messages (`followLatest`) or is still near the bottom (instantaneous layout).
   * `force` is used after `startFlow`, option clicks, and user-sent messages.
   */
  scrollToLatest(force) {
    if (!force && !this.followLatest && !this.isNearBottom()) return;
    if (!this.messagesArea || isFaqPinLocked(this.messagesArea)) return;
    const run = () => {
      if (!this.messagesArea || isFaqPinLocked(this.messagesArea)) return;
      const area = this.messagesArea;
      area.scrollTop = area.scrollHeight;
      const last = area.lastElementChild;
      if (last && typeof last.scrollIntoView === "function" && !isInsideFaqSubtree(last)) {
        last.scrollIntoView({ block: "end", inline: "nearest" });
      }
      this.followLatest = true;
    };
    requestAnimationFrame(() => requestAnimationFrame(run));
  }
  syncFooterCtaContent() {
    if (!this.footerCtaBtn || !this.footerCtaConfig) return;
    const cfg = this.footerCtaConfig;
    const label = interpolateAll(cfg.label, this.lastContext, void 0, this.interpolateDebug);
    const subtitle = cfg.subtitle !== void 0 && cfg.subtitle !== "" ? interpolateAll(cfg.subtitle, this.lastContext, void 0, this.interpolateDebug) : "";
    fillCardOptionButton(this.footerCtaBtn, {
      label,
      ...subtitle ? { subtitle } : {},
      ...cfg.icon ? { icon: cfg.icon } : {}
    });
  }
  /**
   * Footer CTA replaces the textarea row when active. Otherwise show the composer only when input is enabled
   * (per-node `input.enabled` or host `enableInput` / `disableInput`). Disabled = row hidden, not greyed.
   * `footerLinks` stay visible when set on the current node (see `syncFooterLinks`).
   */
  syncFooterVisibility() {
    var _a, _b;
    if (!this.inputContainer || !this.footerCtaBtn || !this.inputField || !this.sendBtn) return;
    if (this.footerCtaConfig) {
      this.footerCtaBtn.style.display = "";
      this.inputContainer.style.display = "none";
      return;
    }
    this.footerCtaBtn.style.display = "none";
    if (this.lastNodeWasTerminal) {
      this.inputContainer.style.display = "none";
      return;
    }
    if ((_b = (_a = this.lastRenderedNode) == null ? void 0 : _a.input) == null ? void 0 : _b.form) {
      this.inputContainer.style.display = "none";
      this.inputField.disabled = true;
      this.inputContainer.classList.remove("cw-input-area--readonly");
      return;
    }
    if (!this.inputManager.isEnabled()) {
      this.inputContainer.style.display = "none";
      this.inputField.disabled = true;
      this.inputContainer.classList.remove("cw-input-area--readonly");
      return;
    }
    this.inputContainer.style.display = "flex";
    this.inputField.disabled = false;
    this.inputContainer.classList.remove("cw-input-area--readonly");
    this.updateSendDisabled();
  }
  onFooterCtaClick() {
    if (!this.footerCtaBtn || !this.footerCtaConfig || this.footerCtaBtn.disabled) return;
    const cfg = this.footerCtaConfig;
    const label = interpolateAll(cfg.label, this.lastContext, void 0, this.interpolateDebug);
    this.pendingForceScroll = true;
    this.renderUserMessage(label);
    this.footerCtaBtn.disabled = true;
    this.footerCtaBtn.classList.add("cw-disabled");
    this.bus.emit("__optionClick", {
      actions: cfg.actions,
      label,
      nodeId: this.activeNodeId,
      flowId: this.activeFlowId
    });
  }
  showTypingIndicator() {
    if (!this.messagesArea) return;
    this.removeTypingIndicator();
    const typingInner = this.optionsRenderer.renderTypingIndicator();
    const row = document.createElement("div");
    row.className = "cw-message-row";
    row.appendChild(createBotAvatarElement(this.avatarSrc));
    row.appendChild(typingInner);
    this.typingIndicatorEl = row;
    this.messagesArea.appendChild(row);
    this.scrollToLatest(false);
  }
  removeTypingIndicator() {
    var _a;
    if ((_a = this.typingIndicatorEl) == null ? void 0 : _a.parentNode) {
      this.typingIndicatorEl.parentNode.removeChild(this.typingIndicatorEl);
    }
    this.typingIndicatorEl = null;
  }
}
class TranscriptRecorder {
  constructor(bus, state) {
    this.bus = bus;
    this.state = state;
    this.unsubs = [];
    this.isReplaying = false;
    this.unsubs.push(
      this.bus.on("__transcriptReplayStart", () => {
        this.isReplaying = true;
      }),
      this.bus.on("__transcriptReplayEnd", () => {
        this.isReplaying = false;
      }),
      this.bus.on("__render", (payload) => {
        var _a;
        if (this.isReplaying) return;
        const state2 = this.state.restore();
        const flowId = this.normalizeText(payload == null ? void 0 : payload.flowId) || this.normalizeText(state2.activeFlowId);
        const nodeId = this.normalizeText((_a = payload == null ? void 0 : payload.node) == null ? void 0 : _a.id) || this.normalizeText(state2.activeNodeId);
        if (!flowId || !nodeId) return;
        this.append({
          kind: "bot",
          flowId,
          nodeId,
          ts: Date.now()
        });
      }),
      this.bus.on("__recordUserOption", (payload) => {
        if (this.isReplaying) return;
        const state2 = this.state.restore();
        const flowId = this.normalizeText(payload == null ? void 0 : payload.flowId) || this.normalizeText(state2.activeFlowId);
        const nodeId = this.normalizeText(payload == null ? void 0 : payload.nodeId);
        const label = this.normalizeText(payload == null ? void 0 : payload.label);
        if (!flowId || !nodeId || !label) return;
        this.append({
          kind: "user_option",
          flowId,
          nodeId,
          label,
          ts: Date.now()
        });
      }),
      this.bus.on("messageSent", (payload) => {
        if (this.isReplaying) return;
        const state2 = this.state.restore();
        const flowId = this.normalizeText(payload == null ? void 0 : payload.flowId) || this.normalizeText(state2.activeFlowId);
        const nodeId = this.normalizeText(payload == null ? void 0 : payload.nodeId) || this.normalizeText(state2.activeNodeId);
        const text = this.normalizeText(payload == null ? void 0 : payload.text);
        if (!flowId || !nodeId || !text) return;
        this.append({
          kind: "user_text",
          flowId,
          nodeId,
          text,
          ts: Date.now()
        });
      }),
      this.bus.on("__formSubmitted", (payload) => {
        if (this.isReplaying) return;
        const state2 = this.state.restore();
        const flowId = this.normalizeText(payload == null ? void 0 : payload.flowId) || this.normalizeText(state2.activeFlowId);
        const nodeId = this.normalizeText(payload == null ? void 0 : payload.nodeId) || this.normalizeText(state2.activeNodeId);
        const submitEcho = this.normalizeText(payload == null ? void 0 : payload.submitEcho);
        if (!flowId || !nodeId || !submitEcho) return;
        this.append({
          kind: "user_form",
          flowId,
          nodeId,
          submitEcho,
          ts: Date.now()
        });
      }),
      this.bus.on("stateCleared", () => {
        this.clear();
      })
    );
  }
  destroy() {
    for (const unsub of this.unsubs) unsub();
    this.unsubs.length = 0;
  }
  clear() {
    const currentState = this.state.restore();
    this.state.save({ ...currentState, transcript: [] });
  }
  append(entry) {
    const currentState = this.state.restore();
    const transcript = [...currentState.transcript, entry];
    this.state.save({
      ...currentState,
      transcript
    });
  }
  normalizeText(value) {
    return typeof value === "string" ? value.trim() : "";
  }
}
const VISITOR_KEY_SUFFIX = "_visitor_id";
const LEGACY_CLIENT_USER_KEY_SUFFIX = "_client_user_id";
function storageKeyForVisitor(storageKey) {
  const base = typeof storageKey === "string" && storageKey.trim() !== "" ? storageKey.trim() : "default";
  return `cw_${base}${VISITOR_KEY_SUFFIX}`;
}
function legacyStorageKeyForVisitor(storageKey) {
  const base = typeof storageKey === "string" && storageKey.trim() !== "" ? storageKey.trim() : "default";
  return `cw_${base}${LEGACY_CLIENT_USER_KEY_SUFFIX}`;
}
function createVisitorId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `cw_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 11)}`;
}
function readStoredVisitorId(primaryKey, legacyKey) {
  try {
    const primary = localStorage.getItem(primaryKey);
    if (typeof primary === "string" && primary.trim() !== "") {
      return primary.trim();
    }
    const legacy = localStorage.getItem(legacyKey);
    if (typeof legacy === "string" && legacy.trim() !== "") {
      const id = legacy.trim();
      try {
        localStorage.setItem(primaryKey, id);
      } catch (e) {
      }
      return id;
    }
  } catch (e) {
  }
  return null;
}
function writeStoredVisitorId(key, visitorId) {
  try {
    localStorage.setItem(key, visitorId);
  } catch (e) {
  }
}
function peekVisitorId(storageKey) {
  const key = storageKeyForVisitor(storageKey);
  const legacyKey = legacyStorageKeyForVisitor(storageKey);
  const existing = readStoredVisitorId(key, legacyKey);
  if (!existing) return null;
  return { visitorId: existing, isReturning: true };
}
function getOrCreateVisitorId(storageKey) {
  const key = storageKeyForVisitor(storageKey);
  const legacyKey = legacyStorageKeyForVisitor(storageKey);
  const existing = readStoredVisitorId(key, legacyKey);
  if (existing) {
    return { visitorId: existing, isReturning: true };
  }
  const visitorId = createVisitorId();
  writeStoredVisitorId(key, visitorId);
  return { visitorId, isReturning: false };
}
function flowsFromFetchedJson(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const flows = data.flows;
    if (Array.isArray(flows)) return flows;
  }
  return null;
}
class ChatWidgetImpl {
  constructor() {
    this.bus = new EventBus();
    this.isInitialized = false;
    this.embedChromeVisible = true;
    this.destroyed = false;
    this.pendingCalls = [];
  }
  guardInitialized() {
    if (!this.isInitialized) {
      throw new Error("[ChatWidget] Widget must be fully initialized before executing commands.");
    }
  }
  /** Runs after `init` completes if the widget is not yet initialized; preserves call order in `pendingCalls`. */
  enqueueOrRun(fn) {
    if (!this.isInitialized) {
      this.pendingCalls.push(fn);
      return;
    }
    if (this.destroyed) {
      console.error("[ChatWidget] Widget has been destroyed; call ignored.");
      return;
    }
    fn();
  }
  flushPendingCalls() {
    while (this.pendingCalls.length > 0) {
      const run = this.pendingCalls.shift();
      run == null ? void 0 : run();
    }
  }
  async init(config) {
    var _a, _b;
    this.destroyed = false;
    if (this.isInitialized) return;
    if (config.debug) {
      const originalEmit = this.bus.emit.bind(this.bus);
      this.bus.emit = (event, payload) => {
        console.log(`[ChatWidget] ${event}`, payload);
        originalEmit(event, payload);
      };
    }
    const validator = new JsonValidator();
    try {
      let rawFlows = [];
      if (config.flowUrl) {
        const url = config.flowUrl;
        if (Array.isArray(config.flows) && config.flows.length > 0) {
          console.warn(
            '[ChatWidget] Both "flowUrl" and "flows" were provided; using flowUrl and ignoring inline flows.'
          );
        }
        try {
          const res = await fetch(url);
          if (!res.ok) {
            throw new Error(`[ChatWidget] flowUrl fetch failed: HTTP ${res.status}`);
          }
          const data = await res.json();
          const parsed = flowsFromFetchedJson(data);
          if (parsed === null) {
            throw new Error("[ChatWidget] flowUrl response must be a flow array or { flows: Flow[] }");
          }
          rawFlows = parsed;
        } catch (e) {
          const err = e instanceof Error ? e : new Error(String(e));
          console.error("[ChatWidget] Failed to load flows from flowUrl", err);
          this.bus.emit("loadError", { url, error: err });
          rawFlows = [];
        }
      } else if (config.flows) {
        rawFlows = [...config.flows];
      }
      const safeConfig = validator.validate({ ...config, flows: rawFlows });
      this.router = new FlowRouter(safeConfig.flows || []);
      this.stateManager = new StateManager(
        safeConfig.storageKey || "cw-default-store",
        Boolean(safeConfig.debug)
      );
      const sessionClientId = typeof safeConfig.clientUserId === "string" && safeConfig.clientUserId.trim() !== "" ? safeConfig.clientUserId.trim() : "";
      if (sessionClientId) {
        const restored = this.stateManager.restore();
        if (typeof restored.sessionOwnerId === "string" && restored.sessionOwnerId.trim() !== "" && restored.sessionOwnerId.trim() !== sessionClientId) {
          this.stateManager.clear();
        }
      }
      this.actionProcessor = new ActionProcessor(
        this.router,
        this.bus,
        this.stateManager,
        Boolean(safeConfig.debug)
      );
      this.engine = new ConversationEngine(
        this.router,
        this.actionProcessor,
        this.stateManager,
        this.bus,
        (_a = safeConfig.typingDelay) != null ? _a : 600,
        Boolean(safeConfig.debug)
      );
      const avatarSrc = typeof safeConfig.brandAvatarUrl === "string" && safeConfig.brandAvatarUrl.length > 0 ? safeConfig.brandAvatarUrl : BUNDLED_BOT_AVATAR_URL;
      this.ui = new ChatUI(this.bus, avatarSrc);
      this.ui.mount();
      this.transcriptRecorder = new TranscriptRecorder(this.bus, this.stateManager);
      this.embedChromeVisible = safeConfig.embedVisible !== false;
      this.ui.setEmbedVisible(this.embedChromeVisible);
      if (Boolean(safeConfig.hideEmbedOnClose)) {
        this.bus.on("__close", () => {
          if (!this.ui) return;
          this.embedChromeVisible = false;
          this.ui.setEmbedVisible(false);
        });
      }
      this.bus.on("__setEmbedChromeVisible", (payload) => {
        const visible = payload == null ? void 0 : payload.visible;
        if (typeof visible !== "boolean") return;
        this.enqueueOrRun(() => {
          var _a2;
          if (this.destroyed) return;
          this.embedChromeVisible = visible;
          (_a2 = this.ui) == null ? void 0 : _a2.setEmbedVisible(visible);
        });
      });
      if (safeConfig.inputEnabled === false) {
        this.bus.emit("__disableInput");
      } else {
        this.bus.emit("__enableInput", {
          placeholder: safeConfig.inputPlaceholder
        });
      }
      if (safeConfig.footerCta != null) {
        this.bus.emit("__setFooterCta", { config: safeConfig.footerCta });
      }
      this.isInitialized = true;
      if (sessionClientId) {
        this.bus.emit("__setContext", {
          data: { cwSessionUserId: sessionClientId },
          replace: false
        });
      }
      const hadStoredSession = this.engine.hasRestorableSession();
      const resumed = this.engine.resumeSession();
      if (hadStoredSession && !resumed) {
        console.warn("[ChatWidget] Stored session points to a missing node. Clearing persisted state.");
        this.stateManager.clear();
        this.engine.clearSession();
        this.bus.emit("stateCleared");
      }
      if (!resumed && safeConfig.defaultFlowId) {
        this.startFlow(safeConfig.defaultFlowId);
      }
      const state = this.engine.getState();
      const shouldOpen = safeConfig.autoOpen || state.isOpen;
      if (shouldOpen) {
        this.open();
      }
      this.flushPendingCalls();
      this.bus.emit("ready");
      if (safeConfig.debug) {
        const storageKey = (_b = safeConfig.storageKey) != null ? _b : "cw-default-store";
        console.log(
          `[ChatWidget] Initialized with storageKey: '${storageKey}'. Ensure this matches on all pages.`
        );
      }
      if (typeof window !== "undefined") {
        window.ChatWidget = this;
      }
    } catch (e) {
      this.pendingCalls = [];
      throw e;
    }
  }
  setEmbedVisible(visible) {
    this.enqueueOrRun(() => {
      this.embedChromeVisible = visible;
      this.ui.setEmbedVisible(visible);
    });
  }
  open() {
    this.enqueueOrRun(() => {
      if (!this.embedChromeVisible) {
        this.embedChromeVisible = true;
        this.ui.setEmbedVisible(true);
      }
      this.bus.emit("__open");
    });
  }
  close() {
    this.enqueueOrRun(() => this.bus.emit("__close"));
  }
  toggle() {
    this.enqueueOrRun(() => {
      const state = this.engine.getState();
      if (state.isOpen) this.close();
      else this.open();
    });
  }
  startFlow(flowId) {
    this.enqueueOrRun(() => this.engine.startFlow(flowId));
  }
  goToNode(nodeId, flowId) {
    this.enqueueOrRun(() => this.engine.goToNode(nodeId, flowId));
  }
  resetFlow() {
    this.enqueueOrRun(() => this.engine.resetFlow());
  }
  back() {
    this.enqueueOrRun(() => this.engine.back());
  }
  goToFlowStart(flowId) {
    this.enqueueOrRun(() => this.engine.goToFlowStart(flowId));
  }
  enableInput(placeholder) {
    this.enqueueOrRun(() => this.bus.emit("__enableInput", { placeholder }));
  }
  disableInput() {
    this.enqueueOrRun(() => this.bus.emit("__disableInput"));
  }
  setInputPlaceholder(text) {
    this.enqueueOrRun(() => this.bus.emit("__enableInput", { placeholder: text }));
  }
  sendMessage(text) {
    this.enqueueOrRun(() => this.bus.emit("__simulateUserMessage", text));
  }
  setContext(data) {
    this.enqueueOrRun(() => this.bus.emit("__setContext", { data, replace: true }));
  }
  getContext() {
    this.guardInitialized();
    return this.stateManager.restore().context || {};
  }
  mergeContext(data) {
    this.enqueueOrRun(() => this.bus.emit("__setContext", { data, replace: false }));
  }
  runIfSessionMatches(remoteClientUserId, fn) {
    this.guardInitialized();
    const rid = typeof remoteClientUserId === "string" ? remoteClientUserId.trim() : "";
    if (!rid) {
      return false;
    }
    const localRaw = this.getContext()["cwSessionUserId"];
    const lid = typeof localRaw === "string" ? localRaw.trim() : localRaw != null && (typeof localRaw === "number" || typeof localRaw === "boolean") ? String(localRaw).trim() : "";
    if (!lid || lid !== rid) {
      return false;
    }
    this.enqueueOrRun(fn);
    return true;
  }
  getState() {
    this.guardInitialized();
    return this.engine.getState();
  }
  getOrCreateVisitorId(storageKey) {
    return getOrCreateVisitorId(storageKey);
  }
  peekVisitorId(storageKey) {
    return peekVisitorId(storageKey);
  }
  clearState() {
    this.enqueueOrRun(() => {
      this.stateManager.clear();
      this.engine.clearSession();
      this.bus.emit("stateCleared");
    });
  }
  setFooterCta(config) {
    this.enqueueOrRun(() => this.bus.emit("__setFooterCta", { config }));
  }
  on(event, callback) {
    return this.bus.on(event, callback);
  }
  destroy() {
    var _a, _b;
    if (!this.isInitialized) return;
    this.pendingCalls = [];
    this.destroyed = true;
    this.embedChromeVisible = true;
    (_a = this.ui) == null ? void 0 : _a.unmount();
    (_b = this.transcriptRecorder) == null ? void 0 : _b.destroy();
    this.transcriptRecorder = void 0;
    this.bus.clear();
    this.isInitialized = false;
    if (typeof window !== "undefined") {
      delete window.ChatWidget;
    }
  }
}
const widget = new ChatWidgetImpl();
if (typeof window !== "undefined") {
  window.ChatWidget = widget;
}
export {
  widget as default,
  getOrCreateVisitorId,
  peekVisitorId
};
