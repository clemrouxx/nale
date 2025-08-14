import { $getSelection, $isRangeSelection, ParagraphNode } from "lexical";
import {
    $findMatchingParent,
  } from '@lexical/utils';
import { DEFAULT_DOCUMENT_OPTIONS } from "../plugins/Options/documentOptions";

export class CaptionNode extends ParagraphNode{
    __figures_options;
    __number;

    constructor(number,figures_options,key){
        super(key);
        this.__figures_options = figures_options ?? DEFAULT_DOCUMENT_OPTIONS.figures;
        this.__number = number ?? 0;
    }

    static getType() { return "caption" }

    static clone(node){ return new CaptionNode(node.__number,structuredClone(node.__figures_options),node.__key) }

    setNumber(number){ this.getWritable().__number = number }

    setDocumentOptions(documentOptions){
        const writable = this.getWritable();
        writable.__figures_options = documentOptions.figures;
        writable.markDirty();
    }

    // View

    createDOM(config) {
        const dom = super.createDOM(config);
        dom.classList.add(config.theme.caption);
        dom.setAttribute("prefix",this.getPrefix());
        return dom;
    }

    getPrefix(){
        return `${this.__figures_options.figureName} ${this.__number}: `;
    }

    updateDOM(prevNode){ return prevNode.getPrefix() !== this.getPrefix() }

    // Serializaton

    static importJSON(serializedNode) {
        return new CaptionNode(serializedNode.number,DEFAULT_DOCUMENT_OPTIONS.figures_options);
    }

    exportJSON() {
        return {
            ...super.exportJSON(),
            number : this.__number,
        };
    }

    // Behaviour

    insertAfter(nodeToInsert,restoreSelection) {
        this.getParent().insertAfter(nodeToInsert,restoreSelection);
    }

    // LaTeX

    toLatex(childrenString){
        const label = this.getParent().getLabel();
        return `    \\caption{\\label{${label}}${childrenString}}`;
    }

}

export function $createCaptionNode(documentOptions){
    return new CaptionNode(null,documentOptions.figures);
}

function $isCaptionNode(node){ return node instanceof CaptionNode }

// Registered in the ImagePlugin. Avoid full deletion of the caption.
export const $onDeleteCharacterInCaption = () => {
    const selection = $getSelection();
    if ($isRangeSelection(selection) && selection.isCollapsed()) {
      const caption = $findMatchingParent(
        selection.anchor.getNode(),
        $isCaptionNode,
      );

      if (caption && caption.getTextContent()==="") {
        return true; // prevent default
      }
    }

    return false;
  };