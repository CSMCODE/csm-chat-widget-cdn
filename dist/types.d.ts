import { VisitorIdentity } from './utils/visitorId';
/**
 * Represents the various actions that can be triggered by options, input submissions, or node lifecycles.
 */
export type ActionType = {
    readonly type: "goToNode";
    readonly nodeId: string;
    readonly flowId?: string;
} | {
    readonly type: "startFlow";
    readonly flowId: string;
} | {
    readonly type: "goToFlowStart";
    readonly flowId: string;
} | {
    readonly type: "resetFlow";
} | {
    readonly type: "back";
} | {
    readonly type: "emitEvent";
    readonly eventName: string;
    readonly payload?: Record<string, unknown>;
} | {
    readonly type: "openWidget";
} | {
    readonly type: "closeWidget";
}
/**
 * Hide or show the entire embed (launcher + panel). Mirrors `ChatWidget.setEmbedVisible`.
 * Emitted by the engine as `__setEmbedChromeVisible`; hosts do not subscribe to that internal event.
 */
 | {
    readonly type: "setEmbedVisible";
    readonly visible: boolean;
} | {
    readonly type: "enableInput";
    readonly placeholder?: string;
} | {
    readonly type: "disableInput";
} | {
    readonly type: "setContext";
    readonly data: Record<string, string | number | boolean>;
}
/**
 * Pauses before running subsequent actions in the same array (e.g. onEnter / onSubmit).
 * `ms` is clamped to 0–60_000. Handled in ConversationEngine, not ActionProcessor.
 */
 | {
    readonly type: "wait";
    readonly ms: number;
};
/** Slide kind for carousel items; omit or `"image"` for images, `"video"` for file URLs in `src`. */
export type MediaItemKind = "image" | "video";
/** One selectable card in `media.type === "image_select"` (image + optional line under + actions on commit). */
export type ImageSelectItem = {
    readonly src: string;
    readonly alt: string;
    /**
     * Optional text under the image (beside the radio). Omit when the node `message` carries all copy;
     * user echo and a11y use `label` if set, otherwise `alt`.
     */
    readonly label?: string;
    readonly actions: readonly ActionType[];
};
/** Visual tier for package card chrome (border glow, title tint, offer icon). Omitted items infer order: bronze → silver → gold → black. */
export type PackageSelectTier = "bronze" | "silver" | "gold" | "black";
/** One selectable package card in `media.type === "package_select"` (image + title/offer + actions on commit). */
export type PackageSelectItem = {
    readonly src: string;
    readonly alt: string;
    /** Primary label rendered beside the card image and echoed on selection. */
    readonly title: string;
    /** Optional offer line (for example: `50EUR = 1000EUR de retrait`). */
    readonly offer?: string;
    /** Tier styling; if omitted, the first four items default to bronze/silver/gold/black in order. */
    readonly tier?: PackageSelectTier;
    /** Optional visual badge; at most one item should set this to true per node. */
    readonly mostPopular?: boolean;
    /**
     * When set, this text (after `{{context.*}}` / `{{input}}` interpolation) is shown as the user
     * message on commit instead of the card `title`.
     */
    readonly selectionEcho?: string;
    readonly actions: readonly ActionType[];
};
/** Shared slide shape for `image`, `carousel`, `video`, and FAQ nested media. */
export type MediaItem = {
    readonly src: string;
    readonly alt: string;
    readonly caption?: string;
    /** Omit or `"image"` for images; `"video"` for video file URLs in `src`. */
    readonly kind?: MediaItemKind;
    /** Poster image URL for video slides/clips. */
    readonly poster?: string;
};
/** Optional nested media inside an FAQ answer (single image, video, or carousel). */
export type FaqAnswerMedia = {
    readonly type: "image";
    readonly items: readonly MediaItem[];
} | {
    readonly type: "video";
    readonly items: readonly MediaItem[];
} | {
    readonly type: "carousel";
    readonly items: readonly MediaItem[];
    /**
     * `"mobile"` — taller FAQ carousel strip (`object-fit: contain`) for phone-recorded video
     * and tall screenshots. Omit for the default wide landscape strip.
     */
    readonly layout?: "default" | "mobile";
};
export interface FaqItem {
    readonly question: string;
    readonly answer?: string;
    /** Optional preset icon for the FAQ row trigger. */
    readonly icon?: FlowOptionIcon;
    readonly media?: FaqAnswerMedia;
}
export type FlowNodeMedia = {
    readonly type: "image";
    readonly items: readonly MediaItem[];
}
/**
 * Same `items` shape as `image`, but renders edge-to-edge without the bot bubble chrome
 * (transparent background, no border/shadow on the message shell). Omit `message` for a full-width strip.
 */
 | {
    readonly type: "plain_image";
    readonly items: readonly MediaItem[];
} | {
    readonly type: "carousel";
    readonly items: readonly MediaItem[];
} | {
    readonly type: "video";
    readonly items: readonly MediaItem[];
} | {
    readonly type: "image_select";
    readonly items: readonly ImageSelectItem[];
} | {
    readonly type: "package_select";
    readonly items: readonly PackageSelectItem[];
} | {
    readonly type: "faq";
    readonly items: readonly FaqItem[];
    /** Default `"single"` (only one panel open). `"multiple"` allows several open at once. */
    readonly expandMode?: "single" | "multiple";
}
/** Committed transcript row: status copy in `node.message` + animated dots until navigation changes the node. */
 | {
    readonly type: "validation_pending";
};
/** Preset icons for `layout: "card"` options and FAQ rows (inline SVG only; no arbitrary URLs in JSON). */
export type FlowOptionIcon = "cart" | "help" | "chat" | "package" | "search" | "shield_check" | "package_check" | "shield_lock" | "receipt"
/** Left chevron — useful for sticky footer “back” links */
 | "arrow_left";
