import { FlowOptionIcon } from '../types';
/** Whitelisted icons for card options (stroke icons on dark tile). */
export declare function createOptionIcon(icon: FlowOptionIcon): SVGSVGElement;
export declare const FLOW_OPTION_ICON_KEYS: readonly FlowOptionIcon[];
export declare function isFlowOptionIcon(s: string): s is FlowOptionIcon;
