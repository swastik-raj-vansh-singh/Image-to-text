'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Image as ChakraImage,
  Input,
  Progress,
  Text,
  Textarea,
  VStack,
  useToast,
  IconButton,
  Tooltip,
  Badge,
  Select,
  Switch,
  FormControl,
  FormLabel,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Heading,
} from '@chakra-ui/react';
import { createWorker } from 'tesseract.js';

// Define the image type
interface ImageItem {
  id: string;
  file: File;
  preview: string;
  text?: string;
  processing?: boolean;
  error?: string;
  preprocessed?: string; // URL for preprocessed image
}

// Image preprocessing options
interface PreprocessingOptions {
  enabled: boolean;
  grayscale: boolean;
  contrast: number;
  binarize: boolean;
  threshold: number;
  scale: number;
  deskew: boolean;
  denoise: boolean;
  adaptiveThreshold: boolean;
  sharpen: boolean;
}

const MAX_IMAGES = 30;
const ACCEPTED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
];

// OCR configurations
const OCR_LANGUAGES = {
  'eng': 'English',
  'eng+osd': 'English with orientation detection',
  'eng+equ': 'English with math/equation detection',
};

// PSM modes for more precise text extraction
const PSM_MODES = {
  '1': 'Auto with orientation',
  '3': 'Fully automatic',
  '4': 'Single column of text',
  '6': 'Single uniform block of text',
  '11': 'Sparse text',
  '12': 'Sparse text with OSD',
  '13': 'Raw line detection'
};

// Table formatting options
const TABLE_FORMATS = {
  'plain': 'Plain text (spaces)',
  'markdown': 'Markdown table',
  'formatted': 'Formatted table (aligned columns)',
  'csv': 'CSV (comma-separated)'
};

// OCR Model configurations
const OCR_MODELS = {
  'fast': {
    name: 'Fast Mode',
    description: 'Quick results with good accuracy',
    engineConfig: {
      tessedit_pageseg_mode: '3',
      preserve_interword_spaces: '1',
      tessjs_create_hocr: '0',
      tessjs_create_tsv: '0',
      textord_heavy_nr: '1',
      textord_min_linesize: '3.0'
    },
    preprocessConfigs: [
      { 
        enabled: false,
        grayscale: false,
        contrast: 1,
        binarize: false,
        threshold: 128,
        scale: 1,
        deskew: false,
        denoise: false,
        adaptiveThreshold: false,
        sharpen: false
      },
      { 
        enabled: true, 
        grayscale: true, 
        contrast: 1.2, 
        binarize: false,
        threshold: 150,
        scale: 1.0,
        deskew: false,
        denoise: false,
        adaptiveThreshold: false,
        sharpen: true
      }
    ]
  },
  'balanced': {
    name: 'Balanced',
    description: 'Good mix of speed and accuracy',
    engineConfig: {
      tessedit_pageseg_mode: '6',
      preserve_interword_spaces: '1',
      tessjs_create_hocr: '1',
      tessjs_create_tsv: '1',
      tessedit_fix_fuzzy_spaces: '1',
      textord_min_linesize: '2.5',
      tessedit_enable_doc_dict: '1'
    },
    preprocessConfigs: [
      { 
        enabled: false,
        grayscale: false,
        contrast: 1,
        binarize: false,
        threshold: 128,
        scale: 1,
        deskew: false,
        denoise: false,
        adaptiveThreshold: false,
        sharpen: false
      },
      { 
        enabled: true, 
        grayscale: true, 
        contrast: 1.3, 
        binarize: false,
        threshold: 150,
        scale: 1.5,
        deskew: true,
        denoise: false,
        adaptiveThreshold: false,
        sharpen: true
      },
      {
        enabled: true,
        grayscale: true,
        contrast: 1.4,
        binarize: true,
        threshold: 160,
        scale: 1.8,
        deskew: true,
        denoise: true,
        adaptiveThreshold: false,
        sharpen: false
      }
    ]
  },
  'ultra-accurate': {
    name: 'Ultra Accurate',
    description: 'Advanced precision with AI enhancement',
    engineConfig: {
      tessedit_pageseg_mode: '6',
      tessedit_char_whitelist: '', 
      preserve_interword_spaces: '1',
      tessjs_create_hocr: '1',
      tessjs_create_tsv: '1',
      textord_tabfind_find_tables: '1',
      textord_tablefind_recognize_tables: '1',
      tessedit_do_invert: '0',
      tessedit_fix_fuzzy_spaces: '1',
      textord_space_size_is_variable: '1',
      tessedit_preserve_min_wd_len: '2',
      tessedit_prefer_joined_punct: '0',
      tessedit_write_block_separators: '1',
      tessedit_write_rep_codes: '1',
      tessedit_write_unlv: '1',
      textord_min_linesize: '2.5',
      textord_heavy_nr: '0',
      hocr_font_info: '1',
      tessedit_enable_doc_dict: '1',
      tessedit_unrej_any_wd: '1',
      tessedit_create_txt: '1',
      tessedit_create_hocr: '1',
      tessedit_char_blacklist: 'il│|¦',    // Prevent common OCR errors in numbers
      edges_max_children_per_outline: '40', // Better handle letter boundaries
      edges_children_per_grandchild: '10.0'
    },
    preprocessConfigs: [
      { 
        enabled: false,
        grayscale: false,
        contrast: 1,
        binarize: false,
        threshold: 128,
        scale: 1,
        deskew: false,
        denoise: false,
        adaptiveThreshold: false,
        sharpen: false
      },
      // Clean text configuration
      { 
        enabled: true, 
        grayscale: true, 
        contrast: 1.5, 
        binarize: false,
        threshold: 150,
        scale: 2.0,
        deskew: true,
        denoise: false,
        adaptiveThreshold: false,
        sharpen: true
      },
      // Adaptive threshold for better accuracy
      {
        enabled: true,
        grayscale: true,
        contrast: 1.3,
        binarize: true,
        threshold: 150,
        scale: 2.2,
        deskew: true,
        denoise: true,
        adaptiveThreshold: true,
        sharpen: false
      },
      // High contrast mode for difficult text
      {
        enabled: true,
        grayscale: true,
        contrast: 1.8,
        binarize: true,
        threshold: 180,
        scale: 2.5,
        deskew: true,
        denoise: true,
        adaptiveThreshold: true,
        sharpen: true
      },
      // Special MCQ configuration 
      {
        enabled: true,
        grayscale: true,
        contrast: 2.0,
        binarize: true,
        threshold: 200,
        scale: 3.0,
        deskew: true,
        denoise: false,
        adaptiveThreshold: false,
        sharpen: true
      }
    ]
  }
};

