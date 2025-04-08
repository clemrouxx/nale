import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { NumberedHeadingNode } from "./NumberedHeadingNode";
import { $getRoot } from "lexical";


export function AutoNumberer(){
    const [editor] = useLexicalComposerContext();

    editor.registerUpdateListener(({editorState}) => {
        editorState.read(() => {
            const headings = [];
            const root = $getRoot();
            root.getChildren().forEach((node) => {
                console.log(node);
                if (node instanceof NumberedHeadingNode && node.getTag() === 'h1') {
                    headings.push(node);
                }
            });
        
            headings.forEach((node, index) => {
                const dom = editor.getElementByKey(node.getKey());
                if (dom) {
                    //dom.textContent = `${index + 1}. ${node.getTextContent()}`;
                }
            });
        });
    });      
}