import {
    $isTextNode,
  } from 'lexical';

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
        if (node.hasFormat("bold")) string = putInCommand(string,"\\textbf");
    }
    else{
        string += node.getChildren().map(convertToLatex).join(' ');
    }
    return string;
}

export default convertToLatex;