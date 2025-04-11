import { $applyNodeReplacement,$createParagraphNode } from "lexical";
import {HeadingNode} from '@lexical/rich-text';
import { areIdentical } from "../../utils/areObjectsIdentical";

const HEADING_NUMBERING_STYLES = { // { <headingLevel> : <style> }
  1 : "Roman",
  2 : "Alph",
  3 : "alph",
}

const HEADING_NUMBERING_TEMPLATES = { // Always from the highest level to the lowest. { <headingLevel> : <template> }
  1 : "{}   ",
  2 : "{}.{}   ",
  3 : "{}.{}.{}   ",
}

function getNumberingString(num,style){
  if (style==="a") return String(num); // Arab numerals
  else if (num < 1 || num > 26) return null;
  else if (style.toLowerCase()==="alph"){ // Alphanumeric
    const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return (style==="alph") ? ALPHABET[num-1].toLowerCase() : ALPHABET[num-1];
  }
  else if (style.toLowerCase()==="roman"){ // Roman numeral
    const ROMAN_NUMERALS = [
      'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX',
      'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX',
      'XX', 'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI'
    ];
    return (style==="roman") ? ROMAN_NUMERALS[num-1].toLowerCase() : ROMAN_NUMERALS[num-1];
  }
}

export class NumberedHeadingNode extends HeadingNode{
  constructor(level, numbering, key) {
    const tag = `h${level}`;
    super(tag,key);
    this.level = level;
    this.numbering = numbering; // Store heading numbering as node property
  }

  static getType() {
    return 'numbered-heading';
  }

  static clone(node) {
    return new NumberedHeadingNode(node.level,node.numbering,node.__key);
  }

  getHeadingNumberingString(){
    var s = HEADING_NUMBERING_TEMPLATES[this.level];
    for (let level = 1; level <= this.level; level++) {
      console.log(this.numbering);
      s = s.replace("{}",this.numbering[level]?getNumberingString(this.numbering[level],HEADING_NUMBERING_STYLES[level]):"0");
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
    return $createNumberedHeadingNode(serializedNode.level).updateFromJSON(serializedNode);
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

export function $createNumberedHeadingNode(headingLevel) {
  return $applyNodeReplacement(new NumberedHeadingNode(headingLevel,{}));
}
