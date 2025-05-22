import {$getRoot} from 'lexical';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {convertToLatex} from './plugins/LatexExportPlugin/latexUtils';

export const ActionBar = () => {
    return (
        <div className="span2cols actionbar">
            <h1 className='inline'>NaLE</h1>
            <ExportButton/>
            <button>Test</button>
        </div>
    )
}

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
        </>
    );
}