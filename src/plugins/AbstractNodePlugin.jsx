
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  KEY_ENTER_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND
} from 'lexical';
import { useEffect } from 'react';
import {mergeRegister} from '@lexical/utils';

export function AbstractNodePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
        editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      (event) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;

        const anchorNode = selection.anchor.getNode();
        let abstractNode = null;

        // Find the AbstractNode ancestor
        let currentNode = anchorNode;
        while (currentNode) {
          if (currentNode.getType()==="abstract") {
            abstractNode = currentNode;
            break;
          }
          currentNode = currentNode.getParent();
        }

        if (abstractNode) {
          const children = abstractNode.getChildren();
          
          // Check if AbstractNode has only one empty paragraph
          if (children.length === 1 && 
              children[0].getType() === 'paragraph' &&
              children[0].getTextContent().trim() === '' &&
              selection.anchor.offset === 0) {
            
            // Create new paragraph to replace the AbstractNode
            const newParagraph = $createParagraphNode();
            abstractNode.insertAfter(newParagraph);
            abstractNode.remove();
            newParagraph.select();
            
            return true; // Prevent default behavior
          }
        }

        return false;
      },
      COMMAND_PRIORITY_LOW
    ),

    editor.registerCommand(
    KEY_ENTER_COMMAND,
    (event) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;

        const anchorNode = selection.anchor.getNode();
        let abstractNode = null;

        // Find the AbstractNode ancestor
        let currentNode = anchorNode;
        while (currentNode) {
        if (currentNode.getType()==="abstract") {
            abstractNode = currentNode;
            break;
        }
        currentNode = currentNode.getParent();
        }

        if (abstractNode) {
        // Check if we're at the end of an empty paragraph
        const currentParagraph = anchorNode.getType() === 'paragraph' 
            ? anchorNode 
            : anchorNode.getParent();
        
        if (currentParagraph && 
            currentParagraph.getType() === 'paragraph' &&
            currentParagraph.getTextContent().trim() === '' &&
            abstractNode.isCursorAtEnd()) {
            
            // Remove the empty paragraph
            currentParagraph.remove();
            
            // Create new paragraph after the AbstractNode
            const newParagraph = $createParagraphNode();
            abstractNode.insertAfter(newParagraph);
            newParagraph.select();
            
            return true; // Prevent default behavior
        }
        }

        return false;
    },
    COMMAND_PRIORITY_LOW
    )

  );
    
    
  }, [editor]);

  return null;
}