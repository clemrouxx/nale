import {$getRoot} from 'lexical';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {convertToLatex} from './plugins/LatexExportPlugin/latexUtils';
import { useDisplayOptions, zoomFactors, zoomLevelToText } from './plugins/DisplayOptionsContext';
import { useDocumentOptions } from './plugins/Options/DocumentOptionsContext';
import DropDown, { DropDownItem } from './ui/DropDown';
import { saveToTextFile, useSaveLoadContext } from './plugins/SaveLoadPlugin';
import useModal from './hooks/useModal';
import { showToast } from './ui/Toast';
import { useEffect } from 'react';

export const ActionBar = () => {
    return (
        <div className="span2cols actionbar">
            <span className="logo-main"></span>
            <FileButton/>
            <DisplayMenu/>
        </div>
    )
}

const LatexExportModal = () => {
    const {documentOptions} = useDocumentOptions();
    const [editor] = useLexicalComposerContext();

    const toClipboard = () => {
        editor.getEditorState().read(() => {
            const root = $getRoot();
            const latex = convertToLatex(root,documentOptions);
            navigator.clipboard.writeText(latex).then(()=>showToast("LaTeX successfully copied to clipboard"));
        });
    };

    const toFile = () => {
        editor.getEditorState().read(() => {
            const root = $getRoot();
            const latex = convertToLatex(root,documentOptions);
            saveToTextFile(latex,"index.tex", {description: 'LaTeX files', accept: {'text/x-tex': ['.tex']}});
        });
    }

    return (
        <div className='dialog-buttons-list'>
            <button onClick={toClipboard}>To clipboard</button>
            <button onClick={toFile}>As a file</button>
        </div>
    )
}

const FileButton = () => {
    const { saveAs, quickSave, handleFileChange, openFile } = useSaveLoadContext();
    const [modal, showModal] = useModal();
    const [editor] = useLexicalComposerContext();

    // latex export shortcut
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                showModal("Export to LaTeX",(onClose)=>(<LatexExportModal/>));
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [editor]);

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
            </DropDown>
            {modal}
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
    return (
        <DropDown buttonLabel={"Display"} stopCloseOnClickSelf={true}>
            <div>
                <span>Zoom</span>
                <button onClick={zoomOut}>-</button>
                <span>{zoomLevelToText(displayOptions.zoomLevel)}</span>
                <button onClick={zoomIn}>+</button>
            </div>
            <div>
                <label>
                    <input
                    type="checkbox"
                    checked={displayOptions.emulateLayout}
                    onChange={(e)=>{setDisplayOption("emulateLayout",e.target.checked)}}
                    />
                    Emulate layout
                </label>
            </div>
            <div>
                <label>
                    <input
                    type="checkbox"
                    checked={displayOptions.darkEditor}
                    onChange={(e)=>{setDisplayOption("darkEditor",e.target.checked)}}
                    />
                    Editor dark mode
                </label>
            </div>
        </DropDown>
    )
}