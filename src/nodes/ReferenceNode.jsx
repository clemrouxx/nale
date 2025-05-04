import { $getSelection, TextNode, DecoratorNode } from 'lexical';

export class ReferenceNode extends DecoratorNode {
  static getType() {return 'reference'}

  constructor(referenceKey,key) {
    super(key);
    this.__reference_key = referenceKey;
    this.__text = "??";
  }

  static clone(node) {
    return new ReferenceNode(node.__reference_key,node.__key);
  }

  __setText(text){
    this.getWritable().__text = text;
  }

  updateText(labels){
    let info = labels.find((elmt)=>(elmt.key===this.getReferenceKey()))
    var text = info ? info.numberingString : "??";
    if (this.getText() !== text){
      this.__setText(text);
    }
  }

  getReferenceKey(){return this.__reference_key}
  getText(){return this.__text}
  toLatex(){return `\\ref{${this.__reference_key}}`}
  
  createDOM(config) {
    const dom = document.createElement("span");
    dom.classList.add("editor-reference");
    return dom;
  }

  updateDOM(prevNode, dom){
    return prevNode.__text!==this.__text
  };

  decorate(){
    return `${this.__text}`;
  }

  static importJSON(serializedNode) {
    return new ReferenceNode(serializedNode.__reference_key);
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      __reference_key : this.__reference_key,
    };
  }
}

export function insertReferenceNode(editor,referenceKey) { // To improve
  editor.update(() => {
    const selection = $getSelection();
    
    if (selection) {
      const nodeToInsert = new ReferenceNode(referenceKey);
      selection.insertNodes([nodeToInsert]);
    }
  });
}