export interface FlowNodeOption {
    readonly label: string;
    readonly actions: readonly ActionType[];
    /** Default compact pill; `"card"` renders a full-width row with optional icon and subtitle. */
    readonly layout?: "default" | "card";
    /** Second line when `layout === "card"`; supports `{{context.*}}` / `{{input}}`. */
    readonly subtitle?: string;
    readonly icon?: FlowOptionIcon;
}
/**
 * Sticky text-style actions in the footer (above input or footer CTA). Same `actions` as `options`, but no user-message echo.
 * Use for secondary navigation (e.g. back / go to FAQ) without scrolling with the thread.
 */
export interface FlowNodeFooterLink {
    readonly label: string;
    readonly actions: readonly ActionType[];
    /** Optional leading icon (same preset set as card options). */
    readonly icon?: FlowOptionIcon;
}
/** Single field in a node-level `input.form` (address / lead capture). Values merge into context on submit. */
export interface FlowFormField {
    readonly id: string;
    readonly label: string;
    readonly type?: 'text' | 'tel' | 'email';
    readonly required?: boolean;
    /** Context key for the submitted value (default: same as `id`). */
    readonly contextKey?: string;
    /** Native input placeholder; supports `{{context.*}}` / `{{input}}`. */
    readonly placeholder?: string;
    /**
     * Optional ECMAScript regex source (no slashes). When set with `validationMessage`, the trimmed
     * value must match on submit; supports `^M[A-Z0-9]{9}$` style PCS checks.
     */
    readonly pattern?: string;
    /**
     * Shown under the field when `pattern` is set and the value does not match. Supports
     * `{{context.*}}` / `{{input}}`. Prefer plain text (no HTML).
     */
    readonly validationMessage?: string;
    /** Optional `maxlength` on the native input (UX hint; use `pattern` for real validation). */
    readonly maxLength?: number;
}
export interface FlowNodeInputForm {
    readonly fields: readonly FlowFormField[];
    readonly submitLabel?: string;
    /** If set, used as `messageSent` payload on successful submit (no user bubble; bot `goToNode` shows the reply). */
    readonly submitMessage?: string;
}
/**
 * Optional full-width footer CTA (card style). When set, replaces the text input row until cleared.
 * `label` / `subtitle` support `{{context.*}}` and `{{input}}` like flow options.
 */
