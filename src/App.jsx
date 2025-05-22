import { LexicalComposer } from "@lexical/react/LexicalComposer";
import Editor from "./LexicalEditor";
import { initialConfig } from "./LexicalConfig";
import { DocumentOptionsProvider } from "./plugins/Options/DocumentOptionsContext";
import { ActionBar } from "./ActionBar";

function App() {
  return (
    <div className="App">
      <LexicalComposer initialConfig={initialConfig}>
        <DocumentOptionsProvider>
          <ActionBar/>
          <Editor />
        </DocumentOptionsProvider>
      </LexicalComposer>
    </div>
  );
}

export default App;
