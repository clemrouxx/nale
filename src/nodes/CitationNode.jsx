import { $getSelection, $isRangeSelection, DecoratorNode } from 'lexical';
import { SelectableComponent } from '../plugins/SelectableComponent';
import { $findSelectedOrBeforeCursor } from '../utils/lexicalUtils';

export class CitationNode extends DecoratorNode {
  static getType() {return 'citation'}

  constructor(citationKeys,key) {
    super(key);
    this.__citation_keys = citationKeys;
    this.__text = `[${citationKeys.join(",")}]`;
  }

  static clone(node) {
    return new CitationNode(node.__citation_keys,node.__key);
  }

  isInline() { return true }
  getCitationKeys(){return this.__citation_keys}
  getText(){return this.__text}
  getTextContent(){return this.__text}

  addCitationKey(citationKey){ this.getWritable().__citation_keys = [...this.__citation_keys,citationKey];  }

  __setText(text){
    this.getWritable().__text = text;
  }

  updateText(citationsDict){
    const keyToText = (referenceKey) => citationsDict[referenceKey] ?? referenceKey;
    const text = `[${this.__citation_keys.map(keyToText).join(',')}]`;
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
    return (
    <SelectableComponent inline={true} nodeKey={this.__key}>
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
      type:'citation',
      citation_keys : this.__citation_keys,
    };
  }

  toLatex(){return `\\cite{${this.__citation_keys.join(",")}}`}
}

export function insertCitation(editor,citationKeys) {
  return editor.update(() => {
    const selection = $getSelection();
    
    // We need to find when we are right after a citation node
    const citationNode = $findSelectedOrBeforeCursor("citation");
    if (citationNode){
      citationKeys.forEach(key => {
        citationNode.addCitationKey(key);
      });
      return true;
    }
    else if (selection){
      selection.insertNodes([new CitationNode(citationKeys)]);
      return true;
    }
    return false;
  });
}