import { $getSelection, $isRangeSelection, ParagraphNode } from "lexical";
import {
    $findMatchingParent,
  } from '@lexical/utils';

export class CaptionNode extends ParagraphNode{
    __prefix_template;
    __number;

    constructor(number,key){
        super(key);
        this.__prefix_template = "Figure {}: ";
        this.__number = number ?? 0;
    }

    static getType() { return "caption" }

    static clone(node){ return new CaptionNode(node.__number,node.__key) }

    setNumber(number){ this.getWritable().__number = number }

    // View

    createDOM(config) {
        const dom = super.createDOM(config);
        dom.classList.add(config.theme.caption);
        dom.setAttribute("prefix",this.getPrefix());
        return dom;
    }

    getPrefix(){
        return this.__prefix_template.replaceAll("{}",this.__number);
    }

    updateDOM(prevNode){ return prevNode.getPrefix() !== this.getPrefix() }

    // Serializaton

    static importJSON(serializedNode) {
        return new CaptionNode(serializedNode.number);
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

export function $createCaptionNode(){
    return new CaptionNode();
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