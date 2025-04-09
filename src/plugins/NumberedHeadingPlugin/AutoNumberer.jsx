import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { NumberedHeadingNode } from "./NumberedHeadingNode";
import { $getRoot } from "lexical";


export function AutoNumberer(){
    const [editor] = useLexicalComposerContext();

    // Need to work on this to avoid infinite loop.

    editor.registerUpdateListener(({editorState}) => {
        editor.update(() => {
            var numbering = {1:1,2:1};
            const root = $getRoot();
            root.getChildren().forEach((node) => {
                if (node instanceof NumberedHeadingNode && node.getHeadingLevel() in numbering) {
                    const headingLevel = node.getHeadingLevel();
                    if (node.number !== numbering[headingLevel]){
                        const writable = node.getWritable();
                        writable.number = numbering[headingLevel];
                    }
                    numbering[headingLevel]++;
                    Object.keys(numbering).forEach((level)=>{
                        if (level > headingLevel) numbering[level] = 1; // Reset numbering for lower levels
                    });
                }
            });
        });
    });      
}