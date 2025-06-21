import { MathJax } from 'better-react-mathjax';
import { $getSelection, DecoratorNode } from 'lexical';

export class MathNode extends DecoratorNode {
  static getType() {return 'math'}

  constructor(key) {
    super(key);
  }

  static clone(node) {
    return new MathNode(node.__key);
  }

  toLatex(){return ``}
  
  createDOM(config) {
    const dom = document.createElement("span");
    return dom;
  }

  updateDOM(prevNode, dom){
    return false;
  };

  decorate(){
    return <MathJax>{"\\(E=mc^2\\)"}</MathJax>
  }

  static importJSON(serializedNode) {
    return new MathNode();
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
    };
  }
}

export function $createMathNode(){
  return new MathNode();
}