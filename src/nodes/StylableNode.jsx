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
    writable.__style = {...writable.__style, ...style};
    return writable;
  }

  exportJSON(){
    return {style:this.__style}
  }
}