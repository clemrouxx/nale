import {$getRoot} from 'lexical';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {convertToLatex} from './plugins/LatexExportPlugin/latexUtils';
import { insertSimpleTestNode } from './nodes/SimpleTestNode';
import { insertBibliographyNode } from './nodes/BibliographyNode';

const ExportButton = () => {
    const [editor] = useLexicalComposerContext();

    const readEditorState = () => {
        editor.getEditorState().read(() => {
            const root = $getRoot();
            const latex = convertToLatex(root);
            console.log(latex);
        });
    };

    return (<>
        <button onClick={readEditorState}>Export</button>
        <button onClick={()=>insertSimpleTestNode(editor)}>Test button</button>
        </>
    );

}

export default ExportButton;