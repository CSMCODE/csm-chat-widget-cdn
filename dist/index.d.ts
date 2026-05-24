import { ChatWidget as IChatWidget, ChatWidgetConfig, FooterCtaConfig, WidgetState } from './types';
export * from './types';
declare class ChatWidgetImpl implements IChatWidget {
    private bus;
    private stateManager?;
    private router?;
    private actionProcessor?;
    private engine?;
    private ui?;
    private isInitialized;
    /** Mirrors DOM embed visibility (`setEmbedVisible` / `init.embedVisible`). Not persisted. */
    private embedChromeVisible;
    /** True after destroy(); cleared when a new init() begins so the widget can be re-mounted. */
    private destroyed;
    /** Imperative calls before init() are queued; `on()` is not queued so hosts can subscribe to `ready` early. */
    private pendingCalls;
    private guardInitialized;
    /** Runs after `init` completes if the widget is not yet initialized; preserves call order in `pendingCalls`. */
    private enqueueOrRun;
    private flushPendingCalls;
    init(config: ChatWidgetConfig): Promise<void>;
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
    setInputPlaceholder(text: string): void;
    sendMessage(text: string): void;
    setContext(data: Record<string, string | number | boolean>): void;
    getContext(): Record<string, unknown>;
    mergeContext(data: Record<string, string | number | boolean>): void;
    runIfSessionMatches(remoteClientUserId: string, fn: () => void): boolean;
    getState(): WidgetState;
    clearState(): void;
    setFooterCta(config: FooterCtaConfig | null): void;
    on(event: string, callback: (payload?: unknown) => void): () => void;
    destroy(): void;
}
declare const widget: ChatWidgetImpl;
export default widget;
