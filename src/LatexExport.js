import {
    $isTextNode,
  } from 'lexical';


function putInCommand(string,command){
    return `${command}{${string}}`;
}

const TEXT_FORMAT_COMMANDS = {bold:"\\textbf",italic:"\\textit",capitalize:"\\textsc"}
const HEADING_COMMANDS = ["\\chapter","\\section","\\subsection","\\subsubsection","\\paragraph","\\subparagraph"];

function convertToLatex(node){
    var string = "";
    if ($isTextNode(node)) {
        string += node.getTextContent();
        for (const format in TEXT_FORMAT_COMMANDS){
            if (node.hasFormat(format)) string = putInCommand(string,TEXT_FORMAT_COMMANDS[format]);
        }
    }
    else{
        string += node.getChildren().map(convertToLatex).join('');
    }
    switch (node.getType()){
        case "root":
        case "text":
            break;
        case "paragraph":
            string += "\n";
            break;
        case "heading":
            const index = node.getTag()[1];
            string = putInCommand(string,HEADING_COMMANDS[index])+"\n";
            break;
        default:
            console.log("Node type : ", node.getType());
            break;
    }
    return string;
}

export default convertToLatex;