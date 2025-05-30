// The code for quote blocks has been used as a template

import { ElementNode,$applyNodeReplacement,$createParagraphNode } from "lexical";
import {addClassNamesToElement} from '@lexical/utils';

export class LatexNode extends ElementNode {
  static getType() {
    return 'latex';
  }

  static clone(node) {
    return new LatexNode(node.__key);
  }

  toLatex(){return this.getTextContent()}

  // View

  createDOM(config) {
    const element = document.createElement('div');
    addClassNamesToElement(element, config.theme.latex);
    return element;
  }

  updateDOM(prevNode, dom) {
    return false;
  }

  static importJSON(serializedNode) {
    return $createLatexNode().updateFromJSON(serializedNode);
  }

  static exportJSON() { // !!! TODO
    return {
      type: 'latex',
      version: 1,
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

export function $createLatexNode() {
  return $applyNodeReplacement(new LatexNode());
}

export function $isLatexNode(node) {
  return node instanceof LatexNode;
}
