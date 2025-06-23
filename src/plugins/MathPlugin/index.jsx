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
} from 'lexical';
import { $createMathNode, MathNode } from '../../nodes/MathNode';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import {$wrapNodeInElement, mergeRegister} from '@lexical/utils';
import MathTree from './MathTree';

const KEYBOARD_COMMANDS_TO_IGNORE = [
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_TAB_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
];

export const INSERT_MATH_COMMAND = createCommand('INSERT_MATH_COMMAND');

export default function MathPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([MathNode])) {
      throw new Error('MathPlugin: MathNode not registered on editor');
    }

    // Override the effect of some commands when we are in a math node (here we just ignore those commands, for now the specific behaviour is handled using vanilla event listeners in MathEditor)
    const unregisterIgnoredCommands = KEYBOARD_COMMANDS_TO_IGNORE.map(command =>
      editor.registerCommand(
        command,
        () => {
          const selection = $getSelection();
          const isSomeMathNodeSelected = $isNodeSelection(selection) && $getNodeByKey(selection.getNodes()[0].getKey()).getType()==="math";
          if (isSomeMathNodeSelected) {
            return true; // Prevents the command from executing
          }
          return false; // Allows the command to continue
        },
        COMMAND_PRIORITY_HIGH
      )
    );

    const unregisterInsertCommand = editor.registerCommand(
        INSERT_MATH_COMMAND,
        (inline) => {
          const mathNode = $createMathNode(inline);
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
      );
    
      return (()=>{
        unregisterIgnoredCommands.forEach(unregister => unregister());
        unregisterInsertCommand();
      })

  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        KEY_ARROW_LEFT_COMMAND,
        (event) => {
          const selection = $getSelection();
          console.log(selection);
          if ($isNodeSelection(selection)) {
            const selectedNode = $getNodeByKey(selection.getNodes()[0].getKey());
            if (selectedNode.getType()==="math"){
              const mathTree = selectedNode.getMathTree();
              if (MathTree.isCursorAtStart(mathTree)){
                // First, remove the cursor from the math node
                selectedNode.setMathTree(MathTree.removeCursor(mathTree));
                console.log("removing cursor");
                return false;
              }
              return true; // Else, this is already taken care of
            }
          }
          return false; // Let default behavior proceed
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand(
        KEY_ARROW_RIGHT_COMMAND,
        (event) => {
          const selection = $getSelection();
          if ($isNodeSelection(selection)) {
            const selectedNode = $getNodeByKey(selection.getNodes()[0].getKey());
            if (selectedNode.getType()==="math"){
              const mathTree = selectedNode.getMathTree();
              if (MathTree.isCursorAtEnd(mathTree)){
                // First, remove the cursor from the math node
                selectedNode.setMathTree(MathTree.removeCursor(mathTree));
                //console.log("removing cursor");
                return false;
              }
              return true; // Else, this is already taken care of
            }
          }
          return false; // Let default behavior proceed
        },
        COMMAND_PRIORITY_HIGH
      ),
    );
  }, [editor]);

  return null;
}