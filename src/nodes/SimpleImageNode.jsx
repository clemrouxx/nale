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

    static getType() {return 'image'}

    constructor(src,width_string,key) {
      super(key);
      this.__src = src;
      this.__width_string = width_string;
    }
  
    static clone(node) {
        return new SimpleImageNode(
            node.__src,
            node.__width_string,
            node.__key,
        );
    }

    getSrc() { return this.__src }

    // Serialization

    static importJSON(serializedNode) {
      const {src,width_string} = serializedNode;
      return new SimpleImageNode(src,width_string);
    }
  
    exportJSON() {
      return {
        ...super.exportJSON(),
        src: this.__src,
        width_string: this.__width_string,
        type: "image"
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
  
    decorate(){
      return (
        <ImageComponent
          src={this.__src}
          width={this.__width_string}
          nodeKey={this.getKey()}
          showCaption={false}
          captionsEnabled={false}
          resizable={false}
        />
      );
    }
  }
  
export function $createSimpleImageNode({src}) {
    return new SimpleImageNode(src);
}

export class CaptionedImageNode extends SimpleImageNode{
  static getType(){return 'captioned-image'}

  static clone(node) {
    return new CaptionedImageNode(
        node.__src,
        node.__width_string,
        node.__key,
    );
  }

  // Serialization

  static importJSON(serializedNode) {
    const {src,__width_string} = serializedNode;
    return new CaptionedImageNode(src,__width_string);
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: "captioned-image",
    };
  }

  // View
  decorate(){ return super.decorate() }

  // Behaviour
  remove(preserveEmptyParent){ return false }
  replace(replaceWith,includeChildren){ return false }
  insertBefore(nodeToInsert,restoreSelection){ return false } // Kind of works, although throws an error... (the text node created is not added and thus has no parent FWIU)
  insertAfter(nodeToInsert,restoreSelection){ return false }
}

export function $createCaptionedImageNode({src}) {
  return new CaptionedImageNode(src,"50%");
}
