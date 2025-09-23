import { createContext, useState, useContext, useEffect } from "react";
import { setGlobalCSSRule } from "../utils/generalUtils";

export const zoomFactors = [0.25,0.33,0.5,0.67,0.75,0.8,0.9,1,1.1,1.25,1.5,1.75,2,2.5,3,4,5];

export const zoomLevelToText = zoomLevel => `${Math.round(100*zoomFactors[zoomLevel])} %`;

const DEFAULT_DISPLAY_OPTIONS = {zoomLevel:9,emulateLayout:false,darkEditor:false,fullscreen:false}

const DisplayOptionsContext = createContext();

export function DisplayOptionsProvider({ children }) {
    const storedValue = localStorage.getItem("displayOptions");
    let storedOptions;
    if (storedValue) {
        storedOptions = JSON.parse(storedValue);
        storedOptions.fullscreen = false;// Never start with fullscreen on (yes, it is useless to store it then, but it is simpler like this.)
    }
    
    const [displayOptions, setDisplayOptions] = useState(storedValue ? storedOptions : DEFAULT_DISPLAY_OPTIONS);

    const setDisplayOption = (option,value) => {
        let newOptions = structuredClone(displayOptions)
        newOptions[option]=value;
        setDisplayOptions(newOptions);
        // Change also the local storage
        localStorage.setItem("displayOptions",JSON.stringify(newOptions));
    }

    useEffect(()=>{
        setGlobalCSSRule(".editor-base","--editor-scale",zoomFactors[displayOptions.zoomLevel]);

        // Fullscreen
        setGlobalCSSRule(".hide-on-fullscreen","display",displayOptions.fullscreen?"none":"");
        setGlobalCSSRule(".side-panel-container","width",displayOptions.fullscreen?"0":"auto");
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