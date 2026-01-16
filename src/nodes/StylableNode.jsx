import { DecoratorNode } from 'lexical';

export class StylableNode extends DecoratorNode {
  constructor(style,key) {
    super(key);
    this.__style = style ?? {};
  }

  static clone(node) {
    return new StylableNode(structuredClone(node.__style),node.__key);
  }

  applyStyle(style){
    const writable = this.getWritable();
    writable.__style.format = {...writable.__style.format, ...style.format};
    writable.__style.inlineStyle = {...writable.__style.inlineStyle, ...style.inlineStyle};
    return writable;
  }

  getStyle(){
    return this.__style;
  }

  exportJSON(){
    return {style:this.__style}
  }
}