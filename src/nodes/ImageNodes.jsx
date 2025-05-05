import { DecoratorNode } from 'lexical';
import * as React from 'react';
import ImageComponent from './ImageComponent';

export class SimpleImageNode extends DecoratorNode {
    static getType() {return 'image'}

    constructor(src,filename,width_string,key) {
      super(key);
      this.__src = src;
      this.__width_string = width_string ?? "native";
      this.__filename = filename;
    }
  
    static clone(node) {
        return new SimpleImageNode(
            node.__src,
            node.__filename,
            node.__width_string,
            node.__key,
        );
    }

    getSrc() { return this.__src }
    getFilename() { return this.__filename }

    // Serialization

    static importJSON(serializedNode) {
      const {src,filename,width_string} = serializedNode;
      return new SimpleImageNode(src,filename,width_string);
    }
  
    exportJSON() {
      return {
        ...super.exportJSON(),
        src: this.__src,
        filename: this.__filename,
        width_string: this.__width_string,
        type: "image"
      };
    }
  
    // View

    createDOM(config) {
      const span = document.createElement('span');
      const theme = config.theme;
      const className = theme.image;
      if (className) span.className = className;
      return span;
    }
  
    updateDOM() { return false }
  
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

    // Latex

    getLatexParameters(){
      if (this.__width_string.endsWith("%")) return `width=${Number(this.__width_string.slice(0,-1))/100}\\linewidth`;
      else return "";
    }

    toLatex(){ return `\\includegraphics[${this.getLatexParameters()}]{${this.__filename}}` }
  }
  
export function $createSimpleImageNode({src,filename}) {
    return new SimpleImageNode(src,filename);
}

export class CaptionedImageNode extends SimpleImageNode{
  static getType(){return 'captioned-image'}

  static clone(node) {
    return new CaptionedImageNode(
        node.__src,
        node.__filename,
        node.__width_string,
        node.__key,
    );
  }

  // Serialization

  static importJSON(serializedNode) {
    const {src,width_string,filename} = serializedNode;
    return new CaptionedImageNode(src,filename,width_string);
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

  remove(preserveEmptyParent){ 
    this.getParent().remove(preserveEmptyParent); // Remove the entire figure instead of just the image
    return true;
  }
  replace(replaceWith,includeChildren){ return false }
  insertBefore(nodeToInsert,restoreSelection){ return false } // Kind of works, although throws an error... (the text node created is not added and thus has no parent FWIU)
  insertAfter(nodeToInsert,restoreSelection){ return false }

  // Latex

  toLatex(){
    let string = super.toLatex();
    return "\t"+string+"\n";
  }
}

export function $createCaptionedImageNode({src,filename}) {
  return new CaptionedImageNode(src,filename,"50%");
}
