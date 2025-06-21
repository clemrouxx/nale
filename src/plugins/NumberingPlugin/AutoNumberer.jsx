import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";
import { areIdentical } from "../../utils/generalUtils";
import { useDocumentStructureContext } from "./DocumentStructureContext";
import { CitationNode } from "../../nodes/CitationNode";
import { FigureNode } from "../../nodes/FigureNode";
import { useEffect } from "react";
import { NumberedHeadingNode } from "../../nodes/NumberedHeadingNode";

export function AutoNumberer(ref){
    const {setNumberedHeadings,biblio,setFigures} = useDocumentStructureContext();
    const [editor] = useLexicalComposerContext();
    
    useEffect(() => 
    {return editor.registerUpdateListener(() => {
        editor.update(() => {
            // We start by refreshing the numbering of all the headings, and fill a dictionnary with the strings
            let headingsNumbering = {1:0,2:0,3:0};
            let figuresNumber = 0; // Last figure number
            const newheadings = [];
            const newfigures = [];
            const citationKeys = []; // In the order they appear
            const root = $getRoot();

            const visit = (node) => {
                if (node instanceof NumberedHeadingNode && node.isNumbered() && node.getLevel() in headingsNumbering) {
                    headingsNumbering[node.getLevel()]++;
                    if (!areIdentical(headingsNumbering,node.getNumbering())){
                        node.setNumbering(headingsNumbering);
                    }
                    newheadings.push({key:node.getKey(),numberingString:node.getNumberingString(),textContent:node.getTextContent()});
                    Object.keys(headingsNumbering).forEach((level)=>{
                        if (level > node.getLevel()) headingsNumbering[level] = 0; // Reset headingsNumbering for lower levels
                    });
                }
                else if (node instanceof FigureNode){
                    figuresNumber++;
                    node.updateNumber(figuresNumber);
                    newfigures.push({key:node.getKey(),numberingString:figuresNumber.toString(),textContent:node.getTextContent()});
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
                if (node.getType()==="reference") {
                    node.updateText([].concat(newheadings,newfigures));
                }
                else if (node.getType()==="citation"){
                    node.updateText(citationsDict);
                }
                else if (node.getType() === "bibliography"){
                    node.updateInner(citationKeys,citationsDict,biblio);
                }
                
                // Recurse through children
                else if (node.getChildren) {
                    node.getChildren().forEach(update);
                }
            };
            update(root);

            // Used for the toolbar for example
            setNumberedHeadings(newheadings);
            setFigures(newfigures);
        });
    });
    }, [biblio]); 
}