import {
    ElementNode,
} from 'lexical';
import { addClassNamesToElement } from '@lexical/utils';
import { $createCaptionedImageNode, $createSimpleImageNode } from './ImageNodes';
import { $createCaptionNode, CaptionNode } from './CaptionNode';

export class FigureNode extends ElementNode {
    static getType() {return 'figure'}

    constructor(src,number,label_number,key) {
        super(key);
        this.__src = src;
        this.__number = number ?? 0;
        this.__label_number = label_number;
    }
  
    static clone(node) {
        return new FigureNode(
            node.__src,
            node.__number,
            node.__label_number,
            node.__key,
        );
    }

    getSrc() { return this.__src }
    getNumber(){ return this.__number }
    getLabel(){ return `fig:${this.__label_number}` }
    setNumber(number){ 
        this.getWritable().__number = number;
        this.getChildren().forEach(childNode=>{
            if (childNode instanceof CaptionNode) childNode.setNumber(number);
        });
    }
    updateNumber(number){
        if (number !== this.__number) this.setNumber(number);
    }

    // Serialization

    static importJSON(serializedNode) {
        const {src,label_number} = serializedNode;
        return new FigureNode(src,0,label_number);
    }

    exportJSON() {
        return {
            ...super.exportJSON(),
            src: this.__src,
            label_number:this.__label_number,
            type:"figure",
        };
    }
  
    // View
  
    createDOM(config) {
        const element = document.createElement('div');
        addClassNamesToElement(element, config.theme.figure);
        element.setAttribute("id",this.getLabel());
        return element;
    }
  
    updateDOM() {
      return false;
    }

    // Behaviour

    isShadowRoot(){return true}
    /*
    canInsertTextBefore() { return false }
    canInsertTextAfter() { return false }
    canMergeWhenEmpty() { return false }*/

    // Export
    toLatex(childrenString){
        return (
`\\begin{figure}
    \\centering
${childrenString}
\\end{figure}
`);
    }
  }
  
export function $createFigureNode(imagePayload,labelNumber,documentOptions) {
    const figureNode = new FigureNode(imagePayload.src,0,labelNumber);
    figureNode.append($createCaptionedImageNode(imagePayload));
    figureNode.append($createCaptionNode(documentOptions));
    return figureNode;
}
