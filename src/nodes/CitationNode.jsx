import { $getSelection, DecoratorNode } from 'lexical';

export class CitationNode extends DecoratorNode {
  static getType() {return 'citation'}

  constructor(citationKey,key) {
    super(key);
    this.__citation_key = citationKey;
    this.__text = `[${citationKey}]`;
  }

  static clone(node) {
    return new CitationNode(node.__citation_key,node.__key);
  }

  __setText(text){
    this.getWritable().__text = text;
  }

  updateText(citationsDict){
    const text = citationsDict[this.__citation_key] ? citationsDict[this.__citation_key].label : `[${this.__citation_key}]`;
    if (this.getText() !== text){
      this.__setText(text);
    }
  }

  getCitationKey(){return this.__citation_key}
  getText(){return this.__text}
  
  createDOM(config) {
    const dom = document.createElement("span");
    dom.classList.add("editor-citation");
    return dom;
  }

  updateDOM(prevNode, dom){
    return prevNode.__text!==this.__text
  };

  decorate(){
    return `${this.__text}`;
  }
}

export function insertCitationNode(editor,citationKey) { // To improve
  editor.update(() => {
    const selection = $getSelection();
    
    if (selection) {
      const nodeToInsert = new CitationNode(citationKey);
      selection.insertNodes([nodeToInsert]);
    }
  });
}