import {
    $createParagraphNode,
    ElementNode,
} from 'lexical';
import * as React from 'react';
import ImageComponent from './ImageComponent';
import { addClassNamesToElement } from '@lexical/utils';
import { $createSimpleImageNode } from './SimpleImageNode';

export class FigureNode extends ElementNode {
    __src;
  
    static getType() {return 'figure'}
  
    static clone(node) {
        return new FigureNode(
            node.__src,
            node.__key,
        );
    }
  
    constructor(src,key) {
        super(key);
        this.__src = src;
    }

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
  }
  
export function $createFigureNode({src}) {
    const figureNode = new FigureNode(src);
    figureNode.append($createSimpleImageNode({src}));
    figureNode.append($createParagraphNode());
    return figureNode;
}
