import {
    $insertNodes,
    ElementNode,
} from 'lexical';
import { addClassNamesToElement } from '@lexical/utils';
import { $createCaptionNode, CaptionNode } from './CaptionNode';
import { $createTableNodeWithDimensions } from '@lexical/table';

export class TableFloatNode extends ElementNode {
    static getType() {return 'table-float'}

    constructor(key) {
        super(key);
    }
  
    static clone(node) {
        return new TableFloatNode(node.__key,);
    }

    // Serialization

    static importJSON(serializedNode) {
        return new TableFloatNode();
    }

    exportJSON() {
        return {
            ...super.exportJSON(),
            type:"table-float",
        };
    }
  
    // View
  
    createDOM(config) {
        const element = document.createElement('div');
        addClassNamesToElement(element, "editor-table-float");
        return element;
    }
  
    updateDOM() {
      return false;
    }

    // Behaviour

    isShadowRoot(){return true}

    // Export
    /*
    toLatex(childrenString){
        return (
`\\begin{figure}
    \\centering
${childrenString}
\\end{figure}
`);
    }*/
  }
  
function $createTableFloatNode(documentOptions) {
    const node = new TableFloatNode();
    node.append($createTableNodeWithDimensions(3,3,false));
    node.append($createCaptionNode("table",documentOptions));
    return node;
}

export const insertTable = (editor,documentOptions) => {
  editor.update(() => {
    const tableFloatNode = $createTableFloatNode(documentOptions);
    $insertNodes([tableFloatNode]);
  });
};