export interface FooterCtaConfig {
    readonly label: string;
    readonly actions: readonly ActionType[];
    readonly subtitle?: string;
    readonly icon?: FlowOptionIcon;
}
/**
 * Defines a single step in a conversational flow, including its content, interaction options,
 * input configuration, and lifecycle actions.
 */
export interface FlowNode {
    readonly id: string;
    readonly message?: string;
    readonly media?: FlowNodeMedia;
    readonly options?: readonly FlowNodeOption[];
    /** Optional sticky footer link row (above input / footer CTA); does not echo a user message on click. */
    readonly footerLinks?: readonly FlowNodeFooterLink[];
    readonly input?: {
        readonly enabled: boolean;
        readonly placeholder?: string;
        /**
         * When set, renders a multi-field form in the thread (hides the single-line composer).
         * Submitted values are merged into context, then `onSubmit` runs.
         */
        readonly form?: FlowNodeInputForm;
        readonly onSubmit: readonly ActionType[];
    };
    readonly onEnter?: readonly ActionType[];
    readonly onExit?: readonly ActionType[];
    readonly terminal?: boolean;
    /**
     * When true, skip the typing delay for this node so the bot bubble appears immediately
     * (global `typingDelay` still applies to other nodes).
     */
    readonly immediateRender?: boolean;
}
/**
 * A complete conversational flow, containing an entry point and a collection of connected nodes.
 */
export interface Flow {
    readonly id: string;
    readonly entryNodeId: string;
    readonly nodes: readonly FlowNode[];
}
/**
 * Main configuration object required to initialize the Chat Widget SDK.
 */
export interface ChatWidgetConfig {
    readonly flows?: readonly Flow[];
    readonly flowUrl?: string;
    readonly defaultFlowId?: string;
    readonly autoOpen?: boolean;
    /**
     * When false, the entire embed (launcher + panel) is hidden until `setEmbedVisible(true)` or `open()`
     * (which reveals the embed then opens the panel). Default true. Not persisted — each load follows `init` only.
     */
    readonly embedVisible?: boolean;
    /**
     * When true, any panel close (`__close`) — header X, `ChatWidget.close()`, or flow `closeWidget` —
     * also hides the whole embed (launcher + panel), same as `setEmbedVisible(false)`. Default false.
     * Not persisted. Use `open()` or `setEmbedVisible(true)` to show again.
     */
    readonly hideEmbedOnClose?: boolean;
    readonly storageKey?: string;
    readonly inputEnabled?: boolean;
    readonly inputPlaceholder?: string;
    readonly debug?: boolean;
    /** Milliseconds to show typing indicator before each bot message. Default 600; set to 0 to disable. */
    readonly typingDelay?: number;
    /** Initial footer CTA after `init` (same shape as `setFooterCta`). */
    readonly footerCta?: FooterCtaConfig | null;
    /**
     * Stable id for this browser tab / embed instance, merged into context as **`cwSessionUserId`**
     * (string). Use it to correlate outbound events and to route inbound WebSocket (or HTTP push)
     * messages with `ChatWidget.runIfSessionMatches(...)`. Omit to manage identity only via
     * `mergeContext` / `setContext`.
     */
    readonly clientUserId?: string;
    /**
     * HTTPS URL for the bot avatar image (header + message rows). When omitted, the bundled default PNG is used.
     */
    readonly brandAvatarUrl?: string;
}
export type TranscriptEntry = {
    readonly kind: 'bot';
    readonly flowId: string;
    readonly nodeId: string;
    readonly ts: number;
} | {
    readonly kind: 'user_text';
    readonly flowId: string;
    readonly nodeId: string;
    readonly text: string;
    readonly ts: number;
} | {
    readonly kind: 'user_option';
    readonly flowId: string;
    readonly nodeId: string;
    readonly label: string;
    readonly ts: number;
} | {
    readonly kind: 'user_form';
    readonly flowId: string;
    readonly nodeId: string;
    readonly submitEcho: string;
    readonly ts: number;
};
/**
 * Structure of the conversation state that is saved and restored from localStorage.
 */
