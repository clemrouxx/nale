
export const DEFAULT_DOCUMENT_OPTIONS = {
    general : {
        fontSize : 10, // Main font size
        margins : {left:38,right:38,top:25,bottom:25}, // (mm)
    },
    headings : {
        numberingStyles : {1 : "arabic", 2 : "arabic", 3 : "arabic"}, // { <headingLevel> : <style> }
        numberingTemplates : {1 : "{S}", 2 : "{S}.{sS}", 3 : "{S}.{sS}.{ssS}"}, // { <headingLevel> : <template> }
    },
    paragraphs : {
        indentFirst : false,
    }
}