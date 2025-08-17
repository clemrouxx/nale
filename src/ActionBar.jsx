import {$getRoot} from 'lexical';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {convertToLatex} from './plugins/LatexExportPlugin/latexUtils';
import { useDisplayOptions, zoomFactors, zoomLevelToText } from './plugins/DisplayOptionsContext';
import { useDocumentOptions } from './plugins/Options/DocumentOptionsContext';
import DropDown, { DropDownItem } from './ui/DropDown';
import { useSaveLoadContext } from './plugins/SaveLoadPlugin';

export const ActionBar = () => {
    return (
        <div className="span2cols actionbar">
            <span className="logo-main"></span>
            <FileButton/>
            <DisplayMenu/>
        </div>
    )
}

const FileButton = () => {
    const {documentOptions} = useDocumentOptions();
    const [editor] = useLexicalComposerContext();
    const { saveAs, quickSave, handleFileChange, openFile } = useSaveLoadContext();

    const readEditorState = () => {
        editor.getEditorState().read(() => {
            const root = $getRoot();
            const latex = convertToLatex(root,documentOptions);
            console.log(latex);
        });
    };

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
                <DropDownItem onClick={readEditorState}>Export to LaTeX</DropDownItem>
            </DropDown>
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