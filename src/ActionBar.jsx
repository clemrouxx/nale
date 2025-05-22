import {$getRoot} from 'lexical';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {convertToLatex} from './plugins/LatexExportPlugin/latexUtils';
import { useEffect, useState } from 'react';
import { setGlobalCSSRule } from './utils/generalUtils';

const zoomFactors = [
  0.25,
  0.33,
  0.5,
  0.67,
  0.75,
  0.8,
  0.9,
  1,
  1.1,
  1.25,
  1.5,
  1.75,
  2,
  2.5,
  3,
  4,
  5
];


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
    const [zoomLevel,setZoomLevel] = useState(9);

    useEffect(()=>{
        setGlobalCSSRule(".editor-base","--editor-scale",zoomFactors[zoomLevel]);
    },[zoomLevel]);

    const zoomIn = () => {
        if (zoomLevel<zoomFactors.length-1) setZoomLevel(zoomLevel+1);
    }

    const zoomOut = () => {
        if (zoomLevel>=1) setZoomLevel(zoomLevel-1);
    }

    return (<>
        
        <button onClick={zoomIn}>Zoom +</button>
        <button onClick={zoomOut}>Zoom -</button>
        {`${Math.round(100*zoomFactors[zoomLevel])} %`}
    </>)
}