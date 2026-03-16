import {$getRoot, $isTextNode} from 'lexical';
import { DEFAULT_DOCUMENT_OPTIONS } from '../Options/documentOptions';

const LATEX_BEGIN_DOCUMENT = 
`\\begin{document}
`;

const LATEX_END_DOCUMENT = 
`\\end{document}
`;

export function putInCommand(string,command){
    return `${command}{${string}}`;
}

export function putInEnvironment(string,envname){
    return `\\begin{${envname}}\n${string}\\end{${envname}}\n`;
}

function usePackage(name){ return `\\usepackage{${name}}\n`}

// ALL TEXT FORMATS : "bold" | "underline" | "strikethrough" | "italic" | "highlight" | "code" | "subscript" | "superscript" | "lowercase" | "uppercase" | "capitalize"

const TEXT_FORMAT_COMMANDS = {bold:"\\textbf",italic:"\\textit",capitalize:"\\textsc",superscript:"\\textsuperscript",subscript:"\\textsubscript"}
export const HEADING_COMMANDS = {1:"\\section",2:"\\subsection",3:"\\subsubsection",4:"\\paragraph",5:"\\subparagraph"};
const HEADING_NUMBERS = {1:"\\thesection",2:"\\thesubsection",3:"\\thesubsubsection"};

const needEscaping = ["#","$","%","&","_","{","}"];
const replaceBy = {"\\":"\\textbackslash","~":"\\~{}","^":"\\^{}","<":"$<$",">":"$>$","\u2013": "--",    // en dash
  "\u2014": "---",   // em dash
  "\u2018": "`",     // left single quote
  "\u2019": "'",     // right single quote
  "\u201C": "``",    // left double quote
  "\u201D": "''",    // right double quote
  "\u00A0": "~",     // non-breaking space
  "\u2026": "\\ldots{}", // ellipsis
};

function treatText(text){
    let newText = escapeText(text);
    newText = replaceQuotes(newText);
    return newText;
}

function isSafeForPdfTex(cp) {
  return (
        (cp >= 0x0020 && cp <= 0x007E) ||  // Printable ASCII
    (cp >= 0x00A0 && cp <= 0x017F) ||  // Latin-1 + Latin Extended-A (inputenc utf8 + T1)
     cp === 0x0192              ||      // ƒ  Latin Small F with Hook
     cp === 0x02C6              ||      // ˆ  Modifier Circumflex
     cp === 0x02DC              ||      // ˜  Small Tilde
    (cp >= 0x2013 && cp <= 0x2014) ||  // – —  en/em dash  (\textendash, \textemdash)
     cp === 0x2018              ||      // '  Left single quote
     cp === 0x2019              ||      // '  Right single quote
     cp === 0x201C              ||      // "  Left double quote
     cp === 0x201D              ||      // "  Right double quote
     cp === 0x2020              ||      // †  Dagger
     cp === 0x2021              ||      // ‡  Double dagger
     cp === 0x2022              ||      // •  Bullet
     cp === 0x2026              ||      // …  Ellipsis
     cp === 0x2030              ||      // ‰  Per mille
     cp === 0x2039              ||      // ‹  Single left angle quote
     cp === 0x203A              ||      // ›  Single right angle quote
     cp === 0x0131              ||      // ı  Dotless i
     cp === 0x0152              ||      // Œ  OE ligature
     cp === 0x0153              ||      // œ  oe ligature
     cp === 0x0160              ||      // Š
     cp === 0x0161              ||      // š
     cp === 0x0178              ||      // Ÿ
     cp === 0x017D              ||      // Ž
     cp === 0x017E               //      ž(covered with `fontenc T1` + `inputenc utf8`)
  );
}

export function escapeText(text){
    let escaped = "";
    for (const char of text) {
        const cp = char.codePointAt(0);
        if (needEscaping.includes(char)) {
            escaped += "\\" + char; // prepend backslash
        } else if (char in replaceBy) {
            escaped += replaceBy[char];// replace with mapped value
        } else {
            if (!isSafeForPdfTex(cp)) {
                console.warn(`Unsafe character: "${char}" (${cp}). Will be skipped.`)
            }
            else{
                escaped += char;
            }
        }
    }
    return escaped;
}

