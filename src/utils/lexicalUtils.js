import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey, $getSelection, $isNodeSelection, $isRangeSelection, $isTextNode } from 'lexical';
import { $patchStyleText } from '@lexical/selection';

// Custom hook to track active node (and its parent)
export function useActiveNode() {
  const [editor] = useLexicalComposerContext();
  const [activeNode, setActiveNode] = useState(null);
  const [activeNodeParent, setActiveNodeParent] = useState(null);
  const [activeNodeAncestorTypes,setActiveNodeAncestorTypes] = useState([]);

  useEffect(() => {
    // Update when editor changes or selection changes
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (selection) {
          const firstNode = selection.getNodes()[0];
          setActiveNode(firstNode);
          setActiveNodeParent(firstNode.getParent());
          setActiveNodeAncestorTypes(firstNode.getParents().map(parent => parent.getType()));
        }
        // If selection goes to null, we keep the last selected node as active node (but we update it anyway !)
        else if (activeNode){
          setActiveNode($getNodeByKey(activeNode.getKey()));
          setActiveNodeParent($getNodeByKey(activeNodeParent.getKey()));
          setActiveNodeAncestorTypes(activeNode.getParents().map(parent => parent.getType()));
        }
      });
    });
  }, [editor,activeNode?.getKey()]);

  return { activeNode, activeNodeParent, activeNodeAncestorTypes };
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

export function $betterPatchStyle( // Wrapper of $patchStyleText that allow other nodes to receive the style.
  selection,inlineStyle
) {
    if (!$isRangeSelection(selection)) return;

    $patchStyleText(selection,inlineStyle);

    const nodes = selection.getNodes();
    
    nodes.forEach((node) => {
      if (node.applyStyle) {
        node.applyStyle({format:{},inlineStyle});
      }
    });
}

function parseInlineStyle(styleString) {
  if (!styleString) return {};
  
  const style = {};
  styleString.split(';').forEach(rule => {
    const [property, value] = rule.split(':').map(s => s.trim());
    if (property && value) {
      style[property] = value;
    }
  });
  
  return style;
}

export function getTextNodeStyle(textNode) {
  if (!$isTextNode(textNode)) {
    return null;
  }

  const styleString = textNode.getStyle();
  
  return {
    format: {
      bold: textNode.hasFormat('bold'),
      italic: textNode.hasFormat('italic'),
      underline: textNode.hasFormat('underline'),
      strikethrough: textNode.hasFormat('strikethrough'),
      code: textNode.hasFormat('code'),
      subscript: textNode.hasFormat('subscript'),
      superscript: textNode.hasFormat('superscript'),
    },
    inlineStyle: parseInlineStyle(styleString),
  };
}

export const DEFAULT_TEXT_STYLE = {
    format: {
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      code: false,
      subscript: false,
      superscript: false,
    },
    inlineStyle: {},
  };