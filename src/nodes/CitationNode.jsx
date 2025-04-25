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
    const text = citationsDict[this.__citation_key] ? citationsDict[this.__citation_key] : `[${this.__citation_key}]`;
    if (this.getText() !== text){
      this.__setText(text);
    }
  }

  isInline() { return true }
  isIsolated() { return true }
  getCitationKey(){return this.__citation_key}
  getText(){return this.__text}
  getTextContent(){return this.__text}
  toLatex(){return `\\cite{${this.__citation_key}}`}
  
  createDOM(config) {
    const dom = document.createElement("span");
    dom.classList.add("editor-citation");
    return dom;
  }

  updateDOM(prevNode, dom){
    return prevNode.__text!==this.__text
  };

  decorate(){
    return this.__text;
  }

  static importJSON(serializedNode) {
    return new CitationNode(serializedNode.__citation_key);
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      __citation_key : this.__citation_key,
    };
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