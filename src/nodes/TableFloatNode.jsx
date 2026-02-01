import {
    $insertNodes,
    ElementNode,
} from 'lexical';
import { addClassNamesToElement } from '@lexical/utils';
import { $createCaptionNode, CaptionNode } from './CaptionNode';
import { $createTablePlusNodeWithDimensions } from './TablePlusNode';

export class TableFloatNode extends ElementNode {
    static getType() {return 'table-float'}

    constructor(number,label_number,key) {
        super(key);
        this.__number = number ?? 0;
        this.__label_number = label_number;
    }
  
    static clone(node) {
        return new TableFloatNode(node.__number,node.__label_number,node.__key);
    }

    getNumber(){ return this.__number }
    getLabel(){ return `table:${this.__label_number}` }
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
        return new TableFloatNode(serializedNode.label_number);
    }

    exportJSON() {
        return {
            ...super.exportJSON(),
            label_number:this.__label_number,
            type:"table-float",
        };
    }
  
    // View
  
    createDOM(config) {
        const element = document.createElement('div');
        addClassNamesToElement(element, "editor-table-float");
        element.setAttribute("id",this.getLabel());
        return element;
    }
  
    updateDOM() {
      return false;
    }

    // Behaviour

    isShadowRoot(){return true}

    // Export
    
    toLatex(childrenString){
        return (
`\\begin{table}
    \\centering
${childrenString}
\\end{table}
`);
    }
  }
  
export function $createTableFloatNode(labelNumber,documentOptions) {
    const node = new TableFloatNode(0,labelNumber);
    node.append($createTablePlusNodeWithDimensions(3,3));
    node.append($createCaptionNode("table",documentOptions));
    return node;
}