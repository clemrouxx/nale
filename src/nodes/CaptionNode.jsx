import { $getSelection, $isRangeSelection, ParagraphNode } from "lexical";

export class CaptionNode extends ParagraphNode{
    static getType() { return "caption" }

    static clone(node){
        return new CaptionNode(node.__key);
    }

    // Behaviour

    insertAfter(nodeToInsert,restoreSelection) {
        this.getParent().insertAfter(nodeToInsert,restoreSelection);
    }

    isShadowRoot(){ return true }// Essentially prevents deletion
}

export function $createCaptionNode(){
    return new CaptionNode();
}