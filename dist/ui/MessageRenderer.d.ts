import { FlowNode } from '../types';
import { EventBus } from '../infra/EventBus';
export declare class MessageRenderer {
    private readonly bus;
    private readonly avatarSrc;
    constructor(bus: EventBus, avatarSrc: string);
    /**
     * Renders a bot message. When both `message` and `media.type === "faq"` are set,
     * returns a `DocumentFragment` with two bubbles (intro text, then FAQ) so the accordion
     * is not nested inside the same container as the intro copy.
     */
    renderMessage(node: FlowNode, container: HTMLElement, context?: Record<string, unknown>, userInput?: string, debug?: boolean): HTMLElement | DocumentFragment;
    private wrapBotRow;
    private renderFaqWithIntro;
    /**
     * Renders `text` into a `<p>` using `textContent` only when there are no newlines; otherwise
     * inserts `<br>` between lines so breaks survive host-page CSS (e.g. `white-space` on `p`).
     */
    private setMessageParagraphText;
    private appendMedia;
}
