import { PredicatePF2e, RawPredicate } from "@system/predication.ts";
import { RuleElementPF2e } from "./rules/index.ts";
import { sluggify } from "@util";
import * as R from "remeda";
import { MacroPF2e } from "./macro.ts";
import { ActorPF2e } from "./documents.ts";
import { TokenPF2e } from "./canvas/index.ts";

class ExecuteMacroPF2e implements ExecuteMacroData {
    uuid: string;
    selector: string;
    slug: string;
    label: string;
    source: string | null;
    predicate: PredicatePF2e;
    hideIfDisabled: boolean;
    rule: RuleElementPF2e | null;

    constructor(params: ExecuteMacroParams) {
        this.uuid = params.uuid;
        this.selector = params.selector;
        this.label = game.i18n.localize(params.label ?? params.name);
        this.slug = sluggify(params.slug ?? this.label);
        this.label = params.label;
        this.source = params.source ?? null;
        this.predicate = new PredicatePF2e(params.predicate ?? []);;
        this.hideIfDisabled = params.hideIfDisabled ?? false;
        this.rule = params.rule ?? null;
    }

    clone(): ExecuteMacroPF2e {
        return new ExecuteMacroPF2e({ ...this.toObject(), rule: this.rule });
    }

    toObject(): ExecuteMacroSource {
        return {
            ...R.pick(this, ["selector", "slug", "label", "source", "predicate", "hideIfDisabled"]),
            predicate: deepClone([...this.predicate]),
        };
    }

    async execute(args?: { actor?: ActorPF2e; token?: TokenPF2e } & Record<string, unknown>): Promise<void> {
        const macro = await ExecuteMacroPF2e.getMacroFromUuid(this.uuid);
        if (macro == null) {
            return;
        }

        macro.execute(args);
    }

    
    static async getMacroFromUuid(uuid: string, error: boolean = true): Promise<MacroPF2e | null> {
        const logError = error ? console.error : () => {};
        
        try {
            const document = await fromUuid(uuid);
            if (document == null) {
                logError(`No macro with a uuid of ${JSON.stringify(uuid)}.`);

                return null;
            }

            if (!(document instanceof MacroPF2e)) {
                logError(`Expected to get a MacroPF2e from the uuid ${JSON.stringify(uuid)} but got a ${document.constructor.name}.`);

                return null;
            }

            this.#migrateMacro(document);

            return document;
        } catch (error) {
            logError(error);
        }

        return null;
    }

    static #migrateMacro(_macro: MacroPF2e) {
        // For now it looks like macros never need migrating, however they might in the future. This method exists as a placeholder for if that ever happens.
    }
}

interface ExecuteMacroSource extends Required<BaseExecuteMacroProps> {}
interface ExecuteMacroData extends ExecuteMacroSource {
    predicate: PredicatePF2e;
}

interface BaseExecuteMacroProps {
    /** The uuid of the macro to be executed. */
    uuid: string;
    selector: string;
    /** An identifier for this macro; should generally be a localization key (see en.json). */
    slug?: string;
    /** The display name of this macro; can be a localization key (see en.json). */
    label: string;
    /** The source from which this macro originates, if any. */
    source?: string | null;
    /** A predicate which determines when this macro is to be executed. */
    predicate?: RawPredicate;
    /** Hide this macro in UIs if it is disabled */
    hideIfDisabled?: boolean;
    rule?: RuleElementPF2e | null;
}

interface ExecuteMacroParams extends BaseExecuteMacroProps {
    name?: string;
}

export { ExecuteMacroPF2e, ExecuteMacroSource };
