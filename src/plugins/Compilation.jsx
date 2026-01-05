import React, { useState } from "react";
//import { PdfTeXEngine } from "../swiftlatex/PdfTeXEngine.js";

const TEST_TEX = `\\documentclass{article}
\\usepackage{graphicx} % Required for inserting images

\\title{blank}
\\author{clemroux03 }
\\date{January 2026}

\\begin{document}

\\maketitle

\\section{Introduction}

\\end{document}
`

export function CompileButton() {
  const [loading, setLoading] = useState(false);

  const handleCompile = async () => {

    setLoading(true);

    try {

      const engine = new PdfTeXEngine();
      
      //engine.setTexliveEndpoint("/nale/texlive");

      console.log(engine);
      if (!engine) throw new Error("PdfTeXEngine not loaded");
      await engine.loadEngine();

      // Write files to WASM FS
      engine.writeMemFSFile("main.tex", TEST_TEX);
      /*
      engine.writeMemFSFile("main.tex", await texFile.text());
      if (bibFile) engine.writeMemFSFile("refs.bib", await bibFile.text());
      for (let img of imageFiles || []) {
        engine.writeMemFSFile(img.name, new Uint8Array(await img.arrayBuffer()));
      }*/

      engine.setEngineMainFile("main.tex");

      // Compile (single run, will include bib if present)
      
      const result = await engine.compileLaTeX();

      console.log(result.log);

      // result.pdf is Uint8Array of PDF
      const blob = new Blob([result.pdf], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url);
    } catch (e) {
      console.error("Compile error:", e);
      alert("Compilation failed. See console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleCompile} disabled={loading}>
      {loading ? "Compiling…" : "Compile LaTeX"}
    </button>
  );
}