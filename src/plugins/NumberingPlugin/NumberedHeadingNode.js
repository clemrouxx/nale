import { $applyNodeReplacement,$createParagraphNode } from "lexical";
import { areIdentical } from "../../utils/generalUtils";
import { ElementNode } from "lexical";
import { HEADING_COMMANDS } from "../LatexExportPlugin/latexUtils";

function numberToString(num,style){
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

export class NumberedHeadingNode extends ElementNode{
  constructor(level, numbering, headings_options, is_numbered, key) {
    super(key);
    this.__tag = `h${level}`;
    this.__level = level;
    this.__numbering = numbering;
    this.__headings_options = headings_options;
    this.__is_numbered = is_numbered;
  }

  static getType() { return 'numbered-heading'}
  getLevel() { return this.__level } // TO CHANGE AND USE getLatest() ?
  getNumbering() { return this.__numbering }
  getKey() { return this.__key }
  isNumbered() { return this.__is_numbered }
  toLatex(childrenString) { return `${HEADING_COMMANDS[this.__level]}${this.__is_numbered?'':'*'}{${childrenString}}\\label{${this.__key}}\n`}

  static clone(node) {
    return new NumberedHeadingNode(node.__level,node.__numbering,node.__headings_options,node.__is_numbered,node.__key);
  }

  setNumbering(numbering){ this.getWritable().__numbering = structuredClone(numbering) }
  setIsNumbered(is_numbered) { const writable = this.getWritable().__is_numbered = is_numbered }

  setDocumentOptions(documentOptions){
    const writable = this.getWritable();
    writable.__headings_options = documentOptions.headings;
    writable.markDirty();
  }

  getNumberingString(){
    if (!this.__is_numbered) return "";
    if (!this.__headings_options) return "ERROR";
    const replacedStrings = {1:"{S}",2:"{sS}",3:"{ssS}"};
    var s = this.__headings_options.numberingTemplates[this.__level];
    for (let level = 1; level <= this.__level; level++) {
      s = s.replaceAll(replacedStrings[level],this.__numbering[level]?numberToString(this.__numbering[level],this.__headings_options.numberingStyles[level]):"0");
    }
    return s;
  }

  // View

  createDOM(config) {
    const dom = document.createElement(this.__tag);
    dom.classList.add(config.theme.heading[this.__tag],config.theme.headingCommon,"editor-numbered-heading");
    dom.setAttribute("numberingstring",this.getNumberingString());
    return dom;
  }
  
  updateDOM(prevNode, dom) {
    return !(this.getNumberingString()===prevNode.getNumberingString());
  }

  static importJSON(serializedNode) {
    return new NumberedHeadingNode(serializedNode.__level,{},serializedNode.__headings_options,serializedNode.__is_numbered);
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      __level : this.__level,
      __headings_options : this.__headings_options,
      __is_numbered : this.__is_numbered
    };
  }

  // Mutate
  
  insertNewAfter(_, restoreSelection) {
    const newBlock = $createParagraphNode();
    newBlock.setDirection(this.getDirection());
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
}

export function $createNumberedHeadingNode(headingLevel,documentOptions) {
  return $applyNodeReplacement(new NumberedHeadingNode(headingLevel,{},documentOptions.headings,true));
}

export function $isNumberedHeadingNode(node) {
  return node instanceof NumberedHeadingNode;
}