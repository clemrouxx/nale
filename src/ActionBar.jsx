import {$getRoot} from 'lexical';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import convertToLatex from './exportUtils';

const ExportButton = () => {
    const [editor] = useLexicalComposerContext();

    const readEditorState = () => {
        editor.getEditorState().read(() => {
            const root = $getRoot();
            const latex = convertToLatex(root);
            console.log(latex);
        });
    };

    return (<button onClick={readEditorState}>Export</button>);

}

export default ExportButton;