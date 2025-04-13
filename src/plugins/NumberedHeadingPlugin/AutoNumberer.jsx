import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { NumberedHeadingNode } from "./NumberedHeadingNode";
import { $getRoot } from "lexical";
import { areIdentical } from "../../utils/generalUtils";

export function AutoNumberer(){
    const [editor] = useLexicalComposerContext();

    editor.registerUpdateListener(() => {
        editor.update(() => {
            // We start by refreshing the numbering of all the headings, and fill a dictionnary with the strings
            var numbering = {1:0,2:0,3:0};
            var numberingStringsByKey = {}; // <key> : <numberingString>
            const root = $getRoot();
            root.getChildren().forEach((node) => {
                if (node instanceof NumberedHeadingNode && node.getLevel() in numbering) {
                    numbering[node.getLevel()]++;
                    if (!areIdentical(numbering,node.getNumbering())){
                        node.setNumbering(numbering);
                    }
                    numberingStringsByKey[node.getKey()] = node.getNumberingString();
                    Object.keys(numbering).forEach((level)=>{
                        if (level > node.getLevel()) numbering[level] = 0; // Reset numbering for lower levels
                    });
                }
            });
        });
    });      
}