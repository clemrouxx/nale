import { ElementNode, $createParagraphNode, $getRoot, $getSelection, $isRangeSelection } from 'lexical';

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

export function insertAbstract(editor) { // !!! change : allow only one abstract, and place it properly !
  editor.update(() => {
    const root = $getRoot();
    const node = $createAbstractNode();
    node.select();
    root.splice(0, 0, [node]);// Insert as first child
  });
}