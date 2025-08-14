import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $setSelection } from "lexical";
import { useEffect } from "react";

export default function PreventRefocusPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const handleExternalFocus = (event) => {
      if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA"
      ) {
        // Clear Lexical's idea of "current selection"
        editor.update(() => {
          $setSelection(null);
        });
      }
    };

    document.addEventListener("focusin", handleExternalFocus);

    return () => {
      document.removeEventListener("focusin", handleExternalFocus);
    };
  }, [editor]);

  return null;
}
