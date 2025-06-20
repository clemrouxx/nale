import { $getSelection, $isRangeSelection, DecoratorNode } from 'lexical';
import { bibItemToHTML } from '../utils/bibliographyUtils';
import { areIdentical } from '../utils/generalUtils';
import React from 'react';

function compareInnerArrays(a,b){
  if (a.length!==b.length) return false;
  for (let i=0;i<a.length;i++){
    if (a[i].bibItem && b[i].bibItem && (a[i].bibItem.key!==b[i].bibItem.key)) return false;
  }
  return true;
}

export class BibliographyNode extends DecoratorNode {
  static getType() {return 'bibliography'}
  static isInline() {return false}

  constructor(innerArray,key) {
    super(key);
    this.__inner_array = innerArray;
  }

  static clone(node) {
    return new BibliographyNode(node.__inner_array,node.__key);
  }

  updateInner(citationKeys,citationsDict,biblio){
    const newInnerArray = citationKeys.map(key=>{return {label:citationsDict[key],bibItem:biblio.find(item=>item.key===key)};});
    if (!compareInnerArrays(this.__inner_array,newInnerArray)){
      const writableNode = this.getWritable().__inner_array = structuredClone(newInnerArray);
    }
  }
  
  createDOM(config) {
    const dom = document.createElement("div");
    dom.classList.add("editor-bibliography");
    return dom;
  }

  updateDOM(prevNode, dom){
    return false;
  };

  decorate(){
    return (
        <>
        <h1>References</h1>
        <div className="editor-references-grid">
          {this.__inner_array.map(elmt=>(
            <React.Fragment key={elmt.label}>
              <span>{elmt.label}</span>
              {bibItemToHTML(elmt.bibItem)}
            </React.Fragment>
          ))}
        </div>
        </>
    );
  }

  toLatex() {return '\\printbibliography\n'}

  static importJSON(serializedNode) {
    return new BibliographyNode(serializedNode.__inner_array);
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      __inner_array : this.__inner_array,
    };
  }
}

function $createBibliographyNode(){
  return new BibliographyNode([]);
}

export function insertBibliographyNode(editor) {
  editor.update(() => {
    const selection = $getSelection();
    
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const topLevelNode = anchorNode.getTopLevelElement();
      
      const node = $createBibliographyNode();
      
      topLevelNode.insertAfter(node);
    }
  });
}