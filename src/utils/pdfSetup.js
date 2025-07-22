import * as pdfjsLib from 'pdfjs-dist'

// For PDF.js v5, try these paths in order:
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()

export default pdfjsLib