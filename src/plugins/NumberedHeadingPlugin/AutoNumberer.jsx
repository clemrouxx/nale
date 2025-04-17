import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { NumberedHeadingNode } from "./NumberedHeadingNode";
import { $getRoot } from "lexical";
import { areIdentical } from "../../utils/generalUtils";
import { useImperativeHandle, useRef, useState } from "react";

export function AutoNumberer({headingsInfo,setHeadingsInfo},ref){
    const [editor] = useLexicalComposerContext();
    
    editor.registerUpdateListener(() => {
        editor.update(() => {
            // We start by refreshing the numbering of all the headings, and fill a dictionnary with the strings
            var numbering = {1:0,2:0,3:0};
            const newHeadingsInfo = {};
            const root = $getRoot();
            root.getChildren().forEach((node) => {
                if (node instanceof NumberedHeadingNode && node.getLevel() in numbering) {
                    numbering[node.getLevel()]++;
                    if (!areIdentical(numbering,node.getNumbering())){
                        node.setNumbering(numbering);
                    }
                    newHeadingsInfo[node.getKey()] = {numberingString:node.getNumberingString(),textContent:node.getTextContent()};
                    Object.keys(numbering).forEach((level)=>{
                        if (level > node.getLevel()) numbering[level] = 0; // Reset numbering for lower levels
                    });
                }
            });

            setHeadingsInfo(newHeadingsInfo);

            // Then, we look for all the reference nodes
            const visit = (node) => {
                if (node.getType()==="reference-heading") {
                    let info = newHeadingsInfo[node.getReferenceKey()];
                    var text = info ? info.numberingString : "?";
                    if (node.getText() !== text){
                        node.setText(text);
                    }
                }
                
                // Recurse through children
                else if (node.getChildren) {
                    node.getChildren().forEach(visit);
                }
            };
            visit(root);
        });
    });      
}