import {
    $isTextNode,
  } from 'lexical';


function putInCommand(string,command){
    return `${command}{${string}}`;
}

function putInEnvironment(string,envname){
    return `\\begin{${envname}}\n${string}\\end{${envname}}\n`;
}

// ALL TEXT FORMATS : "bold" | "underline" | "strikethrough" | "italic" | "highlight" | "code" | "subscript" | "superscript" | "lowercase" | "uppercase" | "capitalize"

const TEXT_FORMAT_COMMANDS = {bold:"\\textbf",italic:"\\textit",capitalize:"\\textsc"}
export const HEADING_COMMANDS = {1:"\\section",2:"\\subsection",3:"\\subsubsection",4:"\\paragraph",5:"\\subparagraph"};

function convertToLatex(node){
    var string = "";
    
    if ($isTextNode(node)) {
        string += node.getTextContent(); // TODO : add escaping
        for (const format in TEXT_FORMAT_COMMANDS){
            if (node.hasFormat(format)) string = putInCommand(string,TEXT_FORMAT_COMMANDS[format]);
        }
        if (node.hasFormat("code")) string = `\\verb|${string}|`; // TODO : add escaping
    }
    else if (node.getChildren){
        string = node.getChildren().map(convertToLatex).join('');
    }

    if (node.toLatex){ // Conversion is defined in the node
        string += node.toLatex(string); // We pass as parameter the string from the children
    }

    // Things to do AFTER dealing with the children
    switch (node.getType()){
        case "root":
        case "text":
        case "latex":
        case "numbered-heading":
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
        default:
            console.log("Node type : ", node.getType());
            break;
    }
    return string;
}

export default convertToLatex;