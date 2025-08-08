import { useEffect, useState } from "react";

export const PDFviewer = ({ file, className, width, imageRef }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let currentRenderTask = null;

    const loadAndRenderPDF = async (file) => {
        if (currentRenderTask) {
      currentRenderTask.cancel();
      currentRenderTask = null;
    }

    if (cancelled) return;
      setLoading(true);
      const loadingTask = pdfjsLib.getDocument(file);

      try {
        if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js';
        }
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        const canvas = imageRef.current;
        const context = canvas.getContext("2d");
        const viewport = page.getViewport({ scale: 1 });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        if (cancelled) return;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        if (currentRenderTask) await currentRenderTask.promise;

        currentRenderTask = null;
      } catch (error) {
        if (!cancelled && error.name !== 'RenderingCancelledException') {
            console.error("Error loading PDF:", error);
        }
      }
      if (!cancelled) {
        setLoading(false);
      }
    };
    if (file) {
      loadAndRenderPDF(file);
    }

    return () => {
        cancelled = true;
        if (currentRenderTask) {
            currentRenderTask.cancel();
        }
    };
  }, [file]);

  return (
    <>
      {loading && <div style={{ position: "absolute", top: "48%", left: "43%" }}>Loading...</div>}
      <canvas
        ref={imageRef}
        className={className}
        style={{
          width: width,
          height: "auto"
        }}
      />
    </>
  );
};