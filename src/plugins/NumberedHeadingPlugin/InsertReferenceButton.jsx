import React, { useState, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {AutoNumberer} from './AutoNumberer';
import DropDown, { DropDownItem } from '../../ui/DropDown';
import { insertReferenceNode } from '../../nodes/ReferenceNode';

export function InsertReferenceButton() {
  const [editor] = useLexicalComposerContext();
  const [showHeadingsModal, setShowHeadingsModal] = useState(false);
  const [headings,setHeadings] = useState([]);
  
  return (
    <>
      <AutoNumberer headings={headings} setHeadings={setHeadings}/>
      
      <DropDown disabled={Object.keys(headings).length===0} buttonLabel={"Insert reference"} buttonClassName={"toolbar-item"}>
        {headings.map((info) => (
            <DropDownItem key={info.key} onClick={() => insertReferenceNode(editor,info.key)} className={"item"}>
              {info.numberingString} - {info.textContent}
            </DropDownItem>
          ))}
      </DropDown>
    </>
  );
}