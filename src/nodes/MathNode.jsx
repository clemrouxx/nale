import { MathJax } from 'better-react-mathjax';
import { DecoratorNode } from 'lexical';
import { SelectableComponent } from './SelectableComponent';
import MathEditor from '../plugins/MathPlugin/MathEditor';
import MathNodes from '../plugins/MathPlugin/MathNodes';

export class MathNode extends DecoratorNode {
  constructor(inline,mathTree,versionCounter,is_numbered,labelNumber,key) {
    super(key);
    this.__inline = inline;
    this.__mathTree = mathTree;
    this.__versionCounter = versionCounter;
    this.__is_numbered = is_numbered;
    this.__numbering = "?";
    this.__label_number = labelNumber ?? -1;
  }

  static clone(node) {
    return new MathNode(node.__inline,structuredClone(node.__mathTree),this.__versionCounter,node.__is_numbered,node.__label_number,node.__key);
  }

  // Getters
  static getType() {return 'math'}
  getMathTree(){return this.__mathTree}
  getNumbering() { return this.__numbering }
  isNumbered() { return this.__is_numbered }
  isInline(){return this.__inline}
  getLabel(){return `eq:${this.__label_number}`}

  // Setters
  setMathTree(mathTree){
    const writable = this.getWritable();
    writable.__mathTree = mathTree;
    writable.__versionCounter++;
  }
  setNumbering(numbering){ this.getWritable().__numbering = structuredClone(numbering) }
  setIsNumbered(is_numbered) { const writable = this.getWritable().__is_numbered = is_numbered }

  updateNumbering(numbering){
    if (numbering !== this.__numbering) this.setNumbering(numbering);
  }
  
  // DOM

  createDOM(config) {
    const dom = document.createElement("span");
    dom.classList.add("editor-math");
    return dom;
  }

  updateDOM(prevNode, dom) {
    return this.__versionCounter !== prevNode.__versionCounter; // Necessary to force some of the updates done to mathTree.
  }

  decorate(){
    return (
    <SelectableComponent nodeKey={this.__key}>
      <MathEditor nodeKey={this.getKey()} initMathTree={this.__mathTree} inline={this.__inline} numbering={this.__is_numbered?this.__numbering:null}/>
    </SelectableComponent>
    );
  }

  // Import-export

  static importJSON(serializedNode) {
    return new MathNode(serializedNode.__inline,serializedNode.__mathTree,0,serializedNode.__is_numbered,serializedNode.__label_number);
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      __inline:this.__inline,
      __mathTree:this.__mathTree,
      __is_numbered:this.__is_numbered,
      __label_number:this.__label_number
    };
  }

  toLatex(){
    const delimiter = this.__inline ? "$" : "$$";
    return `${delimiter} ${MathNodes.getFormula(this.__mathTree,false)} ${delimiter} ${this.__inline ? '' : '\n'}`
  }
}

export function $createMathNode(inline,label){
  return new MathNode(inline,structuredClone(MathNodes.DEFAULT_TREE),0,false,label);
}