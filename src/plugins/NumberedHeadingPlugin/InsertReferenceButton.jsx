import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import DropDown, { DropDownItem } from '../../ui/DropDown';
import { insertReferenceNode } from '../../nodes/ReferenceNode';
import { useDocumentStructureContext } from './DocumentStructureContext';

export function InsertReferenceButton() {
  const [editor] = useLexicalComposerContext();
  const {numberedHeadings} = useDocumentStructureContext();
  
  return (
    <DropDown disabled={Object.keys(numberedHeadings).length===0} buttonLabel={"Insert reference"} buttonClassName={"toolbar-item"}>
      {numberedHeadings.map((info) => (
          <DropDownItem key={info.key} onClick={() => insertReferenceNode(editor,info.key)} className={"item"}>
            {info.numberingString} - {info.textContent}
          </DropDownItem>
        ))}
    </DropDown>
  );
}