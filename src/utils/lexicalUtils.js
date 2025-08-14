import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isNodeSelection, $isRangeSelection } from 'lexical';

// Custom hook to track active node (and its parent)
export function useActiveNode() {
  const [editor] = useLexicalComposerContext();
  const [activeNode, setActiveNode] = useState(null);
  const [activeNodeParent, setActiveNodeParent] = useState(null);

  useEffect(() => {
    // Update when editor changes or selection changes
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (selection) {
          const firstNode = selection.getNodes()[0];
          setActiveNode(firstNode);
          setActiveNodeParent(firstNode.getParent());
        }
        // If selection goes to null, we keep the last selected node as active node
      });
    });
  }, [editor]);

  return { activeNode, activeNodeParent };
}

export function $findSelectedOrBeforeCursor(nodeType){
  // Look in selected nodes, or if we are in a text with a range selection, look at the node just before the cursor to see if its type matches. Returns the node if it finds it.
  const selection = $getSelection();

  if ($isNodeSelection(selection)){
    return selection.getNodes().find(node => node.getType()===nodeType) || null;
  }
  
  if ($isRangeSelection(selection) && selection.isCollapsed()){
    const selectedNodes = selection.getNodes();
    if (selectedNodes.length === 1){
      if (selectedNodes[0].getType()===nodeType) return selectedNodes[0];
    }
    const anchorNode = selection.anchor.getNode();
    const offset = selection.anchor.offset;
    if (offset !== 0) return null; // Or maybe check if we are already in the node we want ?
    const parentNode = anchorNode.getParent();
    const children = parentNode.getChildren();
    const anchorIndex = children.findIndex(child => child.getKey() === anchorNode.getKey());

    if (anchorIndex > 0) {
      const previousSibling = children[anchorIndex - 1];
      
      // Check if the previous child is a decorator node
      if (previousSibling && previousSibling.getType()===nodeType){
        return previousSibling
      };
    }
  }
  
  return null;
}