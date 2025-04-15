
export const DEFAULT_DOCUMENT_OPTIONS = {
    global : {
        fontSize : 12, // Main font size
    },
    headings : {
        numberingStyles : {1 : "a", 2 : "a", 3 : "a"}, // { <headingLevel> : <style> }
        numberingTemplates : {1 : "{S}", 2 : "{S}.{sS}", 3 : "{S}.{sS}.{sSS}"}, // { <headingLevel> : <template> }
    },
    paragraphs : {
        indentFirst : false,
    }
}