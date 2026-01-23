
import { DecoratorNode } from 'lexical';
import { SelectableComponent } from '../plugins/SelectableComponent';

export class SkipNode extends DecoratorNode {
  static getType() {return 'skip'}

  constructor(key) {
      super(key);
  }

  static clone(node) {
    return new SkipNode(node.__key);
  }

  createDOM() {
    const div = document.createElement('div');
    div.className = "editor-skip";
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

  toLatex() {return "\\medskip\n" }

  static importJSON(serializedNode) {
    return new SkipNode();
  }
}

export function $createSkipNode(){
  return new SkipNode();
}
