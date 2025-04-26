/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
    $applyNodeReplacement,
    DecoratorNode,
} from 'lexical';
import * as React from 'react';
import ImageComponent from './ImageComponent';

  
export class SimpleImageNode extends DecoratorNode {
    __src;
  
    static getType() {return 'simple-image'}
  
    static clone(node) {
        return new SimpleImageNode(
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
        return new SimpleImageNode(src);
    }
  
    updateFromJSON(serializedNode) {
      const node = super.updateFromJSON(serializedNode);
      return node;
    }
  
    exportDOM() {
      const element = document.createElement('img');
      element.setAttribute('src', this.__src);
      return {element};
    }
    
    static importDOM() {
      console.log('imoprt DOM');
      return {
        img: (node) => ({
          conversion: $convertImageElement,
          priority: 0,
        }),
      };
    }
  
    exportJSON() {
      return {
        ...super.exportJSON(),
        src: this.getSrc(),
      };
    }
  
    // View
  
    createDOM(config) {
      const span = document.createElement('span');
      const theme = config.theme;
      const className = theme.image;
      if (className !== undefined) {
        span.className = className;
      }
      return span;
    }
  
    updateDOM() {
      return false;
    }
  
    getSrc() {
      return this.__src;
    }
  
    getAltText() {
      return this.__altText;
    }
  
    decorate(){
      return (
        <ImageComponent
          src={this.__src}
          width={100}
          nodeKey={this.getKey()}
          showCaption={false}
          captionsEnabled={false}
          resizable={false}
        />
      );
    }
  }
  
export function $createSimpleImageNode({src}) {
    return $applyNodeReplacement(
        new SimpleImageNode(src),
    );
}
