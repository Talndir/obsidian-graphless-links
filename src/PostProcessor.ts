import { LinkSlice, makeLinkSlices, linkSliceToDOM } from "src/LinkSlice"
import { App, MarkdownPostProcessorContext } from "obsidian";

// The Markdown postprocessor for the reading view
export const graphlessLinksPostProcessor
    = (app : App) => (elem: HTMLElement, ctx: MarkdownPostProcessorContext) => {
        
        // Walk the DOM
        const walker = document.createTreeWalker(elem, NodeFilter.SHOW_TEXT);
        const nodes: Text[] = [];

        let node: Node | null;
        while ((node = walker.nextNode())) {
            nodes.push(node as Text);
        }

        for (const node of nodes) {
            const parent = node.parentNode;
            if (parent == null) {
                continue;
            }

            // Get all the links
            const fragment = document.createDocumentFragment();
            var linkSlices: Array<LinkSlice> = new Array<LinkSlice>();
            makeLinkSlices(node.textContent!, linkSlices, app);

            if (linkSlices.length == 0) {
                continue;
            }

            /*  We need to take a piece of raw text like A{{L1}}B{{L2}}C and convert it into five separate elements
                    A, L1, B, L2, C
                which we do by keeping track of the current position. Whenever we encounter a match, we take everything
                up to the match, create an element, then make the current link element. If there's anything left
                at the end, we add that also. */
            
            let last = 0;

            for (const slice of linkSlices) {
                // Add text before the link
                if (slice.start > last) {
                    fragment.appendChild(document.createTextNode(node.textContent!.slice(last, slice.start - 1)));
                }

                // Add the link
                fragment.appendChild(linkSliceToDOM(slice));
                last = slice.end;
            }

            // Add text after the last link
            if (last < node.textContent!.length) {
                fragment.appendChild(document.createTextNode(node.textContent!.slice(last - 1)));
            }

            // Replace the child element with the new fragment
            parent.replaceChild(fragment, node);
        }
}
