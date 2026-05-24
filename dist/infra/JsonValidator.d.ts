import { ChatWidgetConfig } from '../types';
export declare class JsonValidator {
    private validActionTypes;
    validate(config: unknown): ChatWidgetConfig;
    private validateFooterCta;
    private validateFlows;
    private validateNodes;
    private validateFormField;
    private validateOption;
    private validateFooterLink;
    private validateActions;
    private validateMedia;
    private validateImageSelectItems;
    private validatePackageSelectItems;
    private validateMediaItems;
    private validateFaqMedia;
    private validateFaqNestedMedia;
}
