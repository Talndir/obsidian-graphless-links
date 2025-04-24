/* Adapted from https://github.com/Trikzon/obsidian-frontmatter-links/blob/main/src/link_widget.ts */

import { LinkSlice, linkSliceToDOM } from "src/LinkSlice";
import { EditorView, WidgetType } from "@codemirror/view";
import { TFile } from "obsidian";
import { isUri } from "valid-url";

export class GraphlessLinkWidget extends WidgetType {
    private linkSlice: LinkSlice;

    constructor(linkSlice: LinkSlice) {
        super()
        this.linkSlice = linkSlice;
    }

    toDOM(view: EditorView): HTMLElement {
        console.log("Rendering slice:");
        var elem = linkSliceToDOM(this.linkSlice);
        console.log(elem);
        return elem;
    }
}
