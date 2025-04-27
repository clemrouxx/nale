import {
    ElementNode,
} from 'lexical';
import { addClassNamesToElement } from '@lexical/utils';
import { $createCaptionedImageNode, $createSimpleImageNode } from './SimpleImageNode';
import { $createCaptionNode } from './CaptionNode';

export class FigureNode extends ElementNode {
    __src;
  
    static getType() {return 'figure'}

    constructor(src,key) {
        super(key);
        this.__src = src;
    }
  
    static clone(node) {
        return new FigureNode(
            node.__src,
            node.__key,
        );
    }

    // Serialization

    static importJSON(serializedNode) {
        const {src} = serializedNode;
        return new FigureNode(src);
    }

    exportJSON() {
        return {
            ...super.exportJSON(),
            src: this.__src,
            type:"figure",
        };
    }
  
    // View
  
    createDOM(config) {
        const element = document.createElement('div');
        addClassNamesToElement(element, config.theme.debug);
        return element;
    }
  
    updateDOM() {
      return false;
    }
  
    getSrc() {
      return this.__src;
    }

    // Behaviour

    // Behaviour

    isShadowRoot(){return true}
    /*
    canInsertTextBefore() { return false }
    canInsertTextAfter() { return false }
    canMergeWhenEmpty() { return false }*/
  }
  
export function $createFigureNode({src}) {
    const figureNode = new FigureNode(src);
    figureNode.append($createCaptionedImageNode({src}));
    figureNode.append($createCaptionNode());
    return figureNode;
}
