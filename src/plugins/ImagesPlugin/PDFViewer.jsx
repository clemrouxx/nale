import React, { useEffect, useRef } from 'react';
import pdfjsLib from '../../utils/pdfSetup';
import samplePdf from '../../images/sample.pdf';

const SimplePDFViewer = () => {
  const canvasRef = useRef(null);
  const pdfUrl = samplePdf;
  const renderTaskRef = useRef(null);

  useEffect(() => {
    const loadAndRenderPDF = async () => {
      try {
        console.log('Attempting to load PDF from:', pdfUrl);

        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }
        
        // Load the PDF
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        const page = await pdf.getPage(1);
        
        // Set up the canvas
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: 1 });
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        }

        console.log(viewport);
        
        // Start render and store the task
        renderTaskRef.current = page.render(renderContext);
        await renderTaskRef.current.promise;
        renderTaskRef.current = null;
        
        console.log('PDF rendered successfully!');
      } catch (error) {
        console.error('Error loading PDF:', error);
        console.error('PDF URL was:', pdfUrl);
      }
    }

    if (pdfUrl && canvasRef.current) {
      loadAndRenderPDF();
    }

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };

  }, [])

  return <canvas ref={canvasRef} style={{ border: '1px solid black' }} />
}

export default SimplePDFViewer;