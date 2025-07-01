import { ElementNode, TextNode, $createTextNode, $getRoot, $getSelection, $isRangeSelection, KEY_TAB_COMMAND, COMMAND_PRIORITY_LOW, KEY_DOWN_COMMAND, $createParagraphNode } from 'lexical';
import React, { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

// AuthorNode - contains editable text
export class AuthorNode extends ElementNode {
  static getType() {
    return 'author';
  }

  static clone(node) {
    return new AuthorNode(node.__key);
  }

  createDOM() {
    const elmt = document.createElement('div'); // I have a bug with selection when using inline or inline-block elements... divs and flexbox seems to work.
    elmt.className = "editor-author";
    return elmt;
  }

  updateDOM() {
    return false;
  }

  static importJSON(serializedNode) {
    return $createAuthorNode();
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'author',
      version: 1,
    };
  }

  canBeEmpty() {
    return true;
  }
}

// AuthorListNode - container that only accepts AuthorNode children
export class AuthorListNode extends ElementNode {
  static getType() {
    return 'author-list';
  }

  static clone(node) {
    return new AuthorListNode(node.__key);
  }

  createDOM() {
    const elmt = document.createElement('div');
    elmt.className = "editor-author-list";
    return elmt;
  }

  updateDOM() {
    return false;
  }

  static importJSON(serializedNode) {
    return $createAuthorListNode();
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'author-list',
      version: 1,
    };
  }

  // Behaviour

  canInsertAfter(node) {
    return node.getType() === 'author';
  }

  canInsertTextBefore() {
    return false;
  }

  canInsertTextAfter() {
    return false;
  }

  insertText(text) {
    return false;
  }

  collapseAtStart() {
    this.remove();
    return true;
  }
}

function $createAuthorNode() {
  const node = new AuthorNode();
  node.append($createTextNode());
  return node;
}

export function $createAuthorListNode() {
  const node = new AuthorListNode();
  node.append($createAuthorNode());
  return node;
}

export function $isAuthorNode(node) {
  return node instanceof AuthorNode;
}

export function $isAuthorListNode(node) {
  return node instanceof AuthorListNode;
}

export function $insertAuthorList(){
  const root = $getRoot();
  const node = $createAuthorListNode();
  node.getChildAtIndex(0).selectEnd();
  let index = 0;
  const firstNode = root.getChildAtIndex(0);
  if (firstNode && firstNode.getType()==="title") index = 1;// (should be right after the title if there is one)
  root.splice(index, 0, [node]);
}

export function $appendAuthor(editor){
    const root = $getRoot();
    const authorListNode = root.getChildren().find(child => 
      child.getType() === 'author-list'
    );
    if (!authorListNode){
      // Then add one
      $insertAuthorList(editor);
    }
    else{
      if (authorListNode){
        const newnode = $createAuthorNode();
        authorListNode.append(newnode);
        const textNode = newnode.getFirstChild();
        textNode.selectEnd();
      }
    }
}

// Event handling

export function AuthorshipPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === ',' || event.key==="Tab") {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const node = selection.anchor.getNode();
          if (node.getParent().getType()==="author") {
            event.preventDefault();
            $appendAuthor();
            return true;
          }
        }
      }
      else if (event.key==="Enter"){
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const node = selection.anchor.getNode();
          if (node.getParent().getType()==="author") {
            event.preventDefault();
            const newnode = $createParagraphNode();
            newnode.select();
            node.getParent().getParent().insertAfter(newnode);// Insert after AuthorListNode
            return true;
          }
        }
      }
      return false;
    };

    const unregister = editor.registerCommand(
      KEY_DOWN_COMMAND,
      handleKeyDown,
      COMMAND_PRIORITY_LOW
    );

    return unregister;
  }, [editor]);

  return null;
}