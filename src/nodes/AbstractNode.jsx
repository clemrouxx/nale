import { ElementNode, $createParagraphNode, $getRoot, $getSelection, $isRangeSelection } from 'lexical';
import { putInEnvironment } from '../plugins/LatexExportPlugin/latexUtils';

export class AbstractNode extends ElementNode {
  static getType() {
    return 'abstract';
  }

  static clone(node) {
    return new AbstractNode(node.__key);
  }

  createDOM() {
    const div = document.createElement('div');
    div.className = 'editor-abstract';
    return div;
  }

  updateDOM() {
    return false;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'abstract',
      version: 1,
    };
  }

  static importJSON(serializedNode) {
    return new AbstractNode();
  }

  toLatex(childrenstring){ return putInEnvironment(childrenstring,"abstract") }

  canBeEmpty(){
    return false;
  }

  isCursorAtEnd() {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return false;

    const children = this.getChildren();
    if (children.length === 0) return false;

    const lastChild = children[children.length - 1];
    const anchorNode = selection.anchor.getNode();
    
    // Check if we're in the last paragraph and at the end
    return (
      anchorNode === lastChild ||
      anchorNode.getParent() === lastChild
    ) && selection.anchor.offset === anchorNode.getTextContent().length;
  }
}

export function $createAbstractNode() {
  const node = new AbstractNode();
  // Add initial paragraph for abstract content
  node.append($createParagraphNode());
  return node;
}

export function insertAbstract(editor) {
  editor.update(() => {
    const root = $getRoot();
    const node = $createAbstractNode();
    node.select();
    // We want to place the abstract just after the title page.
    let index = 0;
    const children = root.getChildren();
    for (let i=0;i<children.length;i++){
      if (children[i].isTitlePageNode) index++;
      else break;
    }
    root.splice(index, 0, [node]);
  });
}