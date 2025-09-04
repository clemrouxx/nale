import { DecoratorNode } from 'lexical';
import ImageComponent from '../plugins/ImagesPlugin/ImageComponent';

export class SimpleImageNode extends DecoratorNode {
    static getType() {return 'image'}

    constructor(src,filename,width_value,width_unit,key) {
      super(key);
      this.__src = src;
      this.__width_value = width_value ?? 1;
      this.__width_unit = width_unit ?? "";
      this.__filename = filename;
    }
  
    static clone(node) {
        return new SimpleImageNode(
            node.__src,
            node.__filename,
            node.__width_value,
            node.__width_unit,
            node.__key,
        );
    }

    getSrc() { return this.__src }
    getFilename() { return this.__filename }
    getShortFilename() { return this.getFilename().split("/").at(-1) }
    getWidthString() { return this.__width_value.toString() + this.__width_unit}
    getWidthValue() { return this.__width_value }

    setWidthValue(val){ this.getWritable().__width_value = val }
    setImage(src,filename){ // Sets both source and filename
      const writable = this.getWritable();
      writable.__src = src;
      writable.__filename = filename;
    }

    // Serialization

    static importJSON(serializedNode) {
      const {src,filename,width_value,width_unit} = serializedNode;
      return new SimpleImageNode(src,filename,width_value,width_unit);
    }
  
    exportJSON() {
      return {
        ...super.exportJSON(),
        src: this.__src,
        filename: this.__filename,
        width_value: this.__width_value,
        width_unit: this.__width_unit,
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
      let widthString = this.getWidthString();
      if (this.width_unit!=="%") widthString = `calc(var(--editor-scale) * ${widthString})`;
      return (
        <ImageComponent
          src={this.__src}
          filename={this.__filename}
          width={widthString}
          nodeKey={this.getKey()}
          showCaption={false}
          captionsEnabled={false}
          resizable={false}
        />
      );
    }

    // Latex

    __getLatexParameters(){
      if (this.__width_unit==="%") return `width=${this.__width_value/100}\\linewidth`;
      else return `width=${this.__width_value}`;
    }

    toLatex(){ return `\\includegraphics[${this.__getLatexParameters()}]{${this.__filename}}` }
  }
  
export function $createSimpleImageNode({src,filename}) {
    return new SimpleImageNode(src,filename,40,"mm");
}

export function $isImageNode(node){
  return node instanceof SimpleImageNode;
}

export class CaptionedImageNode extends SimpleImageNode{
  static getType(){return 'captioned-image'}

  static clone(node) {
    return new CaptionedImageNode(
        node.__src,
        node.__filename,
        node.__width_value,
        node.__width_unit,
        node.__key,
    );
  }

  // Serialization

  static importJSON(serializedNode) {
    const {src,width_value,width_unit,filename} = serializedNode;
    return new CaptionedImageNode(src,filename,width_value,width_unit);
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
  return new CaptionedImageNode(src,filename,50,"%");
}
