/** Same pattern for discovery and replacement of `{{context.*}}` bindings. */
export declare const CONTEXT_BINDING_REGEX: RegExp;
/** Paths inside templates, e.g. `name` or `user.id` (same groups as {@link CONTEXT_BINDING_REGEX}). */
export declare function extractContextKeysFromTemplate(template: string): string[];
/**
 * Context templates: regex-only replacement — no eval, no `Function`, no arbitrary code execution.
 */
export declare function interpolateContext(template: string, context: Record<string, unknown>, debug?: boolean): string;
/**
 * Maps single input triggers exactly onto sequence layouts dynamically.
 */
export declare function interpolateInput(template: string, userInput: string): string;
/**
 * Sequential orchestration formatting layouts dynamically based strictly on resolved scopes mapping sequentially.
 */
export declare function interpolateAll(template: string, context: Record<string, unknown>, userInput?: string, debug?: boolean): string;
