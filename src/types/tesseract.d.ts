declare module 'tesseract.js' {
  export interface WorkerOptions {
    logger?: (message: any) => void;
    langPath?: string;
    gzip?: boolean;
    corePath?: string;
    workerPath?: string;
    cachePath?: string;
    workerBlobURL?: boolean;
    errorHandler?: (error: Error) => void;
  }

  export interface RecognizeResult {
    data: {
      text: string;
      hocr: string;
      tsv: string;
      blocks: any[];
      confidence: number;
      lines: any[];
      symbols: any[];
      words: any[];
    };
  }

  export interface Worker {
    load: () => Promise<any>;
    loadLanguage: (lang: string) => Promise<any>;
    initialize: (lang: string) => Promise<any>;
    recognize: (image: string | HTMLImageElement | HTMLCanvasElement | ImageBitmap | ImageData | File | Blob) => Promise<RecognizeResult>;
    detect: (image: string | HTMLImageElement | HTMLCanvasElement | ImageBitmap | ImageData | File | Blob) => Promise<any>;
    terminate: () => Promise<any>;
  }

  export function createWorker(options?: WorkerOptions): Promise<Worker>;
  export function createWorker(lang?: string): Promise<Worker>;
} 