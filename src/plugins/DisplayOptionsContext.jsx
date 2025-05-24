import { createContext, useState, useContext, useEffect } from "react";
import { setGlobalCSSRule } from "../utils/generalUtils";

export const zoomFactors = [0.25,0.33,0.5,0.67,0.75,0.8,0.9,1,1.1,1.25,1.5,1.75,2,2.5,3,4,5];

const DisplayOptionsContext = createContext();

export function DisplayOptionsProvider({ children }) {
    const [displayOptions, setDisplayOptions] = useState({zoomLevel:9});

    const setDisplayOption = (option,value) => {
        let newOptions = structuredClone(displayOptions)
        newOptions[option]=value;
        setDisplayOptions(newOptions);
    }

    useEffect(()=>{
        setGlobalCSSRule(".editor-base","--editor-scale",zoomFactors[displayOptions.zoomLevel]);
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