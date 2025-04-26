import { $getSelection, $insertNodes, DecoratorNode } from 'lexical';

export class SimpleTestNode extends DecoratorNode {
    static getType() {
        return 'test';
    }

    static clone(node) {
        return new SimpleTestNode(node.__key);
    }
  
    constructor(key) {
      super(key);
    }
  
    createDOM() {
      return document.createElement('span');
    }
  
    updateDOM() {
      return false;
    }
  
    decorate() {
      return "TEST NODE";
    }
  }
  
  export function $createSimpleTestNode() {
    return new SimpleTestNode();
  }

export function insertSimpleTestNode(editor) {
    editor.update(() => {
        $insertNodes([$createSimpleTestNode()]);
    });
}