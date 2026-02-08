import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {mergeRegister} from '@lexical/utils';
import {
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  createCommand,
  DELETE_CHARACTER_COMMAND,
  DELETE_LINE_COMMAND,
} from 'lexical';
import {useEffect} from 'react';

import { $createTableFloatNode } from '../nodes/TableFloatNode';
import { useDocumentStructureContext } from './NumberingPlugin/DocumentStructureContext';
import { useDocumentOptions } from './Options/DocumentOptionsContext';
import { $isTableCellNode } from '@lexical/table';

export const INSERT_TABLE_FLOAT_COMMAND = createCommand('INSERT_TABLE_FLOAT_COMMAND');

export default function TablesPlusPlugin() {
  const [editor] = useLexicalComposerContext();
  const {nextLabelNumber,setNextLabelNumber} = useDocumentStructureContext();
  const {documentOptions} = useDocumentOptions();

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        INSERT_TABLE_FLOAT_COMMAND, // Essentially same as for INSERT_FIGURE_COMMAND
        () => {
            const tableFloatNode = $createTableFloatNode(nextLabelNumber,documentOptions);
            setNextLabelNumber(nextLabelNumber+1);
            $insertNodes([tableFloatNode]);
            return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(DELETE_CHARACTER_COMMAND,
        () => {
          const selection = $getSelection();
          
          if (!$isRangeSelection(selection)) {
            return false;
          }

          const nodes = selection.getNodes();
          const tableCellNode = nodes.find(node => 
            $isTableCellNode(node) || $isTableCellNode(node.getParent())
          );

          if (tableCellNode) { // At least one is a cell
            // Instead of deleting the cell, just clear its content

            for (let i = 0; i < nodes.length; i++) {
              const node = nodes[i];
              const cell = $isTableCellNode(node) 
              ? node 
              : node.getParent();
              if ($isTableCellNode(cell)) cell.clear();
            }
            
            return true;
          }

          return false; // Let default behavior handle non-table cases
        },
        COMMAND_PRIORITY_HIGH
      ),

      // Also handle DELETE_LINE_COMMAND
      editor.registerCommand(DELETE_LINE_COMMAND,
        () => {
          // Same logic as above
          const selection = $getSelection();
          
          if (!$isRangeSelection(selection)) {
            return false;
          }

          const nodes = selection.getNodes();
          const tableCellNode = nodes.find(node => 
            $isTableCellNode(node) || $isTableCellNode(node.getParent())
          );

          if (tableCellNode) {
            const cell = $isTableCellNode(tableCellNode) 
              ? tableCellNode 
              : tableCellNode.getParent();
            
            if ($isTableCellNode(cell)) {
              cell.clear();
              return true;
            }
          }

          return false;
        },
        COMMAND_PRIORITY_HIGH
      )
    )
  }, [editor]);

  return null;
}