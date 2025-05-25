import {$isTextNode} from 'lexical';

const LATEX_HEADING = 
`\\documentclass{article}

`;

const LATEX_BEGIN = 
`\\begin{document}
`;

const LATEX_END = 
`\\end{document}
`;

function putInCommand(string,command){
    return `${command}{${string}}`;
}

function putInEnvironment(string,envname){
    return `\\begin{${envname}}\n${string}\\end{${envname}}\n`;
}

function usePackage(name){ return `\\usepackage{${name}}\n`}

// ALL TEXT FORMATS : "bold" | "underline" | "strikethrough" | "italic" | "highlight" | "code" | "subscript" | "superscript" | "lowercase" | "uppercase" | "capitalize"

const TEXT_FORMAT_COMMANDS = {bold:"\\textbf",italic:"\\textit",capitalize:"\\textsc"}
export const HEADING_COMMANDS = {1:"\\section",2:"\\subsection",3:"\\subsubsection",4:"\\paragraph",5:"\\subparagraph"};

export function convertToLatex(node,documentOptions,bubbledInfo={packages:new Set()}){
    var string = "";
    
    if ($isTextNode(node)) {
        string += node.getTextContent(); // TODO : add escaping
        for (const format in TEXT_FORMAT_COMMANDS){
            if (node.hasFormat(format)) string = putInCommand(string,TEXT_FORMAT_COMMANDS[format]);
        }
        if (node.hasFormat("code")) string = `\\verb|${string}|`; // TODO : add escaping
    }
    else if (node.getChildren){
        string = node.getChildren().map((n)=>convertToLatex(n,documentOptions,bubbledInfo)).join('');
    }
    
    if (node.toLatex){ // Conversion is defined in the node
        string = node.toLatex(string); // We pass as parameter the string from the children
    }
    switch (node.getType()){
        case "root":
            let heading = LATEX_HEADING;
            bubbledInfo.packages.forEach(name => {heading += usePackage(name)}); // Add LaTeX packages, but only those needed
            string = heading + LATEX_BEGIN + string + LATEX_END;
            break;
        case "text":
            break;
        case "paragraph":
            string += "\n";
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
        case "citation":
        case "reference":
            bubbledInfo.packages.add("hyperref");
            break;
        default:
            if (!node.toLatex)  console.log("Node type : ", node.getType());
            break;
    }
    return string;
}
