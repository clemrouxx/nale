import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { $createNodeSelection, $setSelection } from 'lexical';

export function SelectableComponent({ nodeKey, inline, children }) { // Allow for custom CSS when an element is selected.
    const [isSelected] = useLexicalNodeSelection(nodeKey);
    const [editor] = useLexicalComposerContext();

    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        editor.update(() => {
            const nodeSelection = $createNodeSelection();
            nodeSelection.add(nodeKey);
            $setSelection(nodeSelection);
            console.log(nodeSelection);
        });
    };
    
    return (inline ?
        <span className={"cursor-pointer"+(isSelected ? 'selected' : '')} onClick={handleClick}>
            {children}
        </span>
        :
        <div className={"maximize cursor-pointer "+(isSelected ? 'selected' : '')} onClick={handleClick}>
            {children}
        </div>
    );
}