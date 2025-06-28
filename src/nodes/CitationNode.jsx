import { $getSelection, DecoratorNode } from 'lexical';
import { SelectableComponent } from '../plugins/SelectableComponent';

export class CitationNode extends DecoratorNode {
  static getType() {return 'citation'}

  constructor(citationKeys,key) {
    super(key);
    this.__citation_keys = citationKeys;
    console.log(citationKeys);
    this.__text = `[${citationKeys.join(",")}]`;
  }

  static clone(node) {
    return new CitationNode(node.__citation_keys,node.__key);
  }

  isInline() { return true }
  getCitationKeys(){return this.__citation_keys}
  getText(){return this.__text}
  getTextContent(){return this.__text}

  __setText(text){
    this.getWritable().__text = text;
  }

  updateText(citationsDict){
    const keyToText = (referenceKey) => citationsDict[referenceKey] ?? referenceKey;
    const text = this.__citation_keys.map(keyToText).join(',');
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
    return false;
  };

  decorate(){
    console.log('Text content:', this.__text, 'Keys:', this.__citation_keys);
    return (
    <SelectableComponent nodeKey={this.__key}>
      {this.__text}
    </SelectableComponent>
    );
  }

  static importJSON(serializedNode) {
    return new CitationNode(serializedNode.citation_keys);
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      citation_keys : this.__citation_keys,
    };
  }

  toLatex(){return `\\cite{${this.citation_keys.join(",")}}`}
}

export function insertCitationNode(editor,citationKey) { // To improve
  editor.update(() => {
    const selection = $getSelection();
    
    if (selection) {
      const nodeToInsert = new CitationNode([citationKey]);
      selection.insertNodes([nodeToInsert]);
    }
  });
}