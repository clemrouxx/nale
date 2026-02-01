import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {mergeRegister} from '@lexical/utils';
import {
  $insertNodes,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
} from 'lexical';
import {useEffect} from 'react';

import { $createTableFloatNode } from '../nodes/TableFloatNode';
import { useDocumentStructureContext } from './NumberingPlugin/DocumentStructureContext';
import { useDocumentOptions } from './Options/DocumentOptionsContext';

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
    )
  }, [editor]);

  return null;
}