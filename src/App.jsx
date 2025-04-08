import { LexicalComposer } from "@lexical/react/LexicalComposer";
import Editor from "./LexicalEditor";
import { initialConfig } from "./LexicalConfig";

function App() {
  return (
    <div className="App">
      <h1>My Lexical Editor</h1>
      <LexicalComposer initialConfig={initialConfig}>
        <Editor />
      </LexicalComposer>
    </div>
  );
}

export default App;
