import { LexicalComposer } from "@lexical/react/LexicalComposer";
import Editor from "./LexicalEditor";
import { initialConfig } from "./LexicalConfig";
import { DocumentOptionsProvider } from "./plugins/Options/DocumentOptionsContext";

function App() {
  return (
    <div className="App">
      <h1 className="header">Not a LaTeX editor</h1>
      <LexicalComposer initialConfig={initialConfig}>
        <DocumentOptionsProvider>
          <Editor />
        </DocumentOptionsProvider>
      </LexicalComposer>
    </div>
  );
}

export default App;
