import { EventBus } from '../infra/EventBus';
import { FlowNode } from '../types';
export declare class ChatUI {
    private readonly bus;
    private readonly avatarSrc;
    private root;
    private panel;
    private footerSlot;
    private footerCtaBtn;
    private inputContainer;
    private inputField;
    private messagesArea;
    private titleEl;
    private avatarEl;
    private sendBtn;
    private footerCtaConfig;
    private footerLinksRow;
    private messageRenderer;
    private optionsRenderer;
    private inputManager;
    private activeFlowId;
    private activeNodeId;
    private lastContext;
    private interpolateDebug;
    private typingIndicatorEl;
    /** Terminal nodes and disabled input (`input.enabled: false` or `disableInput()`) hide the composer entirely. */
    private lastNodeWasTerminal;
    /** Last bot node rendered; used to hide the composer when `input.form` is active. */
    private lastRenderedNode;
    /** After `startFlow`, option/footer clicks: next bot `__render` should scroll even if the user was reading older messages. */
    private pendingForceScroll;
    /** User expects new bot content to stay in view (scroll listener clears when they scroll up to read). */
    private followLatest;
    private messagesScrollHandler;
    private messagesLoadCaptureHandler;
    private messagesMutationObserver;
    private mutationScrollScheduled;
    constructor(bus: EventBus, avatarSrc: string);
    /** Hide or show the entire widget chrome (launcher + panel). Host-facing API delegates here. */
    setEmbedVisible(visible: boolean): void;
    mount(): void;
    /** Pin-to-bottom when the user is following; re-scroll after lazy media / staged DOM without ResizeObserver on scrollHeight-only growth. */
    private attachTranscriptScrollBehavior;
    renderNode(node: FlowNode, context?: Record<string, unknown>, options?: {
        readOnly?: boolean;
    }): void;
    /** Same key mapping as `ConversationEngine.processFormSubmit`, so `submitMessage` can interpolate before the engine runs. */
    private mergeFormValuesIntoContext;
    private submitInput;
    private renderUserMessage;
    private clearTranscript;
    private hydrateTranscript;
    unmount(): void;
    private resizeInputField;
    private updateSendDisabled;
    private syncFooterLinks;
    private applyStaticUiDefaults;
    private injectStyles;
    private isNearBottom;
    /**
     * Scrolls so the latest message is in view. When `force` is false, scrolls only if the user is
     * following new messages (`followLatest`) or is still near the bottom (instantaneous layout).
     * `force` is used after `startFlow`, option clicks, and user-sent messages.
     */
    private scrollToLatest;
    private syncFooterCtaContent;
    /**
     * Footer CTA replaces the textarea row when active. Otherwise show the composer only when input is enabled
     * (per-node `input.enabled` or host `enableInput` / `disableInput`). Disabled = row hidden, not greyed.
     * `footerLinks` stay visible when set on the current node (see `syncFooterLinks`).
     */
    private syncFooterVisibility;
    private onFooterCtaClick;
    private showTypingIndicator;
    private removeTypingIndicator;
}
