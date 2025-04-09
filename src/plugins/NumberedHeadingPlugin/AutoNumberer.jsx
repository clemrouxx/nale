import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { NumberedHeadingNode } from "./NumberedHeadingNode";
import { $getRoot } from "lexical";


export function AutoNumberer(){
    const [editor] = useLexicalComposerContext();

    // Need to work on this to avoid infinite loop.

    editor.registerUpdateListener(({editorState}) => {
        editor.update(() => {
            var number = 1;
            const root = $getRoot();
            root.getChildren().forEach((node) => {
                if (node instanceof NumberedHeadingNode && node.getTag() === 'h1') {
                    if (node.number !== number){
                        const writable = node.getWritable();
                        writable.number = number;
                    }
                    number++;
                }
                console.log(node);
            });
        });
    });      
}