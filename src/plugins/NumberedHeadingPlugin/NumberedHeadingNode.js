// The code for quote blocks has been used as a template

import { ElementNode,$applyNodeReplacement,$createParagraphNode } from "lexical";
import {addClassNamesToElement} from '@lexical/utils';
import {HeadingNode} from '@lexical/rich-text';


export class NumberedHeadingNode extends HeadingNode{
  constructor(tag, number, key) {
    super(tag,key);
    this.number = number; // Store heading number as node property
    console.log(this);
  }

  static getType() {
    return 'numbered-heading';
  }

  static clone(node) {
    return new NumberedHeadingNode(node.__tag,node.number,node.__key);
  }

  setNumber(number){
    this.number = number;
  }

  // View

  createDOM(config) {
    const dom = super.createDOM(config);
    //dom.contentEditable = false;
    
    const numberingElement = document.createElement("span");
    numberingElement.innerText = `${this.number}...`
    dom.appendChild(numberingElement);
    console.log(dom);
    addClassNamesToElement(dom, config.theme.heading, "editor-debug");
    return dom;
  }
  
  updateDOM(prevNode, dom) {
    return this.number !== prevNode.number;
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
      number:this.number
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
  return $applyNodeReplacement(new NumberedHeadingNode(headingTag,0));
}
