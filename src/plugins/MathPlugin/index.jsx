import {
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $insertNodes,
  $isNodeSelection,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  createCommand,
  DELETE_CHARACTER_COMMAND,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_RIGHT_COMMAND
} from 'lexical';
import { $createMathNode, MathNode } from '../../nodes/MathNode';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import {$wrapNodeInElement} from '@lexical/utils';
import MathTree from './MathTree';

export const INSERT_MATH_COMMAND = createCommand('INSERT_MATH_COMMAND');

export default function MathPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([MathNode])) {
      throw new Error('MathPlugin: MathNode not registered on editor');
    }

    return editor.registerCommand(
        INSERT_MATH_COMMAND,
        (inline) => {
          const mathNode = $createMathNode(inline);
          $insertNodes([mathNode]);
          if (inline && $isRootOrShadowRoot(mathNode.getParentOrThrow())) {
            $wrapNodeInElement(mathNode, $createParagraphNode).selectEnd();
          }
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      );

  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      KEY_ARROW_LEFT_COMMAND,
      (event) => {
        const selection = $getSelection();
        if ($isNodeSelection(selection)) {
          const selectedNode = $getNodeByKey(selection.getNodes()[0].getKey());
          if (selectedNode.getType()==="math"){
            const mathTree = selectedNode.getMathTree();
            if (MathTree.isCursorAtStart(mathTree)){
              // First, remove the cursor from the math node
              selectedNode.setMathTree(MathTree.removeCursor(mathTree));
              console.log("removing cursor");
              return false; // Continue moving left of the math node
            }
            return true; // Else, this is already taken care of
          }
        }
        return false; // Let default behavior proceed
      },
      COMMAND_PRIORITY_HIGH
    );
  }, [editor]);

  return null;
}