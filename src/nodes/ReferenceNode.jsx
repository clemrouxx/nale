import { $getSelection, TextNode, DecoratorNode } from 'lexical';

export class ReferenceNode extends DecoratorNode {
  static getType() {return 'reference-heading'}

  constructor(referenceKey,key) {
    super(key);
    this.__reference_key = referenceKey;
    this.__text = "?";
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
    dom.style.backgroundColor = '#e8f0fe';
    dom.style.color = '#1a73e8';
    return dom;
  }

  updateDOM(prevNode, dom){
    return prevNode.__text!==this.__text
  };

  decorate(){
    return `${this.__text}(${this.__reference_key})`;
  }
}

export function insertReferenceNode(editor) { // To improve
  editor.update(() => {
    const selection = $getSelection();
    
    if (selection) {
      const nodeToInsert = new ReferenceNode("3");
      selection.insertNodes([nodeToInsert]);
    }
  });
}