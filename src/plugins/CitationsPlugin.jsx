import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {mergeRegister} from '@lexical/utils';
import {
  COMMAND_PRIORITY_LOW,
  PASTE_COMMAND
} from 'lexical';
import {useEffect} from 'react';
import { insertNewCitation, parseBibTeX } from '../utils/bibliographyUtils';
import { useDocumentStructureContext } from './NumberingPlugin/DocumentStructureContext';


export default function CitationsPlugin() {
  const [editor] = useLexicalComposerContext();
  const {biblio, setBiblio} = useDocumentStructureContext();

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        PASTE_COMMAND,
        (event) => {
          const text = event.clipboardData?.getData('text/plain');

          // We try to parse it as BibTex
          const parsedEntries = parseBibTeX(text);
          if (parsedEntries.length>0){
            insertNewCitation(parsedEntries,editor,biblio,setBiblio);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),

    )
  }, [editor,biblio]);

  return null;
}