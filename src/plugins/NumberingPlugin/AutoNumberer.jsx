import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";
import { areIdentical } from "../../utils/generalUtils";
import { useDocumentStructureContext } from "./DocumentStructureContext";
import { CitationNode } from "../../nodes/CitationNode";
import { FigureNode } from "../../nodes/FigureNode";
import { useEffect } from "react";
import { NumberedHeadingNode } from "../../nodes/NumberedHeadingNode";
import { MathNode } from "../../nodes/MathNode";
import MathNodes from "../MathPlugin/MathNodes";
import { PageBreakNode } from "../../nodes/PageBreakNode";

export function AutoNumberer(ref){
    const {setNumberedHeadings,biblio,setFigures,setNumberedEquations} = useDocumentStructureContext();
    const [editor] = useLexicalComposerContext();
    
    useEffect(() => 
    {
        return editor.registerUpdateListener(({}) => { // !!! Works but raises an error ("flushSync was called from inside a lifecycle method. React cannot flush when React is already rendering. Consider moving this call to a scheduler task or micro task.")
            // TODO : add some checks to skip this entirely, since we only care about structural changes and not any change in text for example.

            editor.update(() => {
                // We start by refreshing the numbering of all the headings, and fill a dictionnary with the strings
                let headingsNumbering = {1:0,2:0,3:0};
                let figuresNumber = 0; // Last figure number
                let equationsNumber = 0; // Idem, but for equations (numbered math blocks)
                let pageNumber = 1;
                const newheadings = [];
                const newfigures = [];
                const newequations = [];
                const citationKeys = []; // In the order they appear
                const root = $getRoot();

                const visit = (node) => {
                    if (node instanceof NumberedHeadingNode && node.isNumbered() && node.getLevel() in headingsNumbering) {
                        headingsNumbering[node.getLevel()]++;
                        if (!areIdentical(headingsNumbering,node.getNumbering())){
                            node.setNumbering(headingsNumbering);
                        }
                        newheadings.push({label:node.getLabel(),numberingString:node.getNumberingString(),textContent:node.getTextContent(),level:node.getLevel()});
                        Object.keys(headingsNumbering).forEach((level)=>{
                            if (level > node.getLevel()) headingsNumbering[level] = 0; // Reset headingsNumbering for lower levels
                        });
                    }
                    else if (node instanceof FigureNode){
                        figuresNumber++;
                        node.updateNumber(figuresNumber);
                        newfigures.push({label:node.getLabel(),numberingString:figuresNumber.toString(),textContent:node.getTextContent()});
                    }
                    else if (node instanceof MathNode && node.isNumbered()){
                        equationsNumber++;
                        node.updateNumbering(equationsNumber);
                        newequations.push({label:node.getLabel(),numberingString:equationsNumber.toString(),formula:MathNodes.getFormula(node.getMathTree(),false)});
                    }
                    
                    else if (node instanceof CitationNode){
                        node.getCitationKeys().forEach((citationKey)=>{
                            if (!citationKeys.includes(citationKey)) citationKeys.push(citationKey);
                        });
                    }

                    else if (node instanceof PageBreakNode){
                        pageNumber++;
                        node.updatePageNumber(pageNumber);
                    }

                    if (node.getChildren) {
                        node.getChildren().forEach(visit);
                    }
                };
                visit(root); // Starts the recursive visit of all nodes in the tree.
                //console.log(newheadings);

                // Possibly, reorder citationKeys, and choose other labels
                const citationsDict = Object.fromEntries(citationKeys.map((str, i) => [str, `${i+1}`])); // <citationKey> : <label>

                // Then, we update all reference & citation nodes
                const update = (node) => {
                    if (node.getType()==="reference") {
                        node.updateText([].concat(newheadings,newfigures,newequations));
                    }
                    else if (node.getType()==="citation"){
                        node.updateText(citationsDict);
                    }
                    else if (node.getType() === "bibliography"){
                        node.updateInner(citationKeys,citationsDict,biblio);
                    }
                    else if (node.getType() === "toc"){
                        node.updateInner(newheadings);
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
                setNumberedEquations(newequations);
            });
        });
    }, [editor,biblio]); 
}