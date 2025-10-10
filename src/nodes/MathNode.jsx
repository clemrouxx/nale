import { MathJax } from 'better-react-mathjax';
import { DecoratorNode } from 'lexical';
import { SelectableComponent } from '../plugins/SelectableComponent';
import MathEditor from '../plugins/MathPlugin/MathEditor';
import MathNodes from '../plugins/MathPlugin/MathNodes';
import { createRef } from 'react';

export class MathNode extends DecoratorNode {
  constructor(inline,mathTree,versionCounter,is_numbered,labelNumber,key) {
    super(key);
    this.__inline = inline;
    this.__math_tree = mathTree;
    this.__version_counter = versionCounter;
    this.__is_numbered = is_numbered;
    this.__numbering = "?";
    this.__label_number = labelNumber ?? -1;
    this.__ref = createRef();
  }

  static clone(node) {
    return new MathNode(node.__inline,structuredClone(node.__math_tree),this.__version_counter,node.__is_numbered,node.__label_number,node.__key);
  }

  // Getters
  static getType() {return 'math'}
  getMathTree(){return this.__math_tree}
  getNumbering() { return this.__numbering }
  isNumbered() { return this.__is_numbered }
  isInline(){return this.__inline}
  getLabel(){return `eq:${this.__label_number}`}
  getEditorRef(){ return this.__ref }

  // Setters
  setMathTree(mathTree){
    const writable = this.getWritable();
    writable.__math_tree = mathTree;
    writable.__version_counter++;
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
    if (this.__is_numbered) dom.setAttribute("id",this.getLabel());
    return dom;
  }

  updateDOM(prevNode, dom) {
    return this.__version_counter !== prevNode.__version_counter; // Necessary to force some of the updates done to mathTree.
  }

  decorate(){
    return (
    <SelectableComponent inline={true} nodeKey={this.__key}>
      <MathEditor nodeKey={this.getKey()} ref={this.__ref} initMathTree={this.__math_tree} inline={this.__inline} numbering={this.__is_numbered?this.__numbering:null}/>
    </SelectableComponent>
    );
  }

  // Import-export

  static importJSON(serializedNode) {
    return new MathNode(serializedNode.inline,serializedNode.math_tree,0,serializedNode.is_numbered,serializedNode.label_number);
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      inline:this.__inline,
      math_tree:this.__math_tree,
      is_numbered:this.__is_numbered,
      label_number:this.__label_number
    };
  }

  toLatex(){
    const formula = MathNodes.getFormula(this.__math_tree,false);
    if (this.__is_numbered){
      return `\\begin{equation} \n ${formula} \n \\label{${this.getLabel()}} \n \\end{equation} \n`;
    }
    else{
      const delimiter = this.__inline ? "$" : "$$";
      return `${delimiter}${formula}${delimiter}${this.__inline ? '' : '\n'}`
    }
    
  }

}

export function $createMathNode(inline,label){
  return new MathNode(inline,structuredClone(MathNodes.DEFAULT_TREE),0,false,label);
}