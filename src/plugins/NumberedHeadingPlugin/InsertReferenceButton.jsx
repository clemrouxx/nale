import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import DropDown, { DropDownItem } from '../../ui/DropDown';
import { insertReferenceNode } from '../../nodes/ReferenceNode';
import { useDocumentStructureContext } from './DocumentStructureContext';
import { useState } from 'react';

export function InsertReferenceButton() {
  const [editor] = useLexicalComposerContext();
  const {numberedHeadings} = useDocumentStructureContext();
  const [isDropdownOpen,setIsDropdownOpen] = useState();
  
  return (
    <div>
    <button onClick={()=>setIsDropdownOpen(!isDropdownOpen)} className="toolbar-item"><span className="text">Internal reference</span></button>
    {isDropdownOpen && 
    (
      <div className="dropdown">
        <DropDown disabled={Object.keys(numberedHeadings).length===0} buttonLabel={"Section..."} position='right' buttonClassName="toolbar-item">
        {numberedHeadings.map((info) => (
            <DropDownItem key={info.key} onClick={() => insertReferenceNode(editor,info.key)} className={"item"}>
              {info.numberingString} - {info.textContent}
            </DropDownItem>
          ))}
        </DropDown>
      </div>
    )}
    </div>
  );
}