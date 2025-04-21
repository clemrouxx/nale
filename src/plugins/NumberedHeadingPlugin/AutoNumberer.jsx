import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { NumberedHeadingNode } from "./NumberedHeadingNode";
import { $getRoot } from "lexical";
import { areIdentical } from "../../utils/generalUtils";
import { useDocumentStructureContext } from "./DocumentStructureContext";
import { CitationNode } from "../../nodes/CitationNode";

export function AutoNumberer(ref){
    const {setNumberedHeadings,biblio,setBiblio} = useDocumentStructureContext();
    const [editor] = useLexicalComposerContext();
    
    editor.registerUpdateListener(() => {
        editor.update(() => {
            // We start by refreshing the numbering of all the headings, and fill a dictionnary with the strings
            var numbering = {1:0,2:0,3:0};
            const newheadings = [];
            const citationKeys = []; // In the order they appear
            const root = $getRoot();

            const visit = (node) => {
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
                else if (node instanceof CitationNode && !citationKeys.includes(node.getCitationKey())){
                    citationKeys.push(node.getCitationKey());
                }

                if (node.getChildren) {
                    node.getChildren().forEach(visit);
                }
            };
            visit(root);

            // Possibly, reorder citationKeys, and choose other labels
            const citationsDict = Object.fromEntries(citationKeys.map((str, i) => [str, `[${i+1}]`])); // <citationKey> : <label>

            // Then, we update all reference & citation nodes
            const update = (node) => {
                if (node.getType()==="reference-heading") {
                    node.updateText(newheadings);
                }
                else if (node.getType()==="citation"){
                    node.updateText(citationsDict);
                }
                
                // Recurse through children
                else if (node.getChildren) {
                    node.getChildren().forEach(update);
                }
            };
            update(root);

            // Used for the toolbar for example
            setNumberedHeadings(newheadings);
        });
    });      
}