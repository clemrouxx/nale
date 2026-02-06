import { DecoratorNode } from 'lexical';
import { SelectableComponent } from '../plugins/SelectableComponent';

export class FootnoteNode extends DecoratorNode {
  __footnote_text;
  __number;

  static getType() {
    return 'footnote';
  }

  static clone(node) {
    return new FootnoteNode(node.__footnote_text, node.__number, node.__key);
  }

  constructor(footnoteText = '', number = 0, key) {
    super(key);
    this.__footnote_text = footnoteText;
    this.__number = number;
  }

  createDOM(config) {
    const span = document.createElement('span');
    span.className = 'footnote-reference';
    return span;
  }

  updateDOM() {
    return false;
  }

  getFootnoteText() {
    const self = this.getLatest();
    return self.__footnote_text;
  }

  getNumber() {
    const self = this.getLatest();
    return self.__number;
  }

  setFootnoteText(footnoteText) {
    const writable = this.getWritable();
    writable.__footnote_text = footnoteText;
  }

  setNumber(number) {
    const writable = this.getWritable();
    writable.__number = number;
  }

  updateNumber(number){
    if (number !== this.__number) this.setNumber(number);
  }

  exportJSON() {
    return {
      footnoteText: this.__footnote_text,
      number: this.__number,
      type: 'footnote',
      version: 1,
    };
  }

  static importJSON(serializedNode) {
    const { footnoteText, number } = serializedNode;
    return $createFootnoteNode(footnoteText, number);
  }

  decorate(){
    return (<SelectableComponent inline={true} nodeKey={this.__key}>
        {this.__number || '?'}
    </SelectableComponent>)
  }

  toLatex(){
    return `\\footnote{${this.__footnote_text}}`
  }
}

export function $createFootnoteNode(footnoteText = '', number = 0) {
  return new FootnoteNode(footnoteText, number);
}

export function $isFootnoteNode(node) {
  return node instanceof FootnoteNode;
}