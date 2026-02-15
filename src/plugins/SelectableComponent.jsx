import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { $createNodeSelection, $setSelection } from 'lexical';

export function SelectableComponent({ nodeKey, inline, children, className='', clickable=true }) { // Allow for custom CSS when an element is selected.
    const [isSelected] = useLexicalNodeSelection(nodeKey);
    const [editor] = useLexicalComposerContext();

    const handleClick = (e) => {
        // Make an exception for links
        const isLink = (e.target.tagName === 'A' || e.target.parentElement?.tagName === 'A');
        if (!clickable || isLink){
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        
        editor.update(() => {
            const nodeSelection = $createNodeSelection();
            nodeSelection.add(nodeKey);
            $setSelection(nodeSelection);
        });
    };
    
    return (inline ?
        <span className={className+" selectablecomponent cursor-pointer "+(isSelected ? 'selected' : '')} onClick={handleClick}>
            {children}
        </span>
        :
        <div className={className+" selectablecomponent maximize cursor-pointer "+(isSelected ? 'selected' : '')} onClick={handleClick}>
            {children}
        </div>
    );
}