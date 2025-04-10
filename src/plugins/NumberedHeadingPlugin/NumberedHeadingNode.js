// The code for quote blocks has been used as a template

import { ElementNode,$applyNodeReplacement,$createParagraphNode } from "lexical";
import {addClassNamesToElement} from '@lexical/utils';
import {HeadingNode} from '@lexical/rich-text';
import { areIdentical } from "../../utils/areObjectsIdentical";

const HEADING_NUMBERING_TEMPLATES = {
  1 : "{1}   ",
  2 : "{1}.{2}   ",
  3 : "{1}.{2}.{3}   ",
}

export class NumberedHeadingNode extends HeadingNode{
  constructor(tag, numbering, key) {
    super(tag,key);
    this.numbering = numbering; // Store heading numbering as node property
  }

  static getType() {
    return 'numbered-heading';
  }

  static clone(node) {
    return new NumberedHeadingNode(node.__tag,node.numbering,node.__key);
  }

  getHeadingLevel(){
    return Number(this.getTag()[1]);
  }

  getHeadingNumberingString(){
    var s = HEADING_NUMBERING_TEMPLATES[this.getHeadingLevel()];
    for (let level = 1; level <= this.getHeadingLevel(); level++) {
      s = s.replace(`{${level}}`,String(this.numbering[level]));
    }
    return s;
  }

  // View

  createDOM(config) {
    const dom = document.createElement(this.__tag);
    dom.classList.add(config.theme.heading[this.__tag],config.theme.headingCommon);

    const numberingElement = document.createElement("span");
    numberingElement.innerText = this.getHeadingNumberingString();
    numberingElement.contentEditable = false;

    const contentElement = document.createElement('span');

    dom.appendChild(numberingElement);
    dom.appendChild(contentElement);
    return dom;
  }
  
  updateDOM(prevNode, dom) {
    return !areIdentical(this.numbering,prevNode.numbering);
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
      numbering:this.numbering
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
  return $applyNodeReplacement(new NumberedHeadingNode(headingTag,{}));
}
