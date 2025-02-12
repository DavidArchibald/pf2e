import type { Document, DocumentMetadata } from "../abstract/module.d.ts";
import type { ActorDeltaSource } from "./actor-delta.d.ts";
import type { BaseActorDelta, BaseScene, BaseUser } from "./module.d.ts";

/**
 * The Token document model.
 * @param data Initial data from which to construct the document.
 * @property data The constructed data object for the document.
 */
export default class BaseToken<TParent extends BaseScene | null = BaseScene | null> extends Document<TParent> {
    name: string;

    readonly actorLink: boolean;

    x: number;

    y: number;

    displayName: TokenDisplayMode;

    disposition: TokenDisposition;

    width: number;

    height: number;

    alpha: number;

    actorId: string | null;

    delta: BaseActorDelta<this> | null;

    texture: {
        src: ImageFilePath | VideoFilePath;
        scaleX: number;
        scaleY: number;
        offsetX: number;
        offsetY: number;
        rotation: number | null;
        tint: HexColorString | undefined;
    };

    light: foundry.data.LightData;

    sight: {
        enabled: boolean;
        range: number;
        angle: number;
        color: HexColorString;
        attenuation: number;
        brightness: number;
        saturation: number;
        contrast: number;
        visionMode: string;
    };

    elevation: number;

    effects: VideoFilePath[];

    hidden: boolean;

    flags: DocumentFlags;

    static override get metadata(): TokenMetadata;

    /** Is a user able to update an existing Token? */
    protected static _canUpdate(user: BaseUser, doc: BaseToken<BaseScene | null>, data: TokenSource): boolean;
}

export default interface BaseToken<TParent extends BaseScene | null = BaseScene | null> extends Document<TParent> {
    readonly _source: TokenSource;
}

/**
 * The data schema for a Token document.
 *
 * @property _id                  The Token _id which uniquely identifies it within its parent Scene
 * @property name                 The name used to describe the Token
 * @property [displayName=0]      The display mode of the Token nameplate, from CONST.TOKEN_DISPLAY_MODES
 * @property actorId              The _id of an Actor document which this Token represents
 * @property [actorLink=false]    Does this Token uniquely represent a singular Actor, or is it one of many?
 * @property [width=1]            The width of the Token in grid units
 * @property [height=1]           The height of the Token in grid units
 * @property [x=0]                The x-coordinate of the top-left corner of the Token
 * @property [y=0]                The y-coordinate of the top-left corner of the Token
 * @property [elevation=0]        The vertical elevation of the Token, in distance units
 * @property [lockRotation=false] Prevent the Token image from visually rotating?
 * @property [rotation=0]         The rotation of the Token in degrees, from 0 to 360. A value of 0 represents a southward-facing Token.
 * @property [effects]            An array of effect icon paths which are displayed on the Token
 * @property [overlayEffect]      A single icon path which is displayed as an overlay on the Token
 * @property [hidden=false]       Is the Token currently hidden from player view?
 * @property [vision]             Is this Token a source of vision?
 * @property [light]              The angle at which this Token is able to see, if it has vision
 * @property [disposition=-1]     A displayed Token disposition from CONST.TOKEN_DISPOSITIONS
 * @property [displayBars=0]      The display mode of Token resource bars, from CONST.TOKEN_DISPLAY_MODES
 * @property [bar1]               The configuration of the Token's primary resource bar
 * @property [bar2]               The configuration of the Token's secondary resource bar
 * @property [flags={}]           An object of optional key/value flags
 */
export interface TokenSource extends TokenLightData {
    _id: string;
    name: string;

    actorId: string | null;
    actorLink: boolean;
    delta: ActorDeltaSource;
    height: number;
    width: number;
    x: number;
    y: number;
    elevation: number;
    lockRotation: boolean;
    effects: VideoFilePath[];
    overlayEffect: string | undefined;
    alpha: number;
    light: foundry.data.LightSource;
    hidden: boolean;
    sight: {
        enabled: boolean;
        range: number;
        angle: number;
        color: HexColorString;
        attenuation: number;
        brightness: number;
        saturation: number;
        contrast: number;
        visionMode: string;
    };
    texture: {
        src: VideoFilePath;
        scaleX: number;
        scaleY: number;
        offsetX: number;
        offsetY: number;
        rotation: number | null;
        tint: `#${string}`;
    };
    disposition: TokenDisposition;
    displayName: TokenDisplayMode;
    displayBars: TokenDisplayMode;
    bar1: TokenBarData;
    bar2: TokenBarData;
    flags: DocumentFlags;
}

interface TokenLightData {
    brightLight: number;
    dimLight: number;
    lightAlpha: number;
    lightAngle: number;
    lightAnimation: {
        type: string;
        speed: number;
        intensity: number;
    };
    lightColor: string;
}

interface TokenMetadata extends DocumentMetadata {
    name: "Token";
    collection: "tokens";
    label: "DOCUMENT.Token";
    isEmbedded: true;
    permissions: Omit<DocumentMetadata["permissions"], "create"> & {
        create: "TOKEN_CREATE";
    };
}

/**
 * An embedded data structure for the contents of a Token attribute bar.
 * @property [attribute] The attribute path within the Token's Actor data which should be displayed
 */
interface TokenBarData {
    attribute: string | null;
}
