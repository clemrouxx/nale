import { ElementNode, $createTextNode, $getRoot, $getSelection, $isRangeSelection, COMMAND_PRIORITY_LOW, KEY_DOWN_COMMAND, $createParagraphNode } from 'lexical';
import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { showToast } from "../ui/Toast";

// AffiliationNode - contains editable text
export class AffiliationNode extends ElementNode {
  static getType() {
    return 'affiliation';
  }

  static clone(node) {
    return new AffiliationNode(node.__key);
  }

  createDOM() {
    const elmt = document.createElement('div');
    elmt.className = "editor-affiliation";
    elmt.setAttribute("data-symbol",String(this.getIndexWithinParent()+1));
    return elmt;
  }

  updateDOM() {
    return false;
  }

  static importJSON(serializedNode) {
    return $createAffiliationNode();
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'affiliation',
      version: 1,
    };
  }

  canBeEmpty() {
    return true;
  }
}

// AffiliationListNode - container that only accepts AffiliationNode children
export class AffiliationListNode extends ElementNode {
  static getType() {
    return 'affiliation-list';
  }

  static clone(node) {
    return new AffiliationListNode(node.__key);
  }

  createDOM() {
    const elmt = document.createElement('div');
    elmt.className = "editor-affiliation-list";
    return elmt;
  }

  updateDOM() {
    return false;
  }

  static importJSON(serializedNode) {
    return new AffiliationListNode();
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'affiliation-list',
      version: 1,
    };
  }

  // Behaviour

  canInsertAfter(node) {
    return node.getType() === 'affiliation';
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

function $createAffiliationNode() {
  const node = new AffiliationNode();
  node.append($createTextNode());
  return node;
}

export function $createAffiliationListNode() {
  const node = new AffiliationListNode();
  node.append($createAffiliationNode());
  return node;
}

function $insertAffiliationList(){
  const root = $getRoot();
  const node = $createAffiliationListNode();
  node.getChildAtIndex(0).selectEnd();
  const index = root.getChildren().findIndex(child => child.getType()==="author-list");
  if (index === -1){
    showToast("Cannot add affiliation. Add author(s) first.",2000,"warning");
    return false;
  }
  root.splice(index+1, 0, [node]);
  return true; // Success
}

export function $appendAffiliation(editor){
    const root = $getRoot();
    const affiliationListNode = root.getChildren().find(child => 
      child.getType() === 'affiliation-list'
    );
    if (!affiliationListNode){
      // Then add one
      $insertAffiliationList(editor);
    }
    else{
      if (affiliationListNode){
        const newnode = $createAffiliationNode();
        affiliationListNode.append(newnode);
        const textNode = newnode.getFirstChild();
        textNode.selectEnd();
      }
    }
}

// Event handling

export function AffiliationsPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key==="Tab") {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const node = selection.anchor.getNode();
          if (node.getParent().getType()==="affiliation") {
            event.preventDefault();
            $appendAffiliation();
            return true;
          }
        }
      }
      else if (event.key==="Enter"){
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const node = selection.anchor.getNode();
          if (node.getParent() && node.getParent().getType()==="affiliation") {
            event.preventDefault();
            const newnode = $createParagraphNode();
            newnode.select();
            node.getParent().getParent().insertAfter(newnode);// Insert new paragraph after AffiliationListNode
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