function replaceQuotes(str) {
  return str.replace(/(\S?)"(\S?)/g, (match, prev, next) => {
    const prevSpace = prev === '';
    const nextSpace = next === '';

    if (!prevSpace && !nextSpace) {
      // Both sides non-whitespace: check letter vs punctuation
      const nextIsLetter = /\w/.test(next);
      const prevIsLetter = /\w/.test(prev);
      if (nextIsLetter && !prevIsLetter) return prev + '``' + next;
      if (prevIsLetter && !nextIsLetter) return prev + "''" + next;
    }

    if (nextSpace && !prevSpace) return prev + "''"; // closing
    if (prevSpace && !nextSpace) return '``' + next; // opening
    if (!prevSpace && !nextSpace) return prev + '``' + next; // fallback: treat as opening

    return match; // both sides whitespace, leave unchanged
  });
}

function getDocumentCommandOptions(documentOptions){
    let options = "a4paper";
    if (documentOptions.general.fontSize !== DEFAULT_DOCUMENT_OPTIONS.general.fontSize){
        options += `,${documentOptions.general.fontSize}pt`;
    }
    if (documentOptions.general.twoColumns) options += ",twocolumn";
    return options;
}

function convertDocumentOptions(documentOptions){
    let latex = "\\usepackage[utf8]{inputenc}\n";
    // margins (geometry package)
    const margins = documentOptions.general.margins;
    const default_margins = DEFAULT_DOCUMENT_OPTIONS.general.margins;
    if (JSON.stringify(margins) !== JSON.stringify(default_margins)){
        latex += `\\usepackage[a4paper, top=${margins.top}mm, bottom=${margins.bottom}mm, left=${margins.left}mm, right=${margins.right}mm]{geometry}\n`;
    }

    // heading numbering
    if (JSON.stringify(documentOptions.headings) !== JSON.stringify(DEFAULT_DOCUMENT_OPTIONS.headings)){
        const styles = documentOptions.headings.numberingStyles;
        const templates = documentOptions.headings.numberingTemplates;
        const numbering = Object.fromEntries([1, 2, 3].map(level => [level, putInCommand(HEADING_COMMANDS[level].slice(1),"\\"+styles[level])]));
        for (let level=1;level<=3;level++){
            const numberingString = templates[level].replace("{S}",numbering[1]).replace("{sS}",numbering[2]).replace("{ssS}",numbering[3]);
            latex += `\\renewcommand{\\the${HEADING_COMMANDS[level].slice(1)}}{${numberingString}}\n`;
        }
    }

    // paragraph indentation
    if (documentOptions.paragraphs.indentFirst){
        latex += "\\usepackage{indentfirst}\n";
    }

    // figure options
    if (documentOptions.figures.name !== DEFAULT_DOCUMENT_OPTIONS.figures.name){
        latex += `\\renewcommand{\\figurename}{${documentOptions.figures.name}}`;
    }
    if (documentOptions.figures.labelSeparator !== DEFAULT_DOCUMENT_OPTIONS.figures.labelSeparator){
        latex += `\\usepackage{caption}
\\DeclareCaptionLabelSeparator{customLabelSeparator}{${documentOptions.figures.labelSeparator}}
\\captionsetup[figure]{labelsep=customLabelSeparator}`;
    }

    latex += "\n";
    return latex;
}

function getStyleValue(styleString, property) { // Helper function to get the style value from the CSS of an element (typically the color of a text node)
  if (!styleString) return null;
  
  const match = styleString.match(new RegExp(`${property}:\\s*([^;]+)`));
  return match ? match[1].trim() : null;
}

export function extractColorName(colorValue){ // Extracts "purple" from "var(--xcolor-purple)", etc.
    if (!colorValue) return null;
    const match = colorValue.match(/var\(--xcolor-(\w+)\)/);
    return match ? match[1] : null; 
}

