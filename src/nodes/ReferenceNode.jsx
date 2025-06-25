import { $getSelection, TextNode, DecoratorNode } from 'lexical';
import { SelectableComponent } from './SelectableComponent';

export class ReferenceNode extends DecoratorNode {
  static getType() {return 'reference'}

  constructor(referenceLabel,key) {
    super(key);
    this.__reference_label = referenceLabel;
    this.__text = "??";
  }

  static clone(node) {
    return new ReferenceNode(node.__reference_label,node.__key);
  }

  __setText(text){
    this.getWritable().__text = text;
  }

  updateText(labels){
    let info = labels.find((elmt)=>(elmt.label===this.getReferenceLabel()))
    var text = info ? info.numberingString : "??";
    if (this.getText() !== text){
      this.__setText(text);
    }
  }

  getReferenceLabel(){return this.__reference_label}
  getText(){return this.__text}
  toLatex(){return `\\ref{${this.__reference_label}}`}
  
  createDOM(config) {
    const dom = document.createElement("span");
    dom.classList.add("editor-reference");
    return dom;
  }

  updateDOM(prevNode, dom){
    return prevNode.__text!==this.__text
  };

  decorate(){
    return <SelectableComponent nodeKey={this.__key}>
      {this.__text}
    </SelectableComponent>;
  }

  static importJSON(serializedNode) {
    return new ReferenceNode(serializedNode.__reference_label);
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      __reference_label : this.__reference_label,
    };
  }
}

export function insertReferenceNode(editor,referenceLabel) { // To improve
  editor.update(() => {
    const selection = $getSelection();
    
    if (selection) {
      const nodeToInsert = new ReferenceNode(referenceLabel);
      selection.insertNodes([nodeToInsert]);
    }
  });
}