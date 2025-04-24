import { $getSelection, $isRangeSelection, DecoratorNode } from 'lexical';
import { bibItemToHTML, bibItemToUIString } from '../utils/bibliographyUtils';
import { areIdentical } from '../utils/generalUtils';

export class BibliographyNode extends DecoratorNode {
  static getType() {return 'bibliography'}
  static isInline() {return false}
  static toLatex() {return '\\printbibliography\n'}

  constructor(innerArray,key) {
    super(key);
    this.__inner_array = innerArray;
  }

  static clone(node) {
    return new BibliographyNode(node.__inner_array,node.__key);
  }

  __setInnerArray(innerArray){this.getWritable().__inner_array=innerArray}

  updateInner(citationKeys,citationsDict,biblio){
    let newInnerArray = citationKeys.map(key=>{return {label:citationsDict[key],bibItem:biblio.find(item=>item.key===key)};});
    if (!areIdentical(this.__inner_array,newInnerArray)){
      this.__setInnerArray(newInnerArray);
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
          {this.__inner_array.map(elmt=>(<>
              <span>{elmt.label}</span>
              {bibItemToHTML(elmt.bibItem)}
            </>
          ))}
        </div>
        </>
    );
  }

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