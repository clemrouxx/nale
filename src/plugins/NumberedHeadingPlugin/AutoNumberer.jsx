import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { NumberedHeadingNode } from "./NumberedHeadingNode";
import { $getRoot } from "lexical";
import { areIdentical } from "../../utils/areObjectsIdentical";


export function AutoNumberer(){
    const [editor] = useLexicalComposerContext();

    editor.registerUpdateListener(() => {
        editor.update(() => {
            var numbering = {1:0,2:0,3:0};
            const root = $getRoot();
            root.getChildren().forEach((node) => {
                if (node instanceof NumberedHeadingNode && node.getHeadingLevel() in numbering) {
                    const headingLevel = node.getHeadingLevel();
                    numbering[headingLevel]++;
                    if (!areIdentical(numbering,node.numbering)){
                        node.getWritable().numbering = structuredClone(numbering);
                    }
                    Object.keys(numbering).forEach((level)=>{
                        if (level > headingLevel) numbering[level] = 0; // Reset numbering for lower levels
                    });
                }
            });
        });
    });      
}