import {$getRoot} from 'lexical';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {convertToLatex, getLatex} from './plugins/LatexExportPlugin/latexUtils';
import { useEditorOptions, zoomFactors, zoomLevelToText } from './plugins/EditorOptionsContext';
import { useDocumentOptions } from './plugins/Options/DocumentOptionsContext';
import DropDown, { DropDownItem } from './ui/DropDown';
import { saveToTextFile, useSaveLoadContext } from './plugins/SaveLoadPlugin';
import useModal from './hooks/useModal';
import { showToast } from './ui/Toast';
import { useEffect } from 'react';
import StatusBar from './ui/StatusBar';

export const ActionBar = () => {
    return (
        <div className="span2cols actionbar hide-on-fullscreen">
            <a className="logo-main" href="https://github.com/clemrouxx/nale"></a>
            <FileButton/>
            <DisplayMenu/>
            <StatusBar/>
        </div>
    )
}

const LatexExportModal = () => {
    const {documentOptions} = useDocumentOptions();
    const [editor] = useLexicalComposerContext();

    const toClipboard = () => {
        const latex = getLatex(editor,documentOptions);
        navigator.clipboard.writeText(latex).then(()=>showToast("LaTeX successfully copied to clipboard"));
    };

    const toFile = () => {
        saveToTextFile(getLatex(editor,documentOptions),"index.tex", {description: 'LaTeX files', accept: {'text/x-tex': ['.tex']}});
    }

    return (
        <div className='dialog-buttons-list'>
            <button onClick={toClipboard}>To clipboard</button>
            <button onClick={toFile}>As a file</button>
        </div>
    )
}

const FileButton = () => {
    const { saveAs, quickSave, handleFileChange, openFile, downloadCompilationZip, compile } = useSaveLoadContext();
    const [modal, showModal] = useModal();
    const [editor] = useLexicalComposerContext();

    // shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                showModal("Export to LaTeX",(onClose)=>(<LatexExportModal/>));
            }
            else if (e.code === "F5"){
                e.preventDefault();
                compile();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [editor,compile]);

    return (
        <>
            <input
                type="file"
                onChange={handleFileChange}
                className='hidden'
                accept=".nale,application/nale"
                id="mainFileInput"
            />
            <DropDown buttonLabel={"File"}>
                <DropDownItem onClick={quickSave}><span className="text">Save</span><span className="shortcut">Ctrl + S</span></DropDownItem>
                <DropDownItem onClick={saveAs}><span className="text">Save As...</span><span className="shortcut">Ctrl + Shift + S</span></DropDownItem>
                <DropDownItem onClick={openFile}><span className="text">Open...</span><span className="shortcut">Ctrl + O</span></DropDownItem>
                <DropDownItem onClick={()=>showModal("Export to LaTeX",(onClose)=>(<LatexExportModal/>))}><span>Export to LaTeX</span><span className="shortcut">Ctrl + E</span></DropDownItem>
                <DropDownItem onClick={compile}><span className="text">Compile</span><span className="shortcut">F5</span></DropDownItem>
            </DropDown>
            {modal}
        </>
    );
}

const DisplayMenu = () => {
    const {editorOptions,setDisplayOption} = useEditorOptions();
    const zoomIn = () => {
        if (editorOptions.zoomLevel<zoomFactors.length-1) setDisplayOption("zoomLevel",editorOptions.zoomLevel+1);
    }
    const zoomOut = () => {
        if (editorOptions.zoomLevel>=1) setDisplayOption("zoomLevel",editorOptions.zoomLevel-1);
    }

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === "F11"){
                e.preventDefault();
                setDisplayOption("fullscreen",!editorOptions.fullscreen);
            }
            else if(e.key==="Escape" && editorOptions.fullscreen){
                e.preventDefault();
                setDisplayOption("fullscreen",false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [editorOptions]);

    return (
        <DropDown buttonLabel={"Display"} stopCloseOnClickSelf={true}>
            <div>
                <span>Zoom</span>
                <button onClick={zoomOut}>-</button>
                <span>{zoomLevelToText(editorOptions.zoomLevel)}</span>
                <button onClick={zoomIn}>+</button>
            </div>
            <div>
                <label>
                    <input
                    type="checkbox"
                    checked={editorOptions.emulateLayout}
                    onChange={(e)=>{setDisplayOption("emulateLayout",e.target.checked)}}
                    />
                    Emulate layout
                </label>
            </div>
            <div>
                <label>
                    <input
                    type="checkbox"
                    checked={editorOptions.darkEditor}
                    onChange={(e)=>{setDisplayOption("darkEditor",e.target.checked)}}
                    />
                    Editor dark mode
                </label>
            </div>
             <div>
                <label>
                    <input
                    type="checkbox"
                    checked={editorOptions.fullscreen}
                    onChange={(e)=>{setDisplayOption("fullscreen",e.target.checked)}}
                    />
                    Full screen editor
                </label>
            </div>
        </DropDown>
    )
}