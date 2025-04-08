// The code for quote blocks has been used as a template

import { ElementNode,$applyNodeReplacement,$createParagraphNode } from "lexical";
import {addClassNamesToElement} from '@lexical/utils';
import {HeadingNode} from '@lexical/rich-text';


export class NumberedHeadingNode extends HeadingNode{
  static getType() {
    return 'numbered-heading';
  }

  static clone(node) {
    return new NumberedHeadingNode(node.__tag,node.__key);
  }

  // View

  createDOM(config) {
    const element = document.createElement(this.__tag);
    addClassNamesToElement(element, config.theme.heading, "editor-debug");
    return element;
  }
  updateDOM(prevNode, dom) {
    return false;
  }

  /*
  static importDOM(){
    return {
      blockquote: (node) => ({
        conversion: $convertBlockquoteElement,
        priority: 0,
      }),
    };
  }

  exportDOM(editor) {
    const {element} = super.exportDOM(editor);

    if (isHTMLElement(element)) {
      if (this.isEmpty()) {
        element.append(document.createElement('br'));
      }

      const formatType = this.getFormatType();
      element.style.textAlign = formatType;

      const direction = this.getDirection();
      if (direction) {
        element.dir = direction;
      }
    }

    return {
      element,
    };
  }*/

  static importJSON(serializedNode) {
    return $createNumberedHeadingNode(serializedNode.tag).updateFromJSON(serializedNode);
  }

  static exportJSON() {
    return {
      ...super.exportJSON(),
    };
  }

  insertNewAfter(_, restoreSelection) {
    const newBlock = $createParagraphNode();
    const direction = this.getDirection();
    newBlock.setDirection(direction);
    this.insertAfter(newBlock, restoreSelection);
    return newBlock;
  }

  collapseAtStart() {
    const paragraph = $createParagraphNode();
    const children = this.getChildren();
    children.forEach((child) => paragraph.append(child));
    this.replace(paragraph);
    return true;
  }

  canMergeWhenEmpty() {
    return true;
  }
}

export function $createNumberedHeadingNode(headingTag) {
  return $applyNodeReplacement(new NumberedHeadingNode(headingTag));
}