export function convertToLatex(node,documentOptions,bubbledInfo={packages:new Set(),title:null,authors:[]},ancestorTypes=[]){
    var string = "";
    var childrenLatexList = [];
    
    if ($isTextNode(node)) {
        let text = node.getTextContent();
        if (!node.hasFormat("code")){
            text = treatText(text);
        }
        string += text;

        // Formating
        for (const format in TEXT_FORMAT_COMMANDS){
            if (node.hasFormat(format)) string = putInCommand(string,TEXT_FORMAT_COMMANDS[format]);
        }
        if (node.hasFormat("code")) string = `\\verb|${string}|`;

        // "Custom" formatting (e.g. text color)
        const style = node.getStyle();
        const colorValue = getStyleValue(style,"color");
        if (colorValue){
            let colorName = extractColorName(colorValue);
            if (colorName){
                string = putInCommand(string,`\\textcolor{${colorName}}`);
                bubbledInfo.packages.add("xcolor");
            }
        }
    }
    else if (node.getChildren){
        childrenLatexList = node.getChildren().map((n)=>convertToLatex(n,documentOptions,bubbledInfo,ancestorTypes.concat(node.getType())));
        string = childrenLatexList.join('');
    }
    
    if (node.toLatex){ // Conversion is defined in the node
        string = node.toLatex(childrenLatexList); // We pass as parameter the list of strings from the children
    }
    switch (node.getType()){
        case "root":
            let heading = `\\documentclass[${getDocumentCommandOptions(documentOptions)}]{article}\n`;
            bubbledInfo.packages.forEach(name => {heading += usePackage(name)}); // Add LaTeX packages, but only those needed
            heading += convertDocumentOptions(documentOptions);// Takes care of the relevant documentOptions (margins, renamings...)

            // data for title page
            if (bubbledInfo.title) heading += `\\title{${bubbledInfo.title}}\n`;
            bubbledInfo.authors.forEach((author)=>{
                heading += `\\author{${author}}\n`;
            });
            // put everything together
            string = heading + LATEX_BEGIN_DOCUMENT + string + LATEX_END_DOCUMENT;
            break;
        case "title":
            let titleString = string;
            if (documentOptions.title.relativeFontSize !== DEFAULT_DOCUMENT_OPTIONS.title.relativeFontSize) titleString = `\\${documentOptions.title.relativeFontSize} ${titleString}`;
            bubbledInfo.title = titleString; // We pass the text content of the title to the root node
            string = "\\maketitle\n"; // This is what should be where the title is.
            break;
        case "author":
            bubbledInfo.authors.push(string);
            break;
        case "author-list":
            bubbledInfo.packages.add("authblk");
            if (bubbledInfo.title) return "";
            else string = "\\maketitle\n"; // This way, the authors show up even if there is no title (as in the editor).
            break;
        case "text":
            break;
        case "paragraph":// Should be treated differently depending on if in a table or not.
            if (ancestorTypes.includes("tablecell")) break;
            if (string===""){
                string = "\\bigskip\n"; // Lineskip
            }
            else{
                string += "\n\n";
            }
            break;
        case "heading":
            let index = node.getTag()[1]-1;
            string = putInCommand(string,HEADING_COMMANDS[index])+"\n";
            break;
        case "list":
            string = putInEnvironment(string,node.getTag()==="ul"?"itemize":"enumerate");
            break;
        case "listitem":
            string = "\t\\item " + string + "\n";
            break;
        case "tablecell":
            break;
        case "tablerow":
            string = childrenLatexList.join(" & ") + "\\\\ \n";
            break;
        case "figure":
        case "image":
            bubbledInfo.packages.add("graphicx");
            break;
        case "math":
            //console.log(string);
            bubbledInfo.packages.add("physics");
            bubbledInfo.packages.add("amsmath,amssymb");
            bubbledInfo.packages.add("xcolor");
            break;
        case "citation":
        case "reference":
            bubbledInfo.packages.add("hyperref");
            break;
        default:
            if (!node.toLatex)  console.warn("Cannot export to LaTeX node type : ", node.getType());
            break;
    }
    return string;
}

export function getLatex(editor,documentOptions){
    return editor.getEditorState().read(()=>convertToLatex($getRoot(),documentOptions));
}