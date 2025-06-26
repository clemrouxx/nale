// I just want to add a CSS class to some lexical DOM elements...

import {useLexicalNodeSelection} from '@lexical/react/useLexicalNodeSelection';


export function SelectableComponent({ nodeKey, children }) {
    const [isSelected] = useLexicalNodeSelection(nodeKey);
    
    return (
    <span className={isSelected ? 'selected' : ''}>
        {children}
    </span>
    );
}