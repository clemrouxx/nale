import {
  $createNodeSelection,
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $insertNodes,
  $isNodeSelection,
  $isRootOrShadowRoot,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  createCommand,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_TAB_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_DOWN_COMMAND,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
  DELETE_CHARACTER_COMMAND,
  $createRangeSelection
} from 'lexical';
import { $createMathNode, MathNode } from '../../nodes/MathNode';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useState } from 'react';
import {$wrapNodeInElement, mergeRegister} from '@lexical/utils';
import MathTree from './MathTree';
import { useDocumentStructureContext } from '../NumberingPlugin/DocumentStructureContext';

const COMMANDS_TO_IGNORE = [ // These commands are just completely ignored when in the math node, but some have their events handled with classical event handlers in MathEditor.
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_TAB_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_ENTER_COMMAND,
];

export const INSERT_MATH_COMMAND = createCommand('INSERT_MATH_COMMAND');

const $getCurrentMathNode = () => {
  const selection = $getSelection();
  if ($isNodeSelection(selection)){
    const selectedNode = $getNodeByKey(selection.getNodes()[0].getKey());
    if (selectedNode.getType()==="math") return selectedNode; 
  }
  return null;
}

function useSuppressMathJaxErrors() { // Suppress an error that seems to be due to timings, without obvious real impacts on user experience.
 useEffect(() => {
   const originalError = console.error;
   console.error = (...args) => {
     if (!args[0]?.includes?.('Typesetting failed: Cannot read properties of null')) originalError(...args);
   };
   
   const handleRejection = (e) => {
     if (e.reason?.message?.includes('Typesetting failed: Cannot read properties of null')) e.preventDefault();
   };
   window.addEventListener('unhandledrejection', handleRejection);

   return () => {
     console.error = originalError;
     window.removeEventListener('unhandledrejection', handleRejection);
   };
 }, []);
}

