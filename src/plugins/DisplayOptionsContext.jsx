import { createContext, useState, useContext, useEffect } from "react";
import { setGlobalCSSRule } from "../utils/generalUtils";

export const zoomFactors = [0.25,0.33,0.5,0.67,0.75,0.8,0.9,1,1.1,1.25,1.5,1.75,2,2.5,3,4,5];

export const zoomLevelToText = zoomLevel => `${Math.round(100*zoomFactors[zoomLevel])} %`;

const DEFAULT_DISPLAY_OPTIONS = {zoomLevel:9,realPageWidth:false,darkEditor:false}

const DisplayOptionsContext = createContext();

export function DisplayOptionsProvider({ children }) {
    const storedValue = localStorage.getItem("displayOptions")
    const [displayOptions, setDisplayOptions] = useState(storedValue ? JSON.parse(storedValue) : DEFAULT_DISPLAY_OPTIONS);

    const setDisplayOption = (option,value) => {
        let newOptions = structuredClone(displayOptions)
        newOptions[option]=value;
        setDisplayOptions(newOptions);
        // Change also the local storage
        localStorage.setItem("displayOptions",JSON.stringify(newOptions));
    }

    useEffect(()=>{
        setGlobalCSSRule(".editor-base","--editor-scale",zoomFactors[displayOptions.zoomLevel]);
        
        const editorContainer = document.getElementById('main-editor-container');
        if (displayOptions.realPageWidth) {
            editorContainer.classList.add('real-page-width');
        } else {
            editorContainer.classList.remove('real-page-width');
        }

        const editorDomElement = document.getElementById("main-editor");
        if (displayOptions.darkEditor) {
            editorDomElement.classList.add('editor-dark');
        } else {
            editorDomElement.classList.remove('editor-dark');
        }

    },[displayOptions]);

    return (
        <DisplayOptionsContext.Provider value={{ displayOptions, setDisplayOptions, setDisplayOption }}>
        {children}
        </DisplayOptionsContext.Provider>
    );
}

export function useDisplayOptions() {
    const context = useContext(DisplayOptionsContext);
    if (context === undefined) {
        throw new Error('useDisplayOptions must be used within DisplayOptionsProvider');
    }
    return context;
}