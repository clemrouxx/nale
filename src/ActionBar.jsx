import {$getRoot} from 'lexical';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {convertToLatex} from './plugins/LatexExportPlugin/latexUtils';
import { useEffect, useState } from 'react';
import { setGlobalCSSRule } from './utils/generalUtils';
import { useDisplayOptions } from './plugins/DisplayOptionsContext';
import { useDocumentOptions, zoomFactors } from './plugins/Options/DocumentOptionsContext';

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

    return (<>
            <button onClick={readEditorState}>Export</button>
        </>
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

    return (<>
        <button onClick={zoomIn}>Zoom +</button>
        <button onClick={zoomOut}>Zoom -</button>
        {`${Math.round(100*zoomFactors[displayOptions.zoomLevel])} %`}
    </>)
}