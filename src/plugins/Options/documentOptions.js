
export const DEFAULT_DOCUMENT_OPTIONS = {
    general : {
        fontSize : 10, // Main font size
        margins : {left:38,right:38,top:25,bottom:25}, // (mm)
        twoColumns : false,
    },
    headings : {
        numberingStyles : {1 : "arabic", 2 : "arabic", 3 : "arabic"}, // { <headingLevel> : <style> }
        numberingTemplates : {1 : "{S}", 2 : "{S}.{sS}", 3 : "{S}.{sS}.{ssS}"}, // { <headingLevel> : <template> }
    },
    paragraphs : {
        indentFirst : false,
    },
    figures : {
        figureName : "Figure",
        labelSeparator : ":",
    },
    title : {
        relativeFontSize : "LARGE",
    },
    abstract : {
        spanAllCols : false, // Only relevant for twoColumns = true
    }
}

export function completeDocumentOptions(documentOptions) { // Completes with default values for compatibility with older files
    const result = { ...documentOptions };
    
    for (const [key, defaultValue] of Object.entries(DEFAULT_DOCUMENT_OPTIONS)) {
        if (key in result) {
            if (typeof result[key] === 'object' && result[key] !== null) {
                result[key] = { ...defaultValue, ...result[key] }; // Merge, but with priority to documentOptions
            }
        } else {
            result[key] = defaultValue;
        }
    }
    
    return result;
}