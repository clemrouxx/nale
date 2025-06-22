import { MathJax } from 'better-react-mathjax';
import { DecoratorNode } from 'lexical';
import { SelectableComponent } from './SelectableComponent';

export class MathNode extends DecoratorNode {
  static getType() {return 'math'}

  constructor(inline,key) {
    super(key);
    this.__inline = inline;
  }

  static clone(node) {
    return new MathNode(node.__inline,node.__key);
  }

  isInline(){return this.__inline}

  toLatex(){return ``}
  
  createDOM(config) {
    const dom = document.createElement("span");
    dom.classList.add("editor-math");
    return dom;
  }

  updateDOM(prevNode, dom){
    return false;
  };

  decorate(){
    return (
    <SelectableComponent nodeKey={this.__key}>
      <MathJax inline={this.__inline}>{"\\(E=mc^2\\)"}</MathJax>
    </SelectableComponent>
    );
  }

  static importJSON(serializedNode) {
    return new MathNode();
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      __inline:this.__inline,
    };
  }
}

export function $createMathNode(inline){
  return new MathNode(inline);
}