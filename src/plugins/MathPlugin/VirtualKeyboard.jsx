import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useActiveNode } from "../../utils/lexicalUtils";
import { useState } from "react";

export function VirtualKeyboard() {
    const { activeNode } = useActiveNode();
    const [isOpen,setOpen] = useState(true);

    return (
        <>
        {activeNode && ( //activeNode.getType() === "math"
            <div className="span2cols">
                <div className={"drawer-handle horizontal " + (isOpen?"down":"up")} onClick={()=>{setOpen(!isOpen)}} title="Toggle Virtual Keyboard"></div>
                {isOpen && (
                    <div className="flex">KEYBOARD</div>
                )}
            </div>
        )}
        </>
    );
}