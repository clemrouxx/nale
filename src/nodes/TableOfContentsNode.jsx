import { $getSelection, $isRangeSelection, DecoratorNode } from 'lexical';
import React from 'react';

function compareInnerArrays(a,b){
  if (a.length!==b.length) return false;
  for (let i=0;i<a.length;i++){
    if (a[i].numberingString!==b[i].numberingString || a[i].textContent!==b[i].textContent) return false;
  }
  return true;
}

export class TableOfContentsNode extends DecoratorNode {
  static getType() {return 'toc'}
  static isInline() {return false}

  constructor(innerArray,key) {
    super(key);
    this.__inner_array = innerArray;
  }

  static clone(node) {
    return new TableOfContentsNode(node.__inner_array,node.__key);
  }

  updateInner(headingsArray){
    if (!compareInnerArrays(this.__inner_array,headingsArray)){
      this.getWritable().__inner_array = structuredClone(headingsArray);
    }
  }
  
  createDOM(config) {
    const dom = document.createElement("div");
    dom.classList.add("editor-toc");
    return dom;
  }

  updateDOM(prevNode, dom){
    return false;
  };

  decorate(){
    return (
        <>
        <h1>Contents</h1>
        <div className="editor-toc-grid">
          {this.__inner_array.map(elmt=>(
            <React.Fragment key={elmt.label}>
              <span>{`${elmt.numberingString} ${elmt.textContent}`}</span>
            </React.Fragment>
          ))}
        </div>
        </>
    );
  }

  toLatex() {return 'TABLE OF CONTENTS'}

  static importJSON(serializedNode) {
    return new TableOfContentsNode(serializedNode.inner_array);
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      inner_array : this.__inner_array,
    };
  }
}

function $createTableOfContentsNode(){
  return new TableOfContentsNode([]);
}

export function insertTableOfContentsNode(editor) {
  editor.update(() => {
    const selection = $getSelection();
    
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const topLevelNode = anchorNode.getTopLevelElement();
      
      const node = $createTableOfContentsNode();
      
      topLevelNode.insertAfter(node);
    }
  });
}