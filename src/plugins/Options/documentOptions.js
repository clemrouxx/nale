
export const DEFAULT_DOCUMENT_OPTIONS = {
    general : {
        fontSize : 12, // Main font size
        marginLeft : 0, // (mm)
        marginRight : 32,
    },
    headings : {
        numberingStyles : {1 : "a", 2 : "a", 3 : "a"}, // { <headingLevel> : <style> }
        numberingTemplates : {1 : "{S}", 2 : "{S}.{sS}", 3 : "{S}.{sS}.{ssS}"}, // { <headingLevel> : <template> }
    },
    paragraphs : {
        indentFirst : false,
    }
}