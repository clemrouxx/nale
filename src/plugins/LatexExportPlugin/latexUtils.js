import {$isTextNode} from 'lexical';
import { DEFAULT_DOCUMENT_OPTIONS } from '../Options/documentOptions';

const LATEX_BEGIN_DOCUMENT = 
`\\begin{document}
`;

const LATEX_END_DOCUMENT = 
`\\end{document}
`;

function putInCommand(string,command){
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
const replaceBy = {"\\":"\\textbackslash","~":"\\~{}","^":"\\^{}","<":"$<$",">":"$>$"};

function escapeText(text){
    let escaped = "";
    for (const char of text) {
        if (needEscaping.includes(char)) {
            escaped += "\\" + char; // prepend backslash
        } else if (char in replaceBy) {
            escaped += replaceBy[char];// replace with mapped value
        } else {
            escaped += char;
        }
    }
    return escaped;
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
    let latex = "";
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
    if (documentOptions.figures.figureName !== DEFAULT_DOCUMENT_OPTIONS.figures.figureName){
        latex += `\\renewcommand{\\figurename}{${documentOptions.figures.figureName}}`;
    }
    if (documentOptions.figures.labelSeparator !== DEFAULT_DOCUMENT_OPTIONS.figures.labelSeparator){
        latex += `\\usepackage{caption}
\\DeclareCaptionLabelSeparator{customLabelSeparator}{${documentOptions.figures.labelSeparator}}
\\captionsetup[figure]{labelsep=customLabelSeparator}`;
    }

    latex += "\n";
    return latex;
}

export function convertToLatex(node,documentOptions,bubbledInfo={packages:new Set(),title:null,authors:[]}){
    var string = "";
    
    if ($isTextNode(node)) {
        let text = node.getTextContent();
        if (!node.hasFormat("code")){
            text = escapeText(text);
        }
        string += text;

        // Formating
        for (const format in TEXT_FORMAT_COMMANDS){
            if (node.hasFormat(format)) string = putInCommand(string,TEXT_FORMAT_COMMANDS[format]);
        }
        if (node.hasFormat("code")) string = `\\verb|${string}|`;
    }
    else if (node.getChildren){
        string = node.getChildren().map((n)=>convertToLatex(n,documentOptions,bubbledInfo)).join('');
    }
    
    if (node.toLatex){ // Conversion is defined in the node
        string = node.toLatex(string); // We pass as parameter the string from the children
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
            bubbledInfo.title = string; // We pass the text content of the title to the root node
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
        case "paragraph":
            string += "\n\n";
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
        case "figure":
            bubbledInfo.packages.add("graphicx");
            break;
        case "math":
            bubbledInfo.packages.add("physics");
            bubbledInfo.packages.add("amsmath,amssymb");
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
