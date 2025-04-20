import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { NumberedHeadingNode } from "./NumberedHeadingNode";
import { $getRoot } from "lexical";
import { areIdentical } from "../../utils/generalUtils";
import { useDocumentStructureContext } from "./DocumentStructureContext";

export function AutoNumberer(ref){
    const {setNumberedHeadings} = useDocumentStructureContext();
    const [editor] = useLexicalComposerContext();
    
    editor.registerUpdateListener(() => {
        editor.update(() => {
            // We start by refreshing the numbering of all the headings, and fill a dictionnary with the strings
            var numbering = {1:0,2:0,3:0};
            const newheadings = [];
            const root = $getRoot();
            root.getChildren().forEach((node) => {
                if (node instanceof NumberedHeadingNode && node.getLevel() in numbering) {
                    numbering[node.getLevel()]++;
                    if (!areIdentical(numbering,node.getNumbering())){
                        node.setNumbering(numbering);
                    }
                    newheadings.push({key:node.getKey(),numberingString:node.getNumberingString(),textContent:node.getTextContent()});
                    Object.keys(numbering).forEach((level)=>{
                        if (level > node.getLevel()) numbering[level] = 0; // Reset numbering for lower levels
                    });
                }
            });

            setNumberedHeadings(newheadings);

            // Then, we look for all the reference nodes
            const visit = (node) => {
                if (node.getType()==="reference-heading") {
                    let info = newheadings.find((elmt)=>(elmt.key===node.getReferenceKey()))
                    var text = info ? info.numberingString : "??";
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