import { $getSelection, TextNode, DecoratorNode } from 'lexical';

export class ReferenceNode extends DecoratorNode {
  static getType() {return 'reference-heading'}

  constructor(referenceKey,key) {
    super(key);
    this.__reference_key = referenceKey;
    this.__text = "??";
  }

  static clone(node) {
    return new ReferenceNode(node.__reference_key,node.__key);
  }

  setText(text){
    this.getWritable().__text = text;
  }

  getReferenceKey(){return this.__reference_key}
  getText(){return this.__text}
  
  createDOM(config) {
    const dom = document.createElement("span");
    dom.classList.add("editor-reference-heading");
    return dom;
  }

  updateDOM(prevNode, dom){
    return prevNode.__text!==this.__text
  };

  decorate(){
    return `${this.__text}`;
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