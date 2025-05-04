import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import DropDown, { DropDownItem } from '../../ui/DropDown';
import { insertReferenceNode } from '../../nodes/ReferenceNode';
import { useDocumentStructureContext } from './DocumentStructureContext';
import { useState } from 'react';
import { truncate } from '../../utils/generalUtils';

export function InsertReferenceButton() {
  const [editor] = useLexicalComposerContext();
  const {numberedHeadings,figures} = useDocumentStructureContext();
  const [isDropdownOpen,setIsDropdownOpen] = useState();

  const close = () => setIsDropdownOpen(false);
  
  return (
    <div>
    <button onClick={()=>setIsDropdownOpen(!isDropdownOpen)} className="toolbar-item"><span className="text">Internal reference</span></button>
    {isDropdownOpen && 
    (
      <div className='dropdown'>
        <div className="item">
          <DropDown disabled={Object.keys(numberedHeadings).length===0} onClose={close} buttonLabel={"Section..."} position='right' buttonClassName={"toolbar-item nopadding"}>
          {numberedHeadings.map((info) => (
              <DropDownItem key={info.key} onClick={() => insertReferenceNode(editor,info.key)} className={"item"}>
                {info.numberingString} - {info.textContent}
              </DropDownItem>
            ))}
          </DropDown>
        </div>

        <div className="item">
        <DropDown disabled={Object.keys(figures).length===0} onClose={close} buttonLabel={"Figure..."} position='right' buttonClassName={"toolbar-item nopadding"}>
        {figures.map((info) => (
            <DropDownItem key={info.key} onClick={() => insertReferenceNode(editor,info.key)} className={"item"}>
              Fig. {info.numberingString} : {truncate(info.textContent,30)}
            </DropDownItem>
          ))}
        </DropDown>
        </div>
      </div>
    )}
    </div>
  );
}