import { LexicalComposer } from "@lexical/react/LexicalComposer";
import Editor from "./LexicalEditor";
import { initialConfig } from "./LexicalConfig";
import { DocumentOptionsProvider } from "./plugins/Options/DocumentOptionsContext";
import { ActionBar } from "./ActionBar";
import { DisplayOptionsProvider } from "./plugins/DisplayOptionsContext";
import { DocumentStructureProvider } from "./plugins/NumberingPlugin/DocumentStructureContext";
import { MathJaxContext } from "better-react-mathjax";

const mathJaxConfig = {
  loader: { load: ["[tex]/html"] },
  tex: {
    packages: { "[+]": ["html"] },
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"]
    ],
    displayMath: [
      ["$$", "$$"],
      ["\\[", "\\]"]
    ],
    processEscapes: true,
    processEnvironments: true
  },
  options: {
    ignoreHtmlClass: "tex2jax_ignore",
    processHtmlClass: "tex2jax_process"
  }
};

function App() {
  return (
    <div className="App">
      <LexicalComposer initialConfig={initialConfig}>
        <DocumentOptionsProvider>
        <DocumentStructureProvider>
        <DisplayOptionsProvider>
        <MathJaxContext config={mathJaxConfig}>
          <ActionBar/>
          <Editor />
        </MathJaxContext>
        </DisplayOptionsProvider>
        </DocumentStructureProvider>
        </DocumentOptionsProvider>
      </LexicalComposer>
    </div>
  );
}

export default App;
