import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { ViewPlugin } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { editorPlugin } from "src/EditorPlugin";
import { graphlessLinksPostProcessor } from "src/PostProcessor";

// The main plugin class
export default class GraphlessLinksPlugin extends Plugin {
	editorPlugin: Extension; 

	async onload() {
		this.editorPlugin = editorPlugin(this.app);
		this.registerEditorExtension(this.editorPlugin);
		this.registerMarkdownPostProcessor(graphlessLinksPostProcessor(this.app));
	}

	onunload() {}
}
