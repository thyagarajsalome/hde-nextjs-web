// src/lib/pdfClient.ts
// Client-side helper for dynamically loading PDF.js and rendering PDF pages to canvas/images

let pdfjsPromise: Promise<any> | null = null;

/**
 * Dynamically loads PDF.js from CDN on demand in the browser.
 */
export async function loadPdfJs(): Promise<any> {
  if (typeof window === 'undefined') return null;
  if ((window as any).pdfjsLib) return (window as any).pdfjsLib;

  if (!pdfjsPromise) {
    pdfjsPromise = new Promise((resolve, reject) => {
      const existing = document.getElementById('pdfjs-cdn-script');
      if (existing) {
        existing.addEventListener('load', () => resolve((window as any).pdfjsLib));
        existing.addEventListener('error', reject);
        return;
      }

      const script = document.createElement('script');
      script.id = 'pdfjs-cdn-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        const pdfjs = (window as any).pdfjsLib;
        if (pdfjs) {
          pdfjs.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        resolve(pdfjs);
      };
      script.onerror = () => {
        pdfjsPromise = null;
        reject(new Error('Failed to load PDF engine'));
      };
      document.head.appendChild(script);
    });
  }

  return pdfjsPromise;
}

/**
 * Loads a PDF document from a URL or ArrayBuffer and returns the PDFDocumentProxy.
 */
export async function loadPdfDocument(urlOrBuffer: string | ArrayBuffer): Promise<any> {
  const pdfjs = await loadPdfJs();
  if (!pdfjs) throw new Error('PDF engine unavailable');

  const loadingTask = typeof urlOrBuffer === 'string'
    ? pdfjs.getDocument({ url: urlOrBuffer, withCredentials: false })
    : pdfjs.getDocument({ data: urlOrBuffer });

  return loadingTask.promise;
}

/**
 * Renders a specific page of a PDF directly to an HTML5 canvas with crisp high-DPI resolution.
 */
export async function renderPdfPageToDataUrl(
  pdfDoc: any,
  pageNumber: number,
  targetWidth: number = 1200
): Promise<string> {
  const page = await pdfDoc.getPage(pageNumber);
  const unscaledViewport = page.getViewport({ scale: 1 });
  const scale = targetWidth / unscaledViewport.width;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: ctx,
    viewport: viewport,
  }).promise;

  return canvas.toDataURL('image/webp', 0.85);
}
