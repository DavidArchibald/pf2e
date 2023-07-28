import type { ArrayField, BooleanField, StringField } from "types/foundry/common/data/fields.d.ts";
import { RuleElementOptions, RuleElementPF2e, RuleElementSchema, RuleElementSource } from "./index.ts";
import { sluggify } from "@util";
import { ExecuteMacroPF2e } from "@module/execute-macro.ts";

class ExecuteMacroRuleElement extends RuleElementPF2e<ExecuteMacroSchema> {
    constructor(data: ExecuteMacroSource, options: RuleElementOptions) {
        super(data, options);

        // TODO: Is having a selector AND selectors field preferred (see adjust modifier) or is only selector but as a string|string[] preferred (see flat modifier)
        if (typeof data.selector === "string" && this.selectors.length === 0) {
            this.selectors = [data.selector];
        }
    }

    static override defineSchema(): ExecuteMacroSchema {
        const { fields } = foundry.data;
        return {
            ...super.defineSchema(),
            selector: new fields.StringField({ required: false, blank: false, initial: undefined }),
            selectors: new fields.ArrayField(
                new fields.StringField({ required: true, blank: false, initial: undefined })
            ),
            uuid: new fields.StringField({ required: true, nullable: false, blank: false, initial: undefined }),
            optional: new fields.BooleanField({ required: false, nullable: false, initial: false }),
            hideIfDisabled: new fields.BooleanField({ required: false, nullable: false, initial: false }),
        }
    }

    static override validateJoint(data: Record<string, unknown>): void {
        super.validateJoint(data);

        const { DataModelValidationError } = foundry.data.validation;

        const hasSelector = typeof data.selector === "string";
        const hasSelectors = Array.isArray(data.selectors) && data.selectors.length !== 0
        if (!hasSelector && !hasSelectors) {
            throw new DataModelValidationError(
                "  one of `selector` or `selectors` should be set"
            );
        } else if (hasSelector && hasSelectors) {
            throw new DataModelValidationError(
                "  both `selector` and `selectors` cannot be set"
            );
        }
    }

    override beforePrepareData(): void {
        if (this.ignored) return;

        const label = this.getReducedLabel();
        const slug = this.slug ?? sluggify(label);

        const selectors = this.selectors.map((s) => this.resolveInjectedProperties(s)).filter((s) => s);
        if (selectors.length === 0) {
            return this.failValidation("must have at least one selector");
        }

        for (const selector of selectors) {
            // Make the value lazy so dynamic values (currently just predicate) can be setup correctly.
            const lazyExecuteMacro = () => new ExecuteMacroPF2e({
                uuid: this.uuid,
                slug,
                label,
                selector,
                predicate: this.resolveInjectedProperties(this.predicate),
                rule: this,
                hideIfDisabled: this.hideIfDisabled,
                source: this.item.uuid
            })

            const macros = (this.item.ruleMacros[selector] ??= []);
            macros.push(lazyExecuteMacro);
        }
    }
}

type ExecuteMacroSchema = RuleElementSchema & {
    selector: StringField<string, string, false, false, false>;
    selectors: ArrayField<StringField<string, string, true, false, false>>;
    /** The UUID of the macro to execute: must be a compendium or world macro */
    uuid: StringField<string, string, true, false, false>;
    /** Whether the macro is optional to execute. This is only respected during an item's use as there's already a prompt there and adding prompts on arbitrary item updates seems like a bad idea. */
    optional: BooleanField<boolean, boolean, false, false, true>;
    /** Hide this macro execution from breakdown tooltips if it isn't going to run (is disabled) */
    hideIfDisabled: BooleanField<boolean, boolean, false, false, true>;
};

interface ExecuteMacroSource extends RuleElementSource {
    selector?: unknown;
    uuid?: unknown;
    optional?: unknown;
    hideIfDisabled?: unknown;
}

interface ExecuteMacroRuleElement extends RuleElementPF2e<ExecuteMacroSchema>, ModelPropsFromSchema<ExecuteMacroSchema> { }


export { ExecuteMacroRuleElement };