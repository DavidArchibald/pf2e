import { htmlQuery, tagify } from "@util";
import { RuleElementForm, RuleElementFormSheetData } from "./base.ts";
import { ExecuteMacroPF2e, ExecuteMacroSource } from "@module/execute-macro.ts";
import { ExecuteMacroRuleElement } from "@module/rules/rule-element/execute-macro.ts";
import { MacroPF2e } from "@module/macro.ts";

class ExecuteMacroForm extends RuleElementForm<ExecuteMacroSource, ExecuteMacroRuleElement> {
    override template = "systems/pf2e/templates/items/rules/execute-macro.hbs"
    override async getData(): Promise<ExecuteMacroFormData> {
        const data = await super.getData();
        const uuid = this.rule.uuid ? String(this.rule.uuid) : null;
        const macro = uuid ? await ExecuteMacroPF2e.getMacroFromUuid(uuid, false) : null;
        return { ...data, macro };
    }

    override activateListeners(html: HTMLElement): void {
        const selectorElement = htmlQuery<HTMLInputElement>(html, ".selector-list");
        if (selectorElement) {
            tagify(selectorElement);
        }
    }
}

interface ExecuteMacroFormData extends RuleElementFormSheetData<ExecuteMacroSource, ExecuteMacroRuleElement> {
    macro: MacroPF2e | null;
}

export {ExecuteMacroForm};