export default function MathPlugin() {
  const [editor] = useLexicalComposerContext();
  const [lastSelectionKey,setLastSelectionKey] = useState(null);
  const {nextLabelNumber,setNextLabelNumber} = useDocumentStructureContext();

  useSuppressMathJaxErrors();

  useEffect(() => {
    if (!editor.hasNodes([MathNode])) {
      throw new Error('MathPlugin: MathNode not registered on editor');
    }

    // Override the effect of some commands when we are in a math node (here we just ignore those commands, for now the specific behaviour is handled using vanilla event listeners in MathEditor)
    const unregisterCommands = COMMANDS_TO_IGNORE.map(command =>
      editor.registerCommand(
        command,
        () => {
          if ($getCurrentMathNode()) {
            return true; // Prevents the command from executing
          }
          return false; // Allows the command to continue
        },
        COMMAND_PRIORITY_HIGH
      )
    );

    unregisterCommands.push(
      editor.registerCommand(
        INSERT_MATH_COMMAND,
        (inline) => {

          const currentMathNode = $getCurrentMathNode()
          // Check if we are already in a math node. In which case, we exit it.
          if (currentMathNode){
            const newSelection = $createRangeSelection();
            newSelection.anchor.set(currentMathNode.getParent().getKey(), currentMathNode.getIndexWithinParent() + 1, 'element');
            newSelection.focus.set(currentMathNode.getParent().getKey(), currentMathNode.getIndexWithinParent() + 1, 'element');
            $setSelection(newSelection);
            return true;
          }

          const mathNode = $createMathNode(inline,nextLabelNumber);
          setNextLabelNumber(nextLabelNumber+1);

          $insertNodes([mathNode]);
          if (inline && $isRootOrShadowRoot(mathNode.getParentOrThrow())) {
            $wrapNodeInElement(mathNode, $createParagraphNode).selectEnd();
          }

          // Also, select the node
          $setSelection(null);
          const nodeSelection = $createNodeSelection();
          nodeSelection.add(mathNode.getKey());
          $setSelection(nodeSelection);
          
          const rootElement = editor.getRootElement();
          if (rootElement && document.activeElement !== rootElement) {
            rootElement.focus({ preventScroll: true }); // Seems like I lose focus otherwise for some reason
          }

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        KEY_ARROW_LEFT_COMMAND,
        (event) => {
          const selectedNode = $getCurrentMathNode();
          if (selectedNode){
            const mathTree = selectedNode.getMathTree();
            if (MathTree.isCursorAtStart(mathTree)){
              selectedNode.setMathTree(MathTree.removeCursor(mathTree));
              return false;
            }
            return true; // Else, this is already taken care of
          }
          return false; // Let default behavior proceed
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand(
        KEY_ARROW_RIGHT_COMMAND,
        (e) => {
          const selectedNode = $getCurrentMathNode();
          if (selectedNode){
            const mathTree = selectedNode.getMathTree();
            if (MathTree.isCursorAtEnd(mathTree)){
              selectedNode.setMathTree(MathTree.removeCursor(mathTree));
              return false;
            }
            return true; // Else, this is already taken care of
          }
          return false; // Let default behavior proceed
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand(
        KEY_DOWN_COMMAND,
        (event) => {
          if ((event.ctrlKey || event.metaKey) && (event.key === 'm'||event.key==="M")) {
            event.preventDefault();
            editor.dispatchCommand(INSERT_MATH_COMMAND,!(event.shiftKey));
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        (event) => {
          const selectedNode = $getCurrentMathNode();
          if (selectedNode){
            const mathTree = selectedNode.getMathTree();
            if (MathTree.isOnlyCursor(mathTree)){
              return false; // Let default behavior proceed (remove math node)
            }
            return true; // Handled in the math node
          }
          return false; 
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        (event) => {
          const selectedNode = $getCurrentMathNode();
          if (selectedNode){
            const mathTree = selectedNode.getMathTree();
            if (MathTree.isOnlyCursor(mathTree)){
              return false; // Let default behavior proceed (remove math node)
            }
            return true; // Handled in the math node
          }
          return false; 
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
            const selection = $getSelection();
            if ($isNodeSelection(selection)) {
                const selectedMathNode = $getCurrentMathNode();
                if (selectedMathNode && (lastSelectionKey !== selectedMathNode.getKey())) { // Entering the math node
                  //console.log("cursor enter");
                  const previousSibling = $getNodeByKey(selectedMathNode.getKey()).getPreviousSibling();
                  const previousSiblingKey = previousSibling ? previousSibling.getKey() : null;
                  const mathTree = selectedMathNode.getMathTree();
                  if (previousSiblingKey === lastSelectionKey){
                      selectedMathNode.setMathTree(MathTree.appendCursor(mathTree,true));
                  }
                  else{
                      selectedMathNode.setMathTree(MathTree.appendCursor(mathTree,false));
                  }
                }
                setLastSelectionKey(selection.getNodes()[0].getKey());
            }
            else if ($isRangeSelection(selection)){
                setLastSelectionKey(selection.anchor.getNode().getKey());
            }
            return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        DELETE_CHARACTER_COMMAND,
        (isBackward) => {
          const selection = $getSelection();
          
          if ((!$isRangeSelection(selection)) || (!selection.isCollapsed())) {
            return false;
          }
          
          const anchorNode = selection.anchor.getNode();
          const anchorOffset = selection.anchor.offset;
          const anchorType = selection.anchor.type;

          let nodeGettingDeleted = null;
          if (anchorType==="text" && anchorOffset===(isBackward?0:anchorNode.getTextContentSize())){// anchorOffset === 0 means there is no more character to delete on the left
            nodeGettingDeleted = isBackward ? anchorNode.getPreviousSibling() : anchorNode.getNextSibling();
          }
          else if (anchorType==="element"){
            nodeGettingDeleted = anchorNode.getChildAtIndex(anchorOffset + (isBackward?-1:0));
          }

          if (nodeGettingDeleted && nodeGettingDeleted.getType() === 'math') {
            // Enter the math node (select it)
            $setSelection(null);
            const nodeSelection = $createNodeSelection();
            nodeSelection.add(nodeGettingDeleted.getKey());
            $setSelection(nodeSelection);
            return true; // Prevent deletion
          }
          
          return false; // Let other handlers process
        },
        COMMAND_PRIORITY_LOW
      ),
    );
    
    return (()=>{
      unregisterCommands.forEach(unregister => unregister());
    })

  }, [editor,lastSelectionKey,nextLabelNumber]);

  return null;
}