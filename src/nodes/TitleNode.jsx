import { $createParagraphNode, $getRoot, ElementNode } from "lexical";

export class TitleNode extends ElementNode{
  constructor(key) {
    super(key);
  }

  static getType(){ return "title" }

  static clone(node) {
    return new TitleNode(node.__key);
  }

  toLatex(childrenString) { return ``}

  // View

  createDOM(config) {
    const dom = document.createElement("h1");
    dom.className = "editor-title";
    return dom;
  }
  
  updateDOM(prevNode, dom) {
    return false;
  }

  static importJSON(serializedNode) {
    return new TitleNode();
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
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
    this.replace(paragraph);
    return true;
  }
}

export function insertTitle(editor) {

    // First, check if there is not a title node already
    let titleNodes = [];
    editor.getEditorState().read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        
        titleNodes = children.filter(child => child.getType() === 'title');
    });

    if (titleNodes.length>0){
        editor.update(() => {
            titleNodes[0].select(); // In which case, we select it.
        });
    }

    else{ // Normal case
        editor.update(() => {
            const root = $getRoot();
            const titleNode = new TitleNode();
            titleNode.select();
            root.splice(0, 0, [titleNode]);// Insert as first child
        });
    }

}