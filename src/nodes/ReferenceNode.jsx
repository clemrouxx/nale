import { $getSelection, TextNode } from 'lexical';

export class ReferenceNode extends TextNode {
  // Define the type of the node
  static getType() {
    return 'simple-non-editable';
  }

  // Clone function - required for all nodes
  static clone(node) {
    return new ReferenceNode(node.__key);
  }

  // Constructor
  constructor(key) {
    super("Test",key);
  }

  // Make it visually distinct
  createDOM(config) {
    const dom = super.createDOM(config);
    dom.style.backgroundColor = '#e8f0fe';
    dom.style.color = '#1a73e8';
    return dom;
  }

  canInsertTextAfter() {return false}
  canInsertTextBefore() {return false}
  isSegmented() {return false} // ?
  isSimpleText() {return false}
  // isTextEntity(){return false}
  // isToken(){return true} // Deleted as 1
  isUnmergeable(){return true}
  // spliceText, splitText

}

export function insertReferenceNode(editor) {
  editor.update(() => {
    const selection = $getSelection();
    
    if (selection) {
      // Create the node within this editor update
      const nodeToInsert = new ReferenceNode();
      selection.insertNodes([nodeToInsert]);
    }
  });
}