
import { DecoratorNode } from 'lexical';
import { SelectableComponent } from '../plugins/SelectableComponent';

export class PageBreakNode extends DecoratorNode {
  static getType() {
    return 'pagebreak';
  }

  static clone(node) {
    return new PageBreakNode(node.__key);
  }

  createDOM() {
    const div = document.createElement('div');
    div.className = "editor-pagebreak";
    return div;
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return (<SelectableComponent nodeKey={this.__key}>TTTTEEEESSSSSSSSSTTTTTT</SelectableComponent>);
  }

  isInline() {
    return false;
  }

  isKeyboardSelectable() {
    return true;
  }

  toLatex() {return "\\newpage\n" }

  static importJSON(serializedNode) {
    return new PageBreakNode();
  }
}

export function $createPageBreakNode(){
  return new PageBreakNode();
}