export interface WidgetPersistedState {
    readonly version: number;
    /** Unix ms when state was last written (set on each save). */
    readonly lastSeenAt?: number;
    readonly activeFlowId: string | null;
    readonly activeNodeId: string | null;
    readonly flowStack: readonly {
        readonly flowId: string;
        readonly nodeId: string;
    }[];
    readonly history: readonly {
        readonly flowId: string;
        readonly nodeId: string;
        readonly timestamp: number;
    }[];
    readonly transcript: readonly TranscriptEntry[];
    readonly context: Record<string, unknown>;
    /** Mirrors `cwSessionUserId` to avoid cross-user resume when `storageKey` is shared. */
    readonly sessionOwnerId?: string;
    readonly inputEnabled: boolean;
    readonly isOpen: boolean;
}
/**
 * Represents the current runtime state of the widget (used for debugging or analytics).
 */
export interface WidgetState {
    readonly activeFlowId: string | null;
    readonly activeNodeId: string | null;
    readonly history: readonly {
        readonly flowId: string;
        readonly nodeId: string;
    }[];
    readonly isOpen: boolean;
    readonly inputEnabled: boolean;
}
export type { VisitorIdentity } from './utils/visitorId';
/**
 * The complete public API for the Chat Widget SDK available globally on the window.
 */
export interface ChatWidget {
    init(config: ChatWidgetConfig): Promise<void>;
    /**
     * Stable anonymous id for this browser on the current origin.
     * Reads `localStorage` first; creates and stores a UUID on first visit.
     * Use the same `storageKey` as `init({ storageKey })` and pass `visitorId` as `clientUserId`.
     */
    getOrCreateVisitorId(storageKey: string): VisitorIdentity;
    /** Read stored visitor id without creating one; null when none exists yet. */
    peekVisitorId(storageKey: string): VisitorIdentity | null;
    /** Hide or show the whole embed (`#chat-widget-root`). Queued before `init` like other imperative APIs. Not persisted. */
    setEmbedVisible(visible: boolean): void;
    open(): void;
    close(): void;
    toggle(): void;
    startFlow(flowId: string): void;
    goToNode(nodeId: string, flowId?: string): void;
    resetFlow(): void;
    back(): void;
    goToFlowStart(flowId: string): void;
    enableInput(placeholder?: string): void;
    disableInput(): void;
    sendMessage(text: string): void;
    setInputPlaceholder(text: string): void;
    setContext(data: Record<string, string | number | boolean>): void;
    getContext(): Record<string, unknown>;
    mergeContext(data: Record<string, string | number | boolean>): void;
    /**
     * Runs `fn` only if `remoteClientUserId` equals the widget context value **`cwSessionUserId`**
     * (trimmed string equality). Use when the host receives a user-targeted message (e.g. PCS
     * validation result) and must not advance other users’ widgets. Returns whether `fn` was queued.
     */
    runIfSessionMatches(remoteClientUserId: string, fn: () => void): boolean;
    getState(): WidgetState;
    clearState(): void;
    /** Show or hide the footer CTA; when shown, the input row is hidden until cleared. Queued before `init` like other imperative APIs. */
    setFooterCta(config: FooterCtaConfig | null): void;
    on(event: string, callback: (payload?: unknown) => void): () => void;
    destroy(): void;
}
