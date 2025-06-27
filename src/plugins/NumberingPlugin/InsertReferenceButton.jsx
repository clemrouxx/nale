import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import DropDown, { DropDownItem } from '../../ui/DropDown';
import { insertReferenceNode } from '../../nodes/ReferenceNode';
import { useDocumentStructureContext } from './DocumentStructureContext';
import { useEffect, useRef, useState } from 'react';
import { truncate } from '../../utils/generalUtils';
import { MathJax } from 'better-react-mathjax';

export function InsertReferenceButton() {
  const [editor] = useLexicalComposerContext();
  const {numberedHeadings,figures,numberedEquations} = useDocumentStructureContext();
  const [isDropdownOpen,setIsDropdownOpen] = useState();
  const dropdownRef = useRef(null);

  const close = () => setIsDropdownOpen(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div ref={dropdownRef}>
    <button onClick={()=>setIsDropdownOpen(!isDropdownOpen)} className="toolbar-item"><i className="icon insert-reference"/><span className="text">Internal reference</span></button>
    {isDropdownOpen && 
    (
      <div className='dropdown'>
        <div className="item">
          <DropDown disabled={Object.keys(numberedHeadings).length===0} onClose={close} buttonLabel={"Section..."} position='right' buttonClassName={"toolbar-item nopadding"}>
          {numberedHeadings.map((info) => (
              <DropDownItem key={info.label} onClick={() => insertReferenceNode(editor,info.label)} className={"item"}>
                {info.numberingString} - {info.textContent}
              </DropDownItem>
            ))}
          </DropDown>
        </div>

        <div className="item">
          <DropDown disabled={Object.keys(figures).length===0} onClose={close} buttonLabel={"Figure..."} position='right' buttonClassName={"toolbar-item nopadding"}>
          {figures.map((info) => (
              <DropDownItem key={info.label} onClick={() => insertReferenceNode(editor,info.label)} className={"item"}>
                Fig. {info.numberingString} : {truncate(info.textContent,30)}
              </DropDownItem>
            ))}
          </DropDown>
        </div>

        <div className="item">
          <DropDown disabled={Object.keys(numberedEquations).length===0} onClose={close} buttonLabel={"Equation..."} position='right' buttonClassName={"toolbar-item nopadding"}>
          {numberedEquations.map((info) => (
              <DropDownItem key={info.label} onClick={() => insertReferenceNode(editor,info.label)} className={"item"}>
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