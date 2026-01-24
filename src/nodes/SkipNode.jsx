
import { DecoratorNode } from 'lexical';
import { SelectableComponent } from '../plugins/SelectableComponent';

export class SkipNode extends DecoratorNode {
  static getType() {return 'skip'}

  constructor(size,key) {
      super(key);
      this.__size = size;
  }

  static clone(node) {
    return new SkipNode(node.__size,node.__key);
  }

  createDOM() {
    const div = document.createElement('div');
    div.className = `editor-skip ${this.__size}skip`;
    return div;
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return (
      <SelectableComponent nodeKey={this.__key}></SelectableComponent>
    );
  }

  isInline() {
    return false;
  }

  isKeyboardSelectable() {
    return true;
  }

  toLatex() {return `\\${this.__size}skip\n` }

  static importJSON(serializedNode) {
    return new SkipNode(serializedNode.size);
  }

   exportJSON() {
    return {
      ...super.exportJSON(),
      size : this.__size,
    };
  }
}

export function $createSkipNode(size){
  return new SkipNode(size);
}
