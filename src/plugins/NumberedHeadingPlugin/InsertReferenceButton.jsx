import React, { useState, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {AutoNumberer} from './AutoNumberer';
import DropDown, { DropDownItem } from '../../ui/DropDown';
import { insertReferenceNode } from '../../nodes/ReferenceNode';

export function InsertReferenceButton() {
  const [editor] = useLexicalComposerContext();
  const [showHeadingsModal, setShowHeadingsModal] = useState(false);
  const [headingsInfo,setHeadingsInfo] = useState({});
  
  return (
    <>
      <AutoNumberer headingsInfo={headingsInfo} setHeadingsInfo={setHeadingsInfo}/>
      
      <DropDown disabled={Object.keys(headingsInfo).length===0} buttonLabel={"Reference"}>
        {Object.entries(headingsInfo).map(([key, info]) => (
            <DropDownItem key={key} onClick={() => insertReferenceNode(editor,key)}>
              {info.numberingString} - {info.textContent}
            </DropDownItem>
          ))}
      </DropDown>
    </>
  );
}