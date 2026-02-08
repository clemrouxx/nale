import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import DropDown, { DropDownItem } from '../../ui/DropDown';
import { insertReferenceNode } from '../../nodes/ReferenceNode';
import { useDocumentStructureContext } from './DocumentStructureContext';
import { useEffect, useRef, useState } from 'react';
import { truncate } from '../../utils/generalUtils';
import { MathJax } from 'better-react-mathjax';

export function InsertReferenceButton() {
  const [editor] = useLexicalComposerContext();
  const {numberedHeadings,figures,numberedEquations,tables} = useDocumentStructureContext();
  const [isDropdownOpen,setIsDropdownOpen] = useState();
  const dropdownRef = useRef(null);

  const close = () => setIsDropdownOpen(false);

  return (
    <div ref={dropdownRef}>
    <button onClick={()=>setIsDropdownOpen(!isDropdownOpen)} className="toolbar-item"><i className="icon insert-reference"/><span className="text">Internal reference</span></button>
    {isDropdownOpen && 
    (
      <div className='dropdown primary-dropdown'>
        <div className="item">
          <DropDown disabled={Object.keys(numberedHeadings).length===0} onClose={close} buttonLabel={"Section..."} position='right' buttonClassName={""}>
          {numberedHeadings.map((info) => (
              <DropDownItem key={info.label} onClick={() => insertReferenceNode(editor,info.label)}>
                {info.numberingString} - {info.textContent}
              </DropDownItem>
            ))}
          </DropDown>
        </div>

        <div className="item">
          <DropDown disabled={Object.keys(figures).length===0} onClose={close} buttonLabel={"Figure..."} position='right' buttonClassName={""}>
          {figures.map((info) => (
              <DropDownItem key={info.label} onClick={() => insertReferenceNode(editor,info.label)}>
                Fig. {info.numberingString} : {truncate(info.textContent,30)}
              </DropDownItem>
            ))}
          </DropDown>
        </div>

        <div className="item">
          <DropDown disabled={Object.keys(tables).length===0} onClose={close} buttonLabel={"Table..."} position='right' buttonClassName={""}>
          {tables.map((info) => (
              <DropDownItem key={info.label} onClick={() => insertReferenceNode(editor,info.label)}>
                Table {info.numberingString} : {truncate(info.textContent,30)}
              </DropDownItem>
            ))}
          </DropDown>
        </div>

        <div className="item">
          <DropDown disabled={Object.keys(numberedEquations).length===0} onClose={close} buttonLabel={"Equation..."} position='right' buttonClassName={""}>
          {numberedEquations.map((info) => (
              <DropDownItem key={info.label} onClick={() => insertReferenceNode(editor,info.label)}>
                {`(${info.numberingString}) `} <MathJax inline={true}>{`$ ${info.formula} $`}</MathJax>
              </DropDownItem>
            ))}
          </DropDown>
        </div>
      </div>
    )}
    </div>
  );
}