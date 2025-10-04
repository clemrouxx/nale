import {useLexicalNodeSelection} from '@lexical/react/useLexicalNodeSelection';

export function SelectableComponent({ nodeKey, inline, children }) { // Allow for custom CSS when an element is selected.
    const [isSelected] = useLexicalNodeSelection(nodeKey);
    
    return (inline ?
    <span className={isSelected ? 'selected' : ''}>
        {children}
    </span>
    :
    <div className={"maximize "+(isSelected ? 'selected' : '')}>
        {children}
    </div>
    );
}