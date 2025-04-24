/* Large portions adapted from https://github.com/Trikzon/obsidian-frontmatter-links/blob/main/src/editor_plugin.ts */

import { LinkSegment, LinkSlice, makeLinkSlices } from "src/LinkSlice";
import { GraphlessLinkWidget } from "src/GraphlessLinkWidget";
import { isUri } from "valid-url";
import { SyntaxNodeRef } from "@lezer/common"
import { syntaxTree } from "@codemirror/language";
import { RangeSetBuilder } from "@codemirror/state";
import {
    ViewUpdate,
    ViewPlugin,
    PluginSpec,
    PluginValue,
    EditorView,
    Decoration,
    DecorationSet
} from "@codemirror/view";
import { App, TFile, MetadataCache } from "obsidian";

// The plugin for the live editor
export class GraphlessLinksEditorPlugin implements PluginValue {
    decorations: DecorationSet;
    linkSlices: Array<LinkSlice> = new Array();
    app: App;

    constructor(view: EditorView, app: App) {
        this.app = app;
        this.decorations = this.buildDecorations(view, this.app);
    }
  
    update(update: ViewUpdate) {
        // Update triggers on document change, viewport change, and cursor movement
        if (update.docChanged || update.viewportChanged || update.selectionSet) {
            console.log("!!!!!!!!!!!! UPDATE !!!!!!!!!!!!");
            this.decorations = this.buildDecorations(update.view, this.app);
        }
    }

    destroy() {}


    /*  A live editor plugin is a CodeMirror plugin.
        The update function is aclled whenever the view updates, and based on that, we
        construct a number of "decorations" which augment the view.
        In this case, we are adding styling to the text to make it purple etc. */
    buildDecorations(view: EditorView, app: App): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();
        
        this.linkSlices = new Array<LinkSlice>();
        this.findLinks(view, this.linkSlices, app);
        this.linkSlices.sort((a, b) => a.start - b.start);
        this.processLinks(view, builder);

        return builder.finish();
    }

    // Find all the links in the view
    findLinks(view: EditorView, linkSlices: Array<LinkSlice>, app: App) {
        for (let { from, to } of view.visibleRanges) {
            syntaxTree(view.state).iterate({
                from,
                to,
                enter: (node: SyntaxNodeRef) => {
                    console.log("Current node:")
                    console.log(node.node);
                    console.log("Current text:")
                    console.log(view.state.sliceDoc(node.from, node.to));

                    const text = view.state.sliceDoc(node.from, node.to);
                    makeLinkSlices(text, node.from, node.to, linkSlices, app);
                }
            });
        }
    }

    // Convert the links to decorations for the editor
    processLinks(view: EditorView, builder: RangeSetBuilder<Decoration>) {
        for (let linkSlice of this.linkSlices) {
            const cursorHead = view.state.selection.main.head;
            console.log("Processing slice:")
            console.log(linkSlice);

            if (linkSlice.start <= cursorHead && cursorHead <= linkSlice.end) {
                // Style the link in a special way if the cursor is over it
                console.log("Decorating slice at cursor");
                this.styleLink(view, builder, linkSlice);
            } else {
                console.log("Decorating slice");
                builder.add(
                    linkSlice.start,
                    linkSlice.end,
                    Decoration.replace({ widget: new GraphlessLinkWidget(linkSlice) })
                );
            }
        }
    }

    // This is for styling a link if the cursor is over it
    styleLink(view: EditorView, builder: RangeSetBuilder<Decoration>, linkSlice: LinkSlice) {
        const resolved: string = linkSlice.exists ? "" : " is-unresolved";

        if (linkSlice.alias == undefined) {
            // Without alias
            builder.add(
                linkSlice.start,
                linkSlice.start + 2,
                Decoration.mark({ class: "cm-formatting-link cm-formatting-link-start" })
            );
            builder.add(
                linkSlice.href.start,
                linkSlice.href.end,
                Decoration.mark({ class: "cm-link" + resolved})
            );
            builder.add(
                linkSlice.end - 2,
                linkSlice.end,
                Decoration.mark({ class: "cm-formatting-link cm-formatting-link-end" })
            );
        } else {
            // With alias
            builder.add(
                linkSlice.start,
                linkSlice.start + 2,
                Decoration.mark({ class: "cm-formatting-link cm-formatting-link-start" })
            );
            builder.add(
                linkSlice.href.start,
                linkSlice.href.end,
                Decoration.mark({ class: "cm-link" + resolved })
            );
            builder.add(
                linkSlice.href.end,
                linkSlice.href.end + 1,
                Decoration.mark({ class: "cm-hmd-internal-link" })
            );
            builder.add(
                linkSlice.alias.start,
                linkSlice.alias.end,
                Decoration.mark({ class: "cm-link" + resolved })
            );
            builder.add(
                linkSlice.end - 2,
                linkSlice.end,
                Decoration.mark({ class: "cm-formatting-link cm-formatting-link-end" })
            );
        }
    }
}

// Showing how to access the decorations
const GRAPHLESS_LINKS_EDITOR_PLUGIN_SPEC: PluginSpec<GraphlessLinksEditorPlugin> = {
    decorations: (value: GraphlessLinksEditorPlugin) => value.decorations,
};

// We need access to `app` for checking if a link points to a real file or not
// hence this lambda
export const editorPlugin = (app: App) => {
    return ViewPlugin.define((editorView: EditorView) => {
        return new GraphlessLinksEditorPlugin(editorView, app)
    }, GRAPHLESS_LINKS_EDITOR_PLUGIN_SPEC);
};
