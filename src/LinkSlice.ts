/* Adapted from https://github.com/Trikzon/obsidian-frontmatter-links/blob/main/src/link_slice.ts */

import { App } from "obsidian";

// A segment of text
export interface LinkSegment {
    text: string;
    start: number,
    end: number
}

// Segments for the link, the possible text alias, and the start and end points of the entire segment
// `exists` is true iff the link points to a real file
export interface LinkSlice {
    href: LinkSegment,
    alias?: LinkSegment,
    start: number;
    end: number;
    exists: boolean;
}

// Add all links from a given piece of text to an array of slices
export const makeLinkSlices = (text: string, startOffset: number, linkSlices: Array<LinkSlice>, app: App) => {
    let match: RegExpMatchArray | null;
    const regex = /\{\{(.+?)(?:\|(.*?))?\}\}/g;

    match = regex.exec(text);
    while (match != null && match.index != null) {
        var href: LinkSegment = {
            text: match[1],
            start: match.index + 2 + startOffset,
            end: match.index + 2 + match[1].length + startOffset
        };

        var alias: LinkSegment | undefined = undefined;

        if (match[2] != null) {
            alias = {
                text: match[2],
                start: href.end + startOffset,
                end: regex.lastIndex + startOffset
            }
        }

        var exists = app.metadataCache.getFirstLinkpathDest(href.text, "") != null;

        linkSlices.push({
            href,
            alias,
            start: match.index + startOffset,
            end: regex.lastIndex + startOffset,
            exists
        });
        match = regex.exec(text);
    }
}

// Generate a DOM element for a link slice
export const linkSliceToDOM = (slice: LinkSlice) => {
    const aElement = document.createElement("a");
    aElement.href = slice.href.text;
    aElement.innerText = (slice.alias ?? slice.href).text;

    // This commented part is for URIs, which are not supported in WikiLink syntax
    //if (isUri(slice.href.text)) {
    //    aElement.addClass("cm-url");
    //} else {
        aElement.addClass("internal-link");

        if (!slice.exists) {
            aElement.addClass("is-unresolved");
        }
    //}

    return aElement;
}
