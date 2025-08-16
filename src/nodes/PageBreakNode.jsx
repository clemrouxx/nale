
import { DecoratorNode } from 'lexical';
import React from 'react';

export class PageBreakNode extends DecoratorNode {
  static getType() {
    return 'pagebreak';
  }

  static clone(node) {
    return new PageBreakNode(node.__key);
  }

  createDOM() {
    const div = document.createElement('div');
    div.className = "editor-pagebreak"
    return div;
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return (<div>PAGE BREAK</div>);
  }

  isInline() {
    return false;
  }

  isKeyboardSelectable() {
    return true;
  }
}

export function $createPageBreakNode(){
    return new PageBreakNode();
}
