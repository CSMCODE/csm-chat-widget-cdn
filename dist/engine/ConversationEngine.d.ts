import { FlowRouter } from './FlowRouter';
import { ActionProcessor } from './ActionProcessor';
import { StateManager } from '../infra/StateManager';
import { EventBus } from '../infra/EventBus';
import { WidgetState, ActionType } from '../types';
export declare class ConversationEngine {
    private readonly router;
    private readonly actionProcessor;
    private readonly state;
    private readonly bus;
    private readonly typingDelayMs;
    private readonly debug;
    private activeFlowId;
    private activeNodeId;
    private history;
    private flowStack;
    private context;
    /** While true, additional navigation calls are ignored so only one transition updates active flow, node, and history at a time. */
    private isTransitioning;
    private pendingTypingTimer;
    private pendingWaitTimer;
    private renderGeneration;
    /** True only while rendering a node rehydrated from persisted state (`restoreState`). Suppresses `flowCompleted` on rehydration. */
    private restoreHydrationRender;
    /** True only while resume fast-forward is running chained `onEnter` actions without delays. */
    private isResumeFastForward;
    constructor(router: FlowRouter, actionProcessor: ActionProcessor, state: StateManager, bus: EventBus, typingDelayMs?: number, debug?: boolean);
    private restoreState;
    hasRestorableSession(): boolean;
    resumeSession(): boolean;
    private saveState;
    private pushHistory;
    /**
     * Sets a fresh flow stack (single entry) and clears breadcrumb history. Each call establishes
     * the active flow from its entry node; `back()` only traverses history created after this call.
     */
    startFlow(flowId: string): void;
    /**
     * Updates persisted `activeFlowId` and `activeNodeId` before rendering so stored state always
     * matches the node about to be shown (including cross-flow navigation).
     */
    goToNode(nodeId: string, flowId?: string): void;
    resetFlow(): void;
    back(): void;
    goToFlowStart(flowId: string): void;
    clearSession(): void;
    processInput(text: string): void;
    /** Multi-field `input.form`: merges values into context, then runs `onSubmit` actions. */
    processFormSubmit(values: Record<string, string>): void;
    processOptionClick(actions: readonly ActionType[], nodeId: string): void;
    private executeActions;
    /**
     * Runs actions in order; `wait` defers the rest of the list until after `ms` (clamped 0–60_000).
     */
    private runActionSlice;
    getState(): WidgetState;
    private clearPendingTyping;
    private clearPendingWait;
    private nodeWaitsForUser;
    private fastForwardAutoChainFromActiveNode;
    private warnMissingContextKeysForRender;
    private emitRenderAndFollowup;
    private renderNode;
    private exitNode;
}
