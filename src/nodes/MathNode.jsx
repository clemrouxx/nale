import { MathJax } from 'better-react-mathjax';
import { DecoratorNode } from 'lexical';
import { SelectableComponent } from './SelectableComponent';
import MathEditor from '../plugins/MathPlugin/MathEditor';
import MathNodes from '../plugins/MathPlugin/MathNodes';

export class MathNode extends DecoratorNode {
  static getType() {return 'math'}

  constructor(inline,mathTree,versionCounter,key) {
    super(key);
    this.__inline = inline;
    this.__mathTree = mathTree;
    this.__versionCounter = versionCounter;
  }

  static clone(node) {
    return new MathNode(node.__inline,structuredClone(node.__mathTree),this.__versionCounter,node.__key);
  }

  getMathTree(){return this.__mathTree}
  setMathTree(mathTree){
    const writable = this.getWritable();
    writable.__mathTree = mathTree;
    writable.__versionCounter++;
  }

  isInline(){return this.__inline}

  toLatex(){
    const delimiter = this.__inline ? "$" : "$$";
    return `${delimiter} ${MathNodes.getFormula(this.__mathTree,false)} ${delimiter} ${this.__inline ? '' : '\n'}`
  }
  
  createDOM(config) {
    const dom = document.createElement("span");
    dom.classList.add("editor-math");
    return dom;
  }

  updateDOM(prevNode, dom) {
    return this.__versionCounter !== prevNode.__versionCounter;
  }

  decorate(){
    return (
    <SelectableComponent nodeKey={this.__key}>
      <MathEditor nodeKey={this.getKey()} initMathTree={this.__mathTree} inline={this.__inline}/>
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
  return new MathNode(inline,structuredClone(MathNodes.DEFAULT_TREE),0);
}