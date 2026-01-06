import { useState } from "react";
import { useSaveLoadContext } from "./SaveLoadPlugin";

export function CompileButton() {
  const [loading, setLoading] = useState(false);
  const { compile } = useSaveLoadContext();

  const handleCompile = async () => {

    setLoading(true);

    await compile();

    setLoading(false);

  };

  return (
    <button onClick={handleCompile} disabled={loading}>
      {loading ? "Compiling…" : "Compile LaTeX"}
    </button>
  );
}