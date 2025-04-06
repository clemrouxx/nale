import {
    $isTextNode,
  } from 'lexical';

const TEXT_FORMAT_COMMANDS = {bold:"\\textbf",italic:"\\textit",capitalize:"\\textsc"}

function putInCommand(string,command){
    return `${command}{${string}}`;
}

function convertToLatex(node){
    var string = "";
    switch (node.getType()){
        case "root":
        case "text":
            break;
        case "paragraph":
            string += "\n";
            break;
        default:
            console.log("Node type : ", node.getType());
            break;
    }
    if ($isTextNode(node)) {
        string += node.getTextContent();
        for (const format in TEXT_FORMAT_COMMANDS){
            if (node.hasFormat(format)) string = putInCommand(string,TEXT_FORMAT_COMMANDS[format]);
        }
    }
    else{
        string += node.getChildren().map(convertToLatex).join(' ');
    }
    return string;
}

export default convertToLatex;