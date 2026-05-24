/**
 * Production: resolve sibling `bot-avatar.png` next to `chat-widget.mjs` (copied at build time; avoids inlining).
 * Non-production (Vitest/dev): resolve the source asset under `src/assets/`.
 */
export declare const BUNDLED_BOT_AVATAR_URL: string;
export declare function createBotAvatarElement(avatarSrc: string): HTMLImageElement;
