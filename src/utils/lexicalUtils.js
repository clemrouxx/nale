import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection } from 'lexical';

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
          const anchorNode = selection.anchor.getNode();
          setActiveNode(anchorNode);
          setActiveNodeParent(anchorNode.getParent());
        } 
        else {
          setActiveNode(null);
          setActiveNodeParent(null);
        }
      });
    });
  }, [editor]);

  return { activeNode, activeNodeParent };
}