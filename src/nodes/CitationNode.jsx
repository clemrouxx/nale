import { $getSelection, DecoratorNode } from 'lexical';
import { SelectableComponent } from '../plugins/SelectableComponent';

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

  isInline() { return true }
  getCitationKey(){return this.__citation_key}
  getText(){return this.__text}
  getTextContent(){return this.__text}

  __setText(text){
    this.getWritable().__text = text;
  }

  updateText(citationsDict){
    const text = citationsDict[this.__citation_key] ? citationsDict[this.__citation_key] : `[${this.__citation_key}]`;
    if (this.getText() !== text){
      this.__setText(text);
    }
  }
  
  createDOM(config) {
    const dom = document.createElement("span");
    dom.classList.add("editor-citation");
    dom.contentEditable = "false";
    dom.style.userSelect = "all";
    return dom;
  }

  updateDOM(prevNode, dom){
    return prevNode.__text!==this.__text
  };

  decorate(){
    return (
    <SelectableComponent nodeKey={this.__key}>
      {this.__text}
    </SelectableComponent>
    );
  }

  static importJSON(serializedNode) {
    return new CitationNode(serializedNode.citation_key);
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      citation_key : this.__citation_key,
    };
  }

  toLatex(){return `\\cite{${this.__citation_key}}`}
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