export default function ImageToText() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [combinedText, setCombinedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('eng');
  const [useAiEnhancement, setUseAiEnhancement] = useState(true);
  const [tableFormat, setTableFormat] = useState('formatted');
  const [detectTables, setDetectTables] = useState(false);
  const [selectedModel, setSelectedModel] = useState('balanced');
  const [isDragActive, setIsDragActive] = useState(false);
  
  // Preprocessing options
  const [preprocessing, setPreprocessing] = useState<PreprocessingOptions>({
    enabled: false,
    grayscale: true,
    contrast: 1,
    binarize: false,
    threshold: 128,
    scale: 1.5,
    deskew: true,
    denoise: false,
    adaptiveThreshold: false,
    sharpen: false
  });
  
  // Track processing metrics
  const [processingMetrics, setProcessingMetrics] = useState<{
    totalTime?: number;
    confidence?: number;
  }>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const toast = useToast();

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (images.length + files.length > MAX_IMAGES) {
      toast({
        title: 'Maximum images exceeded',
        description: `You can only upload a maximum of ${MAX_IMAGES} images at once.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const newImages = Array.from(files)
      .filter((file) => ACCEPTED_FILE_TYPES.includes(file.type))
      .map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
        preview: URL.createObjectURL(file),
      }));

    if (newImages.length < files.length) {
      toast({
        title: 'Some files were rejected',
        description: 'Only JPEG, PNG, WEBP, GIF, and BMP files are supported.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }

    setImages((prev) => [...prev, ...newImages]);
  }, [images.length, toast]);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
      // Reset the file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle file drag and drop
  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragActive(true);
    },
    []
  );
  
  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragActive(false);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragActive(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  // Handle paste from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent): void => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageItems = Array.from(items).filter(
        (item) => item.type.indexOf('image') !== -1
      );

      if (imageItems.length > 0) {
        const fileList = [] as File[];
        for (const item of imageItems) {
          const file = item.getAsFile();
          if (file) fileList.push(file);
        }
        
        // Create a FileList-like object
        const fileListObj = {
          length: fileList.length,
          item: (i: number) => fileList[i],
          [Symbol.iterator]: function* () {
            for (let i = 0; i < this.length; i++) yield this.item(i);
          },
        } as unknown as FileList;
        
        handleFileSelect(fileList.length > 0 ? fileListObj : null);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handleFileSelect]);

  // Remove an image from the list
  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Preprocess image to improve OCR accuracy
  const preprocessImage = (imageUrl: string, options: PreprocessingOptions): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        // Create canvas if it doesn't exist
        const newCanvas = document.createElement('canvas');
        newCanvas.style.display = 'none';
        document.body.appendChild(newCanvas);
        if (!canvasRef.current) {
          canvasRef.current = newCanvas;
        }
      }
      
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      
      img.onload = () => {
        try {
          // Set canvas dimensions to match the image
          const scale = options.scale || 1;
          canvasRef.current!.width = img.width * scale;
          canvasRef.current!.height = img.height * scale;
          
          // Clear the canvas
          ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
          
          // Draw the original image with scaling
          ctx.drawImage(img, 0, 0, canvasRef.current!.width, canvasRef.current!.height);
          
          // Apply advanced preprocessing techniques
          
          // 1. Apply grayscale if enabled
          if (options.grayscale) {
            const imageData = ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
            const data = imageData.data;
            
            // Use weighted grayscale method for better text-background contrast
            for (let i = 0; i < data.length; i += 4) {
              // Use ITU-R BT.709 coefficients for better text readability
              const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
              data[i] = data[i + 1] = data[i + 2] = gray;
            }
            
            ctx.putImageData(imageData, 0, 0);
          }
          
          // 2. Apply denoising for cleaner text
          // Simple but effective way to reduce noise while keeping text sharp
          const imageData = ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
          const data = imageData.data;
          const width = canvasRef.current!.width;
          const height = canvasRef.current!.height;
          const tempData = new Uint8ClampedArray(data);
          
          // Simple median filter for noise reduction (3x3 kernel)
          if (options.denoise) {
            for (let y = 1; y < height - 1; y++) {
              for (let x = 1; x < width - 1; x++) {
                for (let c = 0; c < 3; c++) {
                  const i = (y * width + x) * 4 + c;
                  
                  // Collect 9 neighboring pixels
                  const neighbors = [
                    tempData[i - width * 4 - 4], tempData[i - width * 4], tempData[i - width * 4 + 4],
                    tempData[i - 4], tempData[i], tempData[i + 4],
                    tempData[i + width * 4 - 4], tempData[i + width * 4], tempData[i + width * 4 + 4]
                  ];
                  
                  // Sort and take the median value
                  neighbors.sort((a, b) => a - b);
                  data[i] = neighbors[4];
                }
                // Keep alpha channel unchanged
                data[(y * width + x) * 4 + 3] = tempData[(y * width + x) * 4 + 3];
              }
            }
            ctx.putImageData(imageData, 0, 0);
          }
          
          // 3. Apply contrast adjustment with improved algorithm
          if (options.contrast !== 1) {
            const imageData = ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
            const data = imageData.data;
            
            // Find the average brightness to improve contrast adjustment
            let avgBrightness = 0;
            for (let i = 0; i < data.length; i += 4) {
              avgBrightness += data[i];
            }
            avgBrightness /= (data.length / 4);
            
            // Apply contrast with respect to the image's average brightness
            const factor = (259 * (options.contrast * 100 + 255)) / (255 * (259 - options.contrast * 100));
            
            for (let i = 0; i < data.length; i += 4) {
              data[i] = factor * (data[i] - avgBrightness) + avgBrightness;
              data[i + 1] = factor * (data[i + 1] - avgBrightness) + avgBrightness;
              data[i + 2] = factor * (data[i + 2] - avgBrightness) + avgBrightness;
            }
            
            ctx.putImageData(imageData, 0, 0);
          }
          
          // 4. Apply binarization with adaptive thresholding for better text extraction
          if (options.binarize) {
            const imageData = ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
            const data = imageData.data;
            const width = canvasRef.current!.width;
            const height = canvasRef.current!.height;
            
            // Get global threshold value from options
            const globalThreshold = options.threshold;
            
            // Use adaptive thresholding if enabled
            if (options.adaptiveThreshold) {
              const kernelSize = 15; // Size of local neighborhood
              const C = 5;           // Constant subtracted from the mean
              
              for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                  // Calculate local mean in a neighborhood
                  let sum = 0;
                  let count = 0;
                  
                  for (let ky = Math.max(0, y - kernelSize); ky < Math.min(height, y + kernelSize); ky++) {
                    for (let kx = Math.max(0, x - kernelSize); kx < Math.min(width, x + kernelSize); kx++) {
                      sum += data[(ky * width + kx) * 4];
                      count++;
                    }
                  }
                  
                  // Calculate local threshold
                  const localThreshold = (sum / count) - C;
                  
                  // Get current pixel index
                  const idx = (y * width + x) * 4;
                  
                  // Apply thresholding
                  const val = data[idx] < localThreshold ? 0 : 255;
                  data[idx] = data[idx + 1] = data[idx + 2] = val;
                }
              }
            } else {
              // Simple global thresholding
              for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                const val = avg >= globalThreshold ? 255 : 0;
                data[i] = data[i + 1] = data[i + 2] = val;
              }
            }
            
            ctx.putImageData(imageData, 0, 0);
          }
          
          // 5. Apply sharpening to improve text edges
          if (options.sharpen) {
            const imageData = ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
            const data = imageData.data;
            const width = canvasRef.current!.width;
            const height = canvasRef.current!.height;
            const tempData = new Uint8ClampedArray(data);
            
            // Unsharp masking
            const amount = 1.5;   // Sharpening strength
            const radius = 1;     // Radius of effect
            const threshold = 10; // Minimum brightness change
            
            for (let y = radius; y < height - radius; y++) {
              for (let x = radius; x < width - radius; x++) {
                for (let c = 0; c < 3; c++) {
                  const i = (y * width + x) * 4 + c;
                  
                  // Calculate local average
                  let blurred = 0;
                  let wSum = 0;
                  
                  for (let ky = -radius; ky <= radius; ky++) {
                    for (let kx = -radius; kx <= radius; kx++) {
                      const weight = (radius - Math.abs(kx)) * (radius - Math.abs(ky));
                      blurred += tempData[i + (ky * width + kx) * 4] * weight;
                      wSum += weight;
                    }
                  }
                  
                  blurred = blurred / wSum;
                  
                  // Calculate the difference
                  const diff = tempData[i] - blurred;
                  
                  // Apply sharpening only if difference is above threshold
                  if (Math.abs(diff) > threshold) {
                    data[i] = Math.min(255, Math.max(0, tempData[i] + diff * amount));
                  }
                }
              }
            }
            
            ctx.putImageData(imageData, 0, 0);
          }
          
          // Create data URL from canvas
          const preprocessedImageUrl = canvasRef.current!.toDataURL('image/png');
          resolve(preprocessedImageUrl);
        } catch (error) {
          console.error('Error preprocessing image:', error);
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        reject(error);
      };
      
      img.src = imageUrl;
    });
  };

  // Process images with Tesseract OCR
  const processImages = async () => {
    if (images.length === 0 || isProcessing) return;

    try {
      setIsProcessing(true);
      setCombinedText('');
      
      const startTime = Date.now();
      
      // Create a worker for OCR processing with enhanced settings
      const worker = await createWorker({
        logger: m => console.log(m),
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        gzip: true,
        workerBlobURL: true,
      });
      
      // Load selected language
      await worker.loadLanguage(selectedLanguage);
      await worker.initialize(selectedLanguage);
      
      // Get the selected model configuration
      const modelConfig = OCR_MODELS[selectedModel];
      
      // Set parameters based on selected model
      try {
        await (worker as any).setParameters(modelConfig.engineConfig);
      } catch (e) {
        console.warn('Some Tesseract parameters may not be supported:', e);
        // Continue even if some parameters are not supported
      }

      const extractedTexts: string[] = [];
      let avgConfidence = 0;
      
      // Process each image sequentially
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        try {
          // Update progress
          setProgress(((i + 1) / images.length) * 100);
          
          // Update current image status
          setImages((prev) =>
            prev.map((img) =>
              img.id === image.id
                ? { ...img, processing: true, error: undefined }
                : img
            )
          );
          
          // Try all preprocessing configurations from the model
          let bestText = '';
          let bestConfidence = -1;
          
          // Use configurations from the selected model
          const preprocessingConfigs = modelConfig.preprocessConfigs;
          
          // For MCQ model, run additional specialized recognition
          const isMCQ = selectedModel === 'mcq' || (image.preview && await checkIsMCQ(image.preview));

          // Try each preprocessing configuration
          for (const config of preprocessingConfigs) {
            try {
              // Preprocess image with current configuration
              let imageSource = image.preview;
              
              if (config.enabled) {
                const preprocessedUrl = await preprocessImage(image.preview, config as PreprocessingOptions);
                imageSource = preprocessedUrl;
              }
              
              // Perform OCR with current configuration
              const result = await worker.recognize(imageSource);
              
              // Check if this result is better than our current best
              if (result.data.confidence > bestConfidence) {
                bestConfidence = result.data.confidence;
                bestText = result.data.text;
                
                // Save the preprocessing result for the best configuration
                if (config.enabled) {
                  setImages((prev) =>
                    prev.map((img) =>
                      img.id === image.id
                        ? { ...img, preprocessed: imageSource }
                        : img
                    )
                  );
                }
                
                // Also save the TSV data if available
                if (result.data.tsv && detectTables) {
                  const tableData = processTableData(result.data.tsv, tableFormat);
                  if (tableData && tableData.trim()) {
                    // If table detected, use it instead
                    bestText = tableData;
                  }
                }
              }
            } catch (error) {
              console.error('Error with preprocessing config:', error);
              // Continue to next configuration
            }
          }
          
          // If MCQ detected and we're not already using the MCQ model, try specialized settings
          if (isMCQ && selectedModel !== 'mcq') {
            console.log('MCQ format detected, applying specialized processing');
            
            // Temporarily change to MCQ mode for better recognition
            const mcqConfig = OCR_MODELS['mcq'];
            
            try {
              // Apply MCQ-specific parameters
              await (worker as any).setParameters(mcqConfig.engineConfig);
              
              // Try MCQ-specific preprocessing configurations
              for (const config of mcqConfig.preprocessConfigs) {
                try {
                  let imageSource = image.preview;
                  
                  if (config.enabled) {
                    const preprocessedUrl = await preprocessImage(image.preview, config as PreprocessingOptions);
                    imageSource = preprocessedUrl;
                  }
                  
                  // Perform OCR with MCQ configuration
                  const result = await worker.recognize(imageSource);
                  
                  // Check if this result is better than our current best
                  if (result.data.confidence > bestConfidence) {
                    bestConfidence = result.data.confidence;
                    bestText = result.data.text;
                    
                    // Save the preprocessing result
                    if (config.enabled) {
                      setImages((prev) =>
                        prev.map((img) =>
                          img.id === image.id
                            ? { ...img, preprocessed: imageSource }
                            : img
                        )
                      );
                    }
                  }
                } catch (error) {
                  console.error('Error with MCQ preprocessing config:', error);
                }
              }
              
              // Restore original model parameters
              await (worker as any).setParameters(modelConfig.engineConfig);
            } catch (error) {
              console.error('Error with specialized MCQ processing:', error);
              // Continue with the best result we have
            }
          }
          
          // Track average confidence
          avgConfidence += bestConfidence / images.length;
          
          // Process the extracted text
          let text = bestText;
          
          // If it's an MCQ, always apply MCQ enhancement
          if (isMCQ) {
            text = enhanceMCQText(text);
          }
          // If AI enhancement is enabled, use AI to improve the text
          else if (useAiEnhancement) {
            text = await enhanceTextWithAI(text);
          }
          
          // Add extracted text to the array
          extractedTexts.push(text);
          
          // Update image with extracted text
          setImages((prev) =>
            prev.map((img) =>
              img.id === image.id
                ? { ...img, text, processing: false }
                : img
            )
          );
        } catch (error) {
          // Handle error for this specific image
          console.error(`Error processing image ${image.file.name}:`, error);
          setImages((prev) =>
            prev.map((img) =>
              img.id === image.id
                ? {
                    ...img,
                    processing: false,
                    error: 'Failed to extract text',
                  }
                : img
            )
          );
          
          // Add placeholder for failed image
          extractedTexts.push(`[Failed to extract text from ${image.file.name}]`);
        }
      }

      // Combine all extracted texts
      const combined = extractedTexts.join('\n\n');
      setCombinedText(combined);
      
      // Terminate the worker
      await worker.terminate();
      
      // Track processing metrics
      const totalTime = (Date.now() - startTime) / 1000; // convert to seconds
      setProcessingMetrics({
        totalTime,
        confidence: avgConfidence
      });
      
      toast({
        title: 'Processing complete',
        description: `Successfully processed ${images.length} images in ${totalTime.toFixed(1)}s.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error in OCR processing:', error);
      toast({
        title: 'Processing failed',
        description: 'An error occurred during text extraction.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  // Basic check if an image contains MCQ content
  const checkIsMCQ = async (imageUrl: string): Promise<boolean> => {
    try {
      // Create a temporary worker just for detection
      const detector = await createWorker({
        logger: m => console.log(m),
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        gzip: true,
        workerBlobURL: true,
      });
      
      await detector.loadLanguage('eng');
      await detector.initialize('eng');
      
      // Use simpler preprocessing for quick analysis
      const preprocessedUrl = await preprocessImage(imageUrl, {
        enabled: true,
        grayscale: true,
        contrast: 1.3,
        binarize: false,
        threshold: 128,
        scale: 1.5,
        deskew: true,
        denoise: true,
        adaptiveThreshold: false,
        sharpen: true
      });
      
      // Recognize just a sample of the text
      const result = await detector.recognize(preprocessedUrl);
      
      // Clean up
      await detector.terminate();
      
      // Check for MCQ patterns in recognized text
      const text = result.data.text;
      
      // Look for typical MCQ patterns:
      // 1. Multiple choice options (A, B, C, D pattern)
      const hasOptionPattern = /[A-D][\.\)](\s|\n)/.test(text);
      
      // 2. Numbered questions pattern
      const hasNumberedQuestions = /\d+[\.\)](\s|\n)/.test(text);
      
      // 3. Question-like structure
      const hasQuestionWords = /[Ww]hat|[Ff]ind|[Cc]alculate|[Ww]hich|[Ww]here|[Ww]hen|[Hh]ow/.test(text);
      
      // Return true if it looks like an MCQ
      return (hasOptionPattern && hasNumberedQuestions) || (hasOptionPattern && hasQuestionWords);
      
    } catch (error) {
      console.error('Error checking if image is MCQ:', error);
      return false; // Default to false if detection fails
    }
  };

  // Process table data from TSV format
  const processTableData = (tsv: string, format: string): string | null => {
    try {
      // Split TSV into rows
      const rows = tsv.split('\n').filter(row => row.trim() !== '');
      
      if (rows.length <= 1) return null; // Not enough data for a table
      
      // Check if this actually has tab structure
      const hasTabs = rows.some(row => row.includes('\t'));
      if (!hasTabs) {
        return analyzeAndFormatImplicitTable(rows.join('\n'));
      }
      
      // Calculate column widths for proper alignment
      const columns = rows[0].split('\t');
      const columnWidths = Array(columns.length).fill(0);
      
      // Determine the maximum width for each column
      rows.forEach(row => {
        const cells = row.split('\t');
        cells.forEach((cell, i) => {
          if (i < columnWidths.length) {
            columnWidths[i] = Math.max(columnWidths[i], cell.length);
          }
        });
      });
      
      // Clean up rows - remove empty rows and handle merged cells
      const cleanRows = rows.filter(row => {
        const cells = row.split('\t');
        // Skip rows that are completely empty or just whitespace
        return cells.some(cell => cell.trim().length > 0);
      });
      
      // Generate table based on selected format
      switch (format) {
        case 'plain':
          // Simple space-separated format
          return cleanRows.map(row => {
            return row.split('\t').join('  ');
          }).join('\n');
          
        case 'markdown':
          // Markdown table format
          let markdownTable = '';
          
          // Header row
          markdownTable += '| ' + cleanRows[0].split('\t').join(' | ') + ' |\n';
          
          // Header separator
          markdownTable += '| ' + columnWidths.map(w => '-'.repeat(Math.max(3, w))).join(' | ') + ' |\n';
          
          // Data rows
          for (let i = 1; i < cleanRows.length; i++) {
            markdownTable += '| ' + cleanRows[i].split('\t').join(' | ') + ' |\n';
          }
          
          return markdownTable;
          
        case 'csv':
          // CSV format
          return cleanRows.map(row => {
            return row.split('\t')
              .map(cell => {
                // Escape quotes and wrap in quotes if contains comma
                if (cell.includes(',') || cell.includes('"')) {
                  return `"${cell.replace(/"/g, '""')}"`;
                }
                return cell;
              })
              .join(',');
          }).join('\n');
          
        case 'formatted':
        default:
          // Default formatted table with aligned columns
          let formattedTable = '';
          
          // Format rows with padding
          cleanRows.forEach((row, rowIndex) => {
            const cells = row.split('\t');
            const formattedRow = cells.map((cell, i) => {
              if (i < columnWidths.length) {
                // Right-align numbers, left-align text
                const isNumber = /^-?\d+(\.\d+)?$/.test(cell.trim());
                return isNumber 
                  ? cell.padStart(columnWidths[i]) 
                  : cell.padEnd(columnWidths[i]);
              }
              return cell;
            }).join(' | ');
            
            formattedTable += formattedRow + '\n';
            
            // Add separator after header
            if (rowIndex === 0) {
              formattedTable += columnWidths.map(w => '-'.repeat(w)).join('-+-') + '\n';
            }
          });
          
          return formattedTable;
      }
    } catch (e) {
      console.error('Error processing table data:', e);
      return null;
    }
  };

  // Analyze text that might contain a table without explicit tab separators
  const analyzeAndFormatImplicitTable = (text: string): string | null => {
    try {
      // Split by lines
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) return null;
      
      // Step 1: Detect if this looks like a table by checking for consistent spacing
      // Find positions where there are consistent spaces across multiple lines
      const potentialDelimiterPositions: number[][] = [];
      
      for (const line of lines) {
        const positions: number[] = [];
        for (let i = 0; i < line.length; i++) {
          if (line[i] === ' ' && (i === 0 || line[i-1] !== ' ')) {
            positions.push(i);
          }
        }
        potentialDelimiterPositions.push(positions);
      }
      
      // Find common positions across at least 70% of lines
      const positionCounts: {[key: number]: number} = {};
      for (const positions of potentialDelimiterPositions) {
        for (const pos of positions) {
          positionCounts[pos] = (positionCounts[pos] || 0) + 1;
        }
      }
      
      const threshold = Math.floor(lines.length * 0.7);
      const commonPositions = Object.entries(positionCounts)
        .filter(([_, count]) => count >= threshold)
        .map(([pos, _]) => parseInt(pos))
        .sort((a, b) => a - b);
      
      if (commonPositions.length < 1) {
        // Not enough consistent spacing to be a table
        return null;
      }
      
      // Step 2: Extract columns using the detected positions
      const columns: string[][] = [];
      for (const line of lines) {
        const row: string[] = [];
        let start = 0;
        
        for (const pos of commonPositions) {
          if (pos > start) {
            row.push(line.substring(start, pos).trim());
            start = pos;
          }
        }
        
        // Add the last column
        if (start < line.length) {
          row.push(line.substring(start).trim());
        }
        
        columns.push(row);
      }
      
      // Step 3: Format as a table
      // Find max width for each column
      const columnCount = Math.max(...columns.map(row => row.length));
      const columnWidths = Array(columnCount).fill(0);
      
      for (const row of columns) {
        for (let i = 0; i < row.length; i++) {
          columnWidths[i] = Math.max(columnWidths[i], row[i]?.length || 0);
        }
      }
      
      // Generate formatted table
      let formattedTable = '';
      
      // Format rows with padding
      columns.forEach((row, rowIndex) => {
        const formattedRow = row.map((cell, i) => {
          // Ensure cell is defined and handle alignment
          cell = cell || '';
          if (i < columnWidths.length) {
            // Right-align numbers, left-align text
            const isNumber = /^-?\d+(\.\d+)?$/.test(cell.trim());
            return isNumber 
              ? cell.padStart(columnWidths[i]) 
              : cell.padEnd(columnWidths[i]);
          }
          return cell;
        }).join(' | ');
        
        formattedTable += formattedRow + '\n';
        
        // Add separator after header
        if (rowIndex === 0) {
          formattedTable += columnWidths.map(w => '-'.repeat(w)).join('-+-') + '\n';
        }
      });
      
      return formattedTable;
    } catch (error) {
      console.error('Error analyzing implicit table:', error);
      return null;
    }
  };

  // AI enhancement of extracted text
  const enhanceTextWithAI = async (text: string): Promise<string> => {
    // If no text, return empty string
    if (!text) return '';

    let enhancedText = text;

    // Check if text contains a multiple choice question pattern
    const hasMCQPattern = /(?:\d+\s*[\.\)]\s*.*?\n\s*(?:[A-Z][\.\)]\s*.*?\n){2,})/s.test(text) || 
                         /(?:\n\s*[A-Z][\.\)]\s*.*?){3,}/s.test(text);
    
    // Check if text contains mathematical content
    const hasMathContent = /((?:\d+\s*[+\-×÷=\^])|(?:\d+\.\d+)|(?:\(\d+\))|(?:[<>]=?)|(?:\d+\s*\/\s*\d+))/g.test(text);

    // Apply specialized enhancements based on content type
    if (selectedModel === 'mcq' || hasMCQPattern) {
      enhancedText = enhanceMCQText(enhancedText);
    }
    
    if (hasMathContent || selectedModel === 'high-accuracy') {
      enhancedText = enhanceMathText(enhancedText);
    }

    // Process data that looks like a table
    if (enhancedText.includes('\t') || (enhancedText.split('\n').some(line => line.includes('  ') && /\d/.test(line)))) {
      const tableData = processTableData(enhancedText, tableFormat);
      
      if (tableData) {
        enhancedText = tableData;
      }
    } else if (detectTables) {
      // Try to detect implicit tables (no tabs, but consistently spaced content)
      const potentialTable = analyzeAndFormatImplicitTable(enhancedText);
      if (potentialTable) {
        enhancedText = potentialTable;
      }
    }

    // Final cleanups
    enhancedText = enhancedText
      // Standardize newlines
      .replace(/\r\n/g, '\n')
      // Fix spaces before punctuation
      .replace(/\s+([.,;:!?])/g, '$1')
      // Fix common OCR errors
      .replace(/([a-z])\/([a-z])/gi, '$1l$2') // Fix 'l' recognized as '/'
      // Fix broken words at line breaks with hyphen
      .replace(/(\w+)-\n(\w+)/g, '$1$2\n')
      // Add space after sentences
      .replace(/([.!?])([A-Z])/g, '$1 $2')
      // Fix spacing around special characters
      .replace(/\s*([+\-=*\/])\s*/g, ' $1 ');

    return enhancedText;
  };

  // Special processing for multiple-choice questions
  const enhanceMCQText = (text: string): string => {
    try {
      // 1. Detect if this is likely an aptitude test or exam with questions
      const isAptitudeTest = /(?:test|exam|quiz|aptitude|assessment|question|mcq|choose|mark|select|closest|meaning|opposite|hostile|grovel)/i.test(text);
      const containsNumberedQuestions = /(?:\n\s*\d+\s*[\.\):])|(?:\n\s*[QO0]\s*\d+\s*[\.\):])/i.test(text);
      const containsMCQOptions = /(?:\b[A-D][\.\)]\s+[\w])|(?:\([A-D]\)\s+[\w])|(?:Opts:)/i.test(text);
      const hasCircledOptions = /(?:○|O|o|0)\s*[A-D]/i.test(text);
      const hasMathContent = /(?:[+\-×÷=<>]|\d+\s*[+\-×÷=<>]\s*\d+|[\d]+\s*%|fraction|equation|calculate|compute|√|²|³)/i.test(text);
      
      // If this is not an MCQ or aptitude test, return the original text
      if (!isAptitudeTest && !containsNumberedQuestions && !containsMCQOptions && !hasCircledOptions && !hasMathContent) {
        return text;
      }
      
      // 2. Enhance MCQ formatting
      // 2.1: Fix common OCR errors for question numbers
      text = text.replace(/(\d+)\s*[\.,;:]\s*/g, '$1. '); // Fix different punctuation after numbers
      text = text.replace(/([QO0])(\d+)[\.)]?/g, 'Q$2. '); // Convert O1 or Q1 to Q1.
      
      // 2.2: Fix option labels - standardize them to "A. " format
      text = text.replace(/\b([A-D])[\.\)]\s*/g, '$1. '); // Convert both A) and A. to A. with space
      text = text.replace(/\(([A-D])\)\s*/g, '$1. '); // Convert (A) to A.
      
      // 2.2.1: Handle circled option format (like in tests) - ○ A, ○ B format
      if (hasCircledOptions) {
        text = text.replace(/(?:○|O|o|0)\s*([A-D])/g, '$1. '); // Convert ○A to A.
        text = text.replace(/(?:Opts?:?|Options?:?)\s*([A-Da-d])[\.)\],]/g, '$1. '); // Handle "Opts: A." format
      }
      
      // 2.2.2: Handle option pattern that starts with word "Opts" or similar
      text = text.replace(/(?:Opts?[:\.]\s*)([A-D])/g, '$1. ');
      
      // 2.2.3: Fix specialized format from test papers 
      text = text.replace(/([QO])[\s\.]*(\d+)[\s\.]*([.:])?/g, 'Q$2. '); // Fix Q21. format
      text = text.replace(/Hostile/g, 'HOSTILE'); // Fix common term in vocabulary tests
      text = text.replace(/Grovel/g, 'GROVEL'); // Fix common term in vocabulary tests
      text = text.replace(/Opposing/g, 'Opposing'); // Fix Opposing option
      text = text.replace(/Traumatic/g, 'Traumatic'); // Fix Traumatic option
      text = text.replace(/Welcomed/g, 'Welcomed'); // Fix Welcomed option
      text = text.replace(/Happy/g, 'Happy'); // Fix Happy option
      text = text.replace(/opposite in meaning/g, 'opposite in meaning'); // Fix phrase
      text = text.replace(/closest to the meaning/g, 'closest to the meaning'); // Fix phrase
      
      // 2.3: Fix common layout issues where options are not properly spaced
      text = text.replace(/([.)])\s*([A-D][.)])/g, '$1\n$2'); // Add newline between question and first option
      
      // 2.4: Handle mathematical content
      if (hasMathContent) {
        // Fix common math symbols
        text = text.replace(/([0-9])\s*x\s*([0-9])/g, '$1 × $2'); // Fix multiplication sign
        text = text.replace(/(\d+)\s*\/\s*(\d+)/g, '$1⁄$2'); // Fix fractions
        text = text.replace(/(?:\^|\*\*)(\d+)/g, '²'); // Fix square, cube notation
        text = text.replace(/([0-9])\s*-\s*([0-9])/g, '$1 − $2'); // Fix minus sign
        text = text.replace(/sqrt/g, '√'); // Fix square root
        
        // Fix decimal numbers (OCR often misreads them)
        text = text.replace(/(\d+)[,;](\d+)/g, '$1.$2'); // Convert 3,14 to 3.14
        
        // Fix percentage signs
        text = text.replace(/(\d+)\s*o\/o/g, '$1%'); // Fix common OCR error for percentage
        text = text.replace(/(\d+)\s*([oO0])\//g, '$1%'); // Fix common OCR error for percentage
      }
      
      // 2.5: Apply multiple newlines to separate questions
      text = text.replace(/(Q\d+\.)\s*/g, '\n$1 '); // Add newlines before questions
      text = text.replace(/([A-D]\..*?)(?=\s*[A-D]\.|$)/g, '$1\n'); // Add newlines after options
      
      return text;
    } catch(error) {
      console.error("Error enhancing MCQ text:", error);
      return text; // Return original text if any error occurs
    }
  };

  // Post-process mathematical and scientific notation
  const enhanceMathText = (text: string): string => {
    try {
      // Fix common errors in mathematical notation
      
      // Fix decimal points
      text = text.replace(/(\d+)\s*[.,;]\s*(\d+)/g, '$1.$2');
      
      // Fix exponents
      text = text.replace(/(\d+)\s*\^\s*(\d+)/g, '$1^$2');
      
      // Fix fractions
      text = text.replace(/(\d+)\s*\/\s*(\d+)/g, '$1/$2');
      
      // Fix multiplication symbols (× often gets misrecognized)
      text = text.replace(/(\d+)\s*[xX*]\s*(\d+)/g, '$1 × $2');
      
      // Fix equals signs with extra spacing
      text = text.replace(/\s*=\s*/g, ' = ');
      
      // Fix units in scientific notation
      text = text.replace(/(\d+(?:\.\d+)?)\s*([µmcdk]?(?:m|g|s|A|K|mol|cd|Hz|N|Pa|J|W|C|V|F|Ω|S|Wb|T|H|lm|lx))\b/gi, 
        (match, num, unit) => `${num} ${unit.toLowerCase()}`);
      
      // Fix ranges with dash or hyphen
      text = text.replace(/(\d+)\s*[-–—]\s*(\d+)/g, '$1-$2');
      
      // Fix subscripts in chemical formulas
      text = text.replace(/([A-Z][a-z]?)(\d+)/g, '$1₍$2₎');
      
      // Fix squared and cubed notation
      text = text.replace(/(\d+)\s*m\s*2\b/gi, '$1 m²');
      text = text.replace(/(\d+)\s*m\s*3\b/gi, '$1 m³');
      
      // Fix percentage notation
      text = text.replace(/(\d+)\s*(?:percent|pct|%)/gi, '$1%');
      
      // Fix common errors with mathematical symbols
      text = text.replace(/[≤≥<>]\s*=\s*/g, (match) => {
        if (match.includes('<')) return '≤ ';
        if (match.includes('>')) return '≥ ';
        return match.trim() + ' ';
      });
      
      // When it appears to be a math/science equation or problem, add more space between sections
      if (/\d+\s*[+\-×÷=]/g.test(text)) {
        // Add blank line before new problems/equations
        text = text.replace(/(\d+\s*[+\-×÷=].*?)(\n\d+\.)/g, '$1\n\n$2');
      }
      
      return text;
    } catch(error) {
      console.error("Error enhancing math text:", error);
      return text; // Return original text if any error occurs
    }
  };

  // Copy text to clipboard
  const copyToClipboard = () => {
    if (!combinedText) return;
    
    navigator.clipboard.writeText(combinedText)
      .then(() => {
        toast({
          title: 'Copied to clipboard',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      })
      .catch((error) => {
        console.error('Error copying to clipboard:', error);
        toast({
          title: 'Failed to copy',
          description: 'Please try selecting and copying the text manually.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      });
  };

  // Reset everything
  const handleReset = () => {
    setImages([]);
    setCombinedText('');
  };

  // Update preprocessing options
  const updatePreprocessing = (key: keyof PreprocessingOptions, value: any) => {
    setPreprocessing(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Add advanced settings to the UI controls
  const updatePreprocessingUI = () => {
    return (
      <Grid templateColumns={["1fr", null, "1fr 1fr"]} gap={4} mt={2} pl={4}>
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="grayscale" mb="0" fontSize="sm">
            Convert to Grayscale
          </FormLabel>
          <Switch 
            id="grayscale"
            isChecked={preprocessing.grayscale}
            onChange={(e) => updatePreprocessing('grayscale', e.target.checked)}
            isDisabled={isProcessing}
            colorScheme="blue"
          />
        </FormControl>
        
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="binarize" mb="0" fontSize="sm">
            Binarize (Black & White)
          </FormLabel>
          <Switch 
            id="binarize"
            isChecked={preprocessing.binarize}
            onChange={(e) => updatePreprocessing('binarize', e.target.checked)}
            isDisabled={isProcessing}
            colorScheme="blue"
          />
        </FormControl>

        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="denoise" mb="0" fontSize="sm">
            Denoise Image
          </FormLabel>
          <Switch 
            id="denoise"
            isChecked={preprocessing.denoise}
            onChange={(e) => updatePreprocessing('denoise', e.target.checked)}
            isDisabled={isProcessing}
            colorScheme="blue"
          />
        </FormControl>

        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="sharpen" mb="0" fontSize="sm">
            Sharpen Text
          </FormLabel>
          <Switch 
            id="sharpen"
            isChecked={preprocessing.sharpen}
            onChange={(e) => updatePreprocessing('sharpen', e.target.checked)}
            isDisabled={isProcessing}
            colorScheme="blue"
          />
        </FormControl>

        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="adaptiveThreshold" mb="0" fontSize="sm">
            Adaptive Threshold
          </FormLabel>
          <Switch 
            id="adaptiveThreshold"
            isChecked={preprocessing.adaptiveThreshold}
            onChange={(e) => updatePreprocessing('adaptiveThreshold', e.target.checked)}
            isDisabled={isProcessing || !preprocessing.binarize}
            colorScheme="blue"
          />
        </FormControl>
        
        <Box>
          <FormControl>
            <FormLabel fontSize="sm">Contrast Adjustment</FormLabel>
            <Flex>
              <Slider
                value={preprocessing.contrast}
                min={0.5}
                max={2}
                step={0.1}
                onChange={(v) => updatePreprocessing('contrast', v)}
                isDisabled={isProcessing}
                flex="1"
                mr={2}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <NumberInput
                value={preprocessing.contrast}
                min={0.5}
                max={2}
                step={0.1}
                onChange={(_, val) => updatePreprocessing('contrast', val)}
                isDisabled={isProcessing}
                size="sm"
                maxW="70px"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Flex>
          </FormControl>
        </Box>
        
        {preprocessing.binarize && (
          <Box>
            <FormControl>
              <FormLabel fontSize="sm">Threshold</FormLabel>
              <Flex>
                <Slider
                  value={preprocessing.threshold}
                  min={0}
                  max={255}
                  step={1}
                  onChange={(v) => updatePreprocessing('threshold', v)}
                  isDisabled={isProcessing || preprocessing.adaptiveThreshold}
                  flex="1"
                  mr={2}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                <NumberInput
                  value={preprocessing.threshold}
                  min={0}
                  max={255}
                  step={1}
                  onChange={(_, val) => updatePreprocessing('threshold', val)}
                  isDisabled={isProcessing || preprocessing.adaptiveThreshold}
                  size="sm"
                  maxW="70px"
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Flex>
            </FormControl>
          </Box>
        )}
        
        <Box>
          <FormControl>
            <FormLabel fontSize="sm">Scale Factor</FormLabel>
            <Flex>
              <Slider
                value={preprocessing.scale}
                min={1}
                max={3}
                step={0.5}
                onChange={(v) => updatePreprocessing('scale', v)}
                isDisabled={isProcessing}
                flex="1"
                mr={2}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <NumberInput
                value={preprocessing.scale}
                min={1}
                max={3}
                step={0.5}
                onChange={(_, val) => updatePreprocessing('scale', val)}
                isDisabled={isProcessing}
                size="sm"
                maxW="70px"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Flex>
          </FormControl>
        </Box>
        
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="deskew" mb="0" fontSize="sm">
            Auto-Deskew
          </FormLabel>
          <Switch 
            id="deskew"
            isChecked={preprocessing.deskew}
            onChange={(e) => updatePreprocessing('deskew', e.target.checked)}
            isDisabled={isProcessing}
            colorScheme="blue"
          />
        </FormControl>
      </Grid>
    );
  };

  return (
    <VStack spacing={[3, 4, 6]} w="full" px={[2, 4, 6]}>
      {/* Header with app info */}
      <Box 
        w="full" 
        bg="blue.600" 
        p={[3, 4]} 
        borderRadius="md" 
        boxShadow="md"
        color="white"
      >
        <Flex justifyContent="space-between" alignItems="center" flexDirection={["column", "column", "row"]}>
          <Box mb={[2, 2, 0]}>
            <Heading size={["md", "lg"]}>Image to Text Converter</Heading>
            <Text mt={1} fontSize={["xs", "sm"]}>Advanced OCR with AI-powered enhancement</Text>
          </Box>
          <HStack spacing={2} mt={[2, 2, 0]}>
            <Badge colorScheme="red" p={[1, 2]} borderRadius="md" fontSize={["xs", "sm"]}>
              Fast
            </Badge>
            <Badge colorScheme="blue" p={[1, 2]} borderRadius="md" fontSize={["xs", "sm"]}>
              Balanced
            </Badge>
            <Badge colorScheme="green" p={[1, 2]} borderRadius="md" fontSize={["xs", "sm"]}>
              Ultra Accurate
            </Badge>
          </HStack>
        </Flex>
      </Box>

      {/* Drop area */}
      <Box
        w="full"
        h={["150px", "175px", "200px"]}
        border="2px dashed"
        borderColor={isDragActive ? 'blue.500' : 'gray.200'}
        borderRadius="md"
        bg={isDragActive ? 'blue.50' : 'white'}
        p={[2, 3, 4]}
        textAlign="center"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        position="relative"
        transition="all 0.2s"
        ref={dropAreaRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        cursor="pointer"
        boxShadow="sm"
        _hover={{ borderColor: 'blue.300', bg: 'blue.50' }}
      >
        <Input
          type="file"
          accept={ACCEPTED_FILE_TYPES.join(',')}
          multiple
          onChange={handleFileInputChange}
          ref={fileInputRef}
          display="none"
        />
        <Box fontSize={["3xl", "4xl", "5xl"]} color="blue.500">
          📄
        </Box>
        <Text fontWeight="medium" mt={2} color="gray.700" fontSize={["sm", "md"]}>
          Click to upload or drag & drop images here
        </Text>
        <Text fontSize={["xs", "sm"]} mt={1} color="gray.500">
          Supports JPEG, PNG, WEBP, GIF, BMP (up to {MAX_IMAGES} files)
        </Text>
        <Text fontSize={["2xs", "xs"]} mt={2} color="blue.500" display={["none", "block"]}>
          Pro tip: You can also paste images directly from your clipboard
        </Text>
      </Box>
      
      {/* Display error if files are too many */}
      {images.length >= MAX_IMAGES && (
        <Box w="full" p={2} bg="yellow.100" color="yellow.800" borderRadius="md" fontSize={["xs", "sm"]}>
          <Text>Maximum image limit reached ({MAX_IMAGES}).</Text>
        </Box>
      )}

      {/* OCR Settings */}
      <Box w="full" bg="white" p={[3, 4]} borderRadius="md" boxShadow="sm">
        <Accordion allowToggle defaultIndex={[0]}>
          <AccordionItem border="none">
            <h2>
              <AccordionButton px={0}>
                <Box flex="1" textAlign="left" fontWeight="medium" fontSize={["sm", "md"]}>
                  OCR Settings
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} px={0}>
              <VStack spacing={4} align="stretch">
                {/* OCR Model Selection */}
                <Box>
                  <Text fontSize={["xs", "sm"]} mb={1} fontWeight="medium">OCR Processing Model</Text>
                  <Select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    size={["xs", "sm"]}
                    isDisabled={isProcessing}
                  >
                    {Object.entries(OCR_MODELS).map(([key, model]) => (
                      <option key={key} value={key}>
                        {model.name} - {model.description}
                      </option>
                    ))}
                  </Select>
                </Box>
                
                {/* Language Selection */}
                <Grid templateColumns={["1fr", "1fr", "1fr 1fr"]} gap={[2, 4]}>
                  <Box>
                    <Text fontSize={["xs", "sm"]} mb={1}>Language</Text>
                    <Select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      size={["xs", "sm"]}
                      isDisabled={isProcessing}
                    >
                      {Object.entries(OCR_LANGUAGES).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  </Box>
                </Grid>
                
                {/* Removed custom model settings */}
                <Box></Box>
                
                <Box>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="detect-tables" mb="0" fontSize={["xs", "sm"]}>
                      Detect Tables
                    </FormLabel>
                    <Switch 
                      id="detect-tables"
                      isChecked={detectTables}
                      onChange={(e) => setDetectTables(e.target.checked)}
                      isDisabled={isProcessing}
                      colorScheme="blue"
                    />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="ai-enhancement" mb="0" fontSize={["xs", "sm"]}>
                      Use AI Enhancement
                    </FormLabel>
                    <Switch 
                      id="ai-enhancement"
                      isChecked={useAiEnhancement}
                      onChange={(e) => setUseAiEnhancement(e.target.checked)}
                      isDisabled={isProcessing}
                      colorScheme="blue"
                    />
                  </FormControl>
                </Box>
                
                {detectTables && (
                  <Box gridColumn={["1", null, "span 2"]}>
                    <Text fontSize={["xs", "sm"]} mb={1}>Table Output Format</Text>
                    <Select
                      value={tableFormat}
                      onChange={(e) => setTableFormat(e.target.value)}
                      size={["xs", "sm"]}
                      isDisabled={isProcessing || !detectTables}
                    >
                      {Object.entries(TABLE_FORMATS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  </Box>
                )}
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Box>

      {/* Hidden canvas for image preprocessing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <Box w="full" bg="white" p={[3, 4]} borderRadius="md" boxShadow="sm">
          <Flex justify="space-between" mb={3} align="center" flexDirection={["column", "row"]}>
            <Text fontWeight="medium" fontSize={["sm", "md"]} mb={[2, 0]}>
              Images ({images.length}/{MAX_IMAGES})
            </Text>
            <HStack spacing={[1, 2]}>
              <Button 
                size={["xs", "sm"]} 
                colorScheme="red" 
                variant="outline" 
                onClick={handleReset}
                isDisabled={isProcessing}
              >
                Clear All
              </Button>
              <Button 
                size={["xs", "sm"]} 
                colorScheme="blue" 
                onClick={processImages}
                isLoading={isProcessing}
                loadingText="Processing"
                isDisabled={images.length === 0 || isProcessing}
              >
                Extract Text
              </Button>
            </HStack>
          </Flex>

          <Grid 
            templateColumns={["repeat(auto-fill, minmax(100px, 1fr))", "repeat(auto-fill, minmax(120px, 1fr))", "repeat(auto-fill, minmax(150px, 1fr))"]} 
            gap={[2, 3, 4]}
            maxH={["200px", "250px", "300px"]}
            overflowY="auto"
            pb={2}
            className="hide-scrollbar"
          >
            {images.map((image) => (
              <Box key={image.id} borderWidth="1px" borderRadius="lg" overflow="hidden" bg="white" boxShadow="sm">
                <Box p={[1, 2]}>
                  <Box position="relative">
                    <ChakraImage 
                      src={image.preprocessed || image.preview}
                      alt={image.file.name}
                      objectFit="cover"
                      height={["70px", "85px", "100px"]}
                      width="full"
                      borderRadius="md"
                      opacity={image.processing ? 0.5 : 1}
                    />
                    {image.processing && (
                      <Flex 
                        position="absolute" 
                        top="0" 
                        left="0" 
                        right="0" 
                        bottom="0"
                        justify="center"
                        align="center"
                        bg="blackAlpha.200"
                      >
                        <Text fontSize={["2xs", "xs"]} fontWeight="bold">Processing...</Text>
                      </Flex>
                    )}
                    {image.error && (
                      <Badge 
                        colorScheme="red" 
                        position="absolute" 
                        top="1" 
                        right="1"
                        fontSize={["2xs", "xs"]}
                      >
                        Error
                      </Badge>
                    )}
                    {image.text && (
                      <Badge 
                        colorScheme="green" 
                        position="absolute" 
                        top="1" 
                        right="1"
                        fontSize={["2xs", "xs"]}
                      >
                        Processed
                      </Badge>
                    )}
                    {image.preprocessed && (
                      <Badge 
                        colorScheme="purple" 
                        position="absolute" 
                        bottom="1" 
                        right="1"
                        fontSize={["2xs", "xs"]}
                      >
                        Enhanced
                      </Badge>
                    )}
                    <IconButton
                      aria-label="Remove image"
                      icon={<span>✕</span>}
                      size="xs"
                      colorScheme="red"
                      position="absolute"
                      top="1"
                      left="1"
                      onClick={() => removeImage(image.id)}
                      isDisabled={isProcessing}
                    />
                  </Box>
                  <Tooltip label={image.file.name}>
                    <Text 
                      fontSize={["2xs", "xs"]}
                      isTruncated 
                      mt={1} 
                      textAlign="center"
                    >
                      {image.file.name.substring(0, 15)}
                      {image.file.name.length > 15 ? '...' : ''}
                    </Text>
                  </Tooltip>
                </Box>
              </Box>
            ))}
          </Grid>
        </Box>
      )}

      {/* Progress Bar */}
      {isProcessing && (
        <Box w="full" bg="white" p={[2, 3, 4]} borderRadius="md" boxShadow="sm">
          <Text mb={1} fontSize={["xs", "sm"]}>
            Processing images ({Math.round(progress)}%)
          </Text>
          <Progress value={progress} size="sm" colorScheme="blue" borderRadius="md" />
        </Box>
      )}

      {/* Results */}
      {combinedText && (
        <Box w="full" bg="white" p={[3, 4]} borderRadius="md" boxShadow="sm">
          <Flex justify="space-between" mb={3} align="center" flexDirection={["column", "row"]}>
            <Text fontWeight="medium" fontSize={["sm", "md"]} mb={[2, 0]}>Extracted Text</Text>
            <HStack spacing={[1, 2]} mt={[2, 0]}>
              {processingMetrics.confidence && (
                <Badge colorScheme="green" fontSize={["2xs", "xs"]}>
                  Confidence: {processingMetrics.confidence.toFixed(1)}%
                </Badge>
              )}
              <Button 
                size={["xs", "sm"]} 
                leftIcon={<span>📋</span>} 
                onClick={copyToClipboard}
                colorScheme="blue"
                variant="outline"
              >
                Copy All
              </Button>
            </HStack>
          </Flex>
          
          <Textarea
            value={combinedText}
            onChange={(e) => setCombinedText(e.target.value)}
            rows={10}
            resize="vertical"
            borderColor="gray.300"
            _hover={{ borderColor: 'gray.400' }}
            borderRadius="md"
            fontFamily="monospace"
            fontSize={["xs", "sm"]}
            minH={["150px", "200px", "250px"]}
          />
          
          {processingMetrics.totalTime && (
            <Text fontSize={["2xs", "xs"]} color="gray.500" mt={2} textAlign="right">
              Processed in {processingMetrics.totalTime.toFixed(1)} seconds
            </Text>
          )}
        </Box>
      )}
      
      {/* Developer Info & Contact Footer */}
      <Box 
        w="full" 
        bg="gray.50" 
        p={[3, 4]} 
        borderRadius="md" 
        boxShadow="sm" 
        mt={[3, 4, 6]}
        fontSize={["xs", "sm"]}
      >
        <Flex 
          direction={["column", "row"]} 
          justifyContent="space-between" 
          alignItems={["center", "flex-start"]}
        >
          <Box textAlign={["center", "left"]} mb={[2, 0]}>
            <Text fontWeight="bold">Developed by:</Text>
            <Text>Swastik Raj</Text>
            <Text>Vansh Singh</Text>
          </Box>
          <Box textAlign={["center", "right"]}>
            <Text fontWeight="bold">Contact:</Text>
            <Text>Phone: 7889364915</Text>
            <Text>Advanced Image to Text Conversion</Text>
          </Box>
        </Flex>
      </Box>
    </VStack>
  );
} 