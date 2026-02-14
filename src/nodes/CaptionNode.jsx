import { $getSelection, $isRangeSelection, ParagraphNode } from "lexical";
import {
    $findMatchingParent,
  } from '@lexical/utils';
import { DEFAULT_DOCUMENT_OPTIONS } from "../plugins/Options/documentOptions";

export class CaptionNode extends ParagraphNode{
    __specific_options;
    __number;
    __float_type;

    constructor(float_type,number,specific_options,key){
        super(key);
        this.__float_type = float_type;
        this.__specific_options = specific_options ?? (float_type==="figure" ? DEFAULT_DOCUMENT_OPTIONS.figures : DEFAULT_DOCUMENT_OPTIONS.tables );
        this.__number = number ?? 0;
    }

    static getType() { return "caption" }

    getFloatType() { return this.__float_type }

    static clone(node){ return new CaptionNode(node.__float_type,node.__number,structuredClone(node.__specific_options),node.__key) }

    setNumber(number){ this.getWritable().__number = number }

    setDocumentOptions(documentOptions){
        const writable = this.getWritable();
        writable.__specific_options = this.__float_type==="figure" ? documentOptions.figures : documentOptions.tables;
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
        return `${this.__specific_options.name} ${this.__number}${this.__specific_options.labelSeparator} `;
    }

    updateDOM(prevNode){ return prevNode.getPrefix() !== this.getPrefix() }

    // Serializaton

    static importJSON(serializedNode) {
        return new CaptionNode(serializedNode.float_type,serializedNode.number,serializedNode.float_type==="figure"?DEFAULT_DOCUMENT_OPTIONS.figures:DEFAULT_DOCUMENT_OPTIONS.tables);
    }

    exportJSON() {
        return {
            ...super.exportJSON(),
            number : this.__number,
            float_type : this.__float_type,
        };
    }

    // Behaviour

    insertAfter(nodeToInsert,restoreSelection) {
        this.getParent().insertAfter(nodeToInsert,restoreSelection);
    }

    // LaTeX

    toLatex(childrenStringList){
        const label = this.getParent().getLabel();
        return `    \\caption{\\label{${label}}${childrenStringList.join("")}}`;
    }

}

export function $createCaptionNode(float_type,documentOptions){
    return new CaptionNode(float_type,null,float_type==="figure"?documentOptions.figures:documentOptions.tables);
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