import {$getRoot} from 'lexical';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {convertToLatex} from './plugins/LatexExportPlugin/latexUtils';
import { useEffect, useState } from 'react';
import { setGlobalCSSRule } from './utils/generalUtils';
import { useDisplayOptions, zoomFactors } from './plugins/DisplayOptionsContext';
import { useDocumentOptions } from './plugins/Options/DocumentOptionsContext';
import DropDown, { DropDownItem } from './ui/DropDown';

export const ActionBar = () => {
    return (
        <div className="span2cols actionbar">
            <h1 className='inline'>NaLE</h1>
            <ExportButton/>
            <DisplayMenu/>
        </div>
    )
}

const ExportButton = () => {
    const [editor] = useLexicalComposerContext();

    const readEditorState = () => {
        editor.getEditorState().read(() => {
            const root = $getRoot();
            const latex = convertToLatex(root);
            console.log(latex);
        });
    };

    return (
        <DropDown buttonLabel={"Export"}>
            <DropDownItem onClick={readEditorState}>LaTeX</DropDownItem>
        </DropDown>
    );
}

const DisplayMenu = () => {
    const {displayOptions,setDisplayOption} = useDisplayOptions();
    const zoomIn = () => {
        if (displayOptions.zoomLevel<zoomFactors.length-1) setDisplayOption("zoomLevel",displayOptions.zoomLevel+1);
    }
    const zoomOut = () => {
        if (displayOptions.zoomLevel>=1) setDisplayOption("zoomLevel",displayOptions.zoomLevel-1);
    }
    return (
        <DropDown buttonLabel={"Display"} stopCloseOnClickSelf={true}>
            <div>
                <span>Zoom</span>
                <button onClick={zoomOut}>-</button>
                <span>{`${Math.round(100*zoomFactors[displayOptions.zoomLevel])} %`}</span>
                <button onClick={zoomIn}>+</button>
            </div>
            <div>
                <label>
                    <input
                    type="checkbox"
                    checked={displayOptions.realPageWidth}
                    onChange={(e)=>{setDisplayOption("realPageWidth",e.target.checked)}}
                    />
                    Real page width
                </label>
            </div>
        </DropDown>
    )
}