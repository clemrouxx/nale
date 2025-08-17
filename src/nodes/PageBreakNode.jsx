
import { DecoratorNode } from 'lexical';

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
    return (<>PAGE BREAK</>);
  }

  isInline() {
    return false;
  }

  isKeyboardSelectable() {
    return true;
  }

  toLatex() {return "\\newpage\n" }
}

export function $createPageBreakNode(){
    return new PageBreakNode();
}
