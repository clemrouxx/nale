import { createContext, useState, useContext, useEffect } from "react";
import { setGlobalCSSRule } from "../utils/generalUtils";

export const zoomFactors = [0.25,0.33,0.5,0.67,0.75,0.8,0.9,1,1.1,1.25,1.5,1.75,2,2.5,3,4,5];

export const zoomLevelToText = zoomLevel => `${Math.round(100*zoomFactors[zoomLevel])} %`;

const DEFAULT_DISPLAY_OPTIONS = {zoomLevel:9,emulateLayout:false,darkEditor:false,fullscreen:false}

const EditorOptionsContext = createContext();

export function EditorOptionsProvider({ children }) {
    const storedValue = localStorage.getItem("editorOptions");
    let storedOptions;
    if (storedValue) {
        storedOptions = JSON.parse(storedValue);
        storedOptions.fullscreen = false;// Never start with fullscreen on (yes, it is useless to store it then, but it is simpler like this.)
    }
    
    const [editorOptions, setEditorOptions] = useState(storedValue ? storedOptions : DEFAULT_DISPLAY_OPTIONS);

    const setDisplayOption = (option,value) => {
        let newOptions = structuredClone(editorOptions)
        newOptions[option]=value;
        setEditorOptions(newOptions);
        // Change also the local storage
        localStorage.setItem("editorOptions",JSON.stringify(newOptions));
    }

    useEffect(()=>{
        setGlobalCSSRule(".editor-base","--editor-scale",zoomFactors[editorOptions.zoomLevel]);

        // Fullscreen
        setGlobalCSSRule(".hide-on-fullscreen","display",editorOptions.fullscreen?"none":"");
        setGlobalCSSRule(".side-panel-container","width",editorOptions.fullscreen?"0":"auto");
    },[editorOptions]);

    return (
        <EditorOptionsContext.Provider value={{ editorOptions, setEditorOptions, setDisplayOption }}>
        {children}
        </EditorOptionsContext.Provider>
    );
}

export function useEditorOptions() {
    const context = useContext(EditorOptionsContext);
    if (context === undefined) {
        throw new Error('useEditorOptions must be used within EditorOptionsProvider');
    }
    return context;
}