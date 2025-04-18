# Image to Text Converter

A modern web application that extracts text from images using OCR (Optical Character Recognition) technology.

## Features

- Upload images via file selection, drag-and-drop, or clipboard paste
- Support for common image formats (JPEG, PNG, WEBP, GIF, BMP)
- Process up to 30 images at once
- Multiple OCR processing models:
  - Standard: Balanced performance for most documents
  - High Accuracy: Maximum text extraction quality for difficult images
  - Fast Mode: Quick results with good accuracy
  - Table Detection: Optimized for documents with tables
  - Custom Settings: Fine-tune your own preprocessing parameters
- Advanced image preprocessing options
- AI-powered text enhancement for better decimal point and number recognition
- Table structure detection and formatting options
- Display and combine extracted text from all images
- Copy extracted text to clipboard with one click
- Responsive design for all screen sizes

## Technologies Used

- Next.js
- React
- TypeScript
- Chakra UI
- Tesseract.js (OCR engine)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository or download the source code
2. Install dependencies:

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to use the application.

### Building for Production

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Usage

1. Upload images by:
   - Clicking the upload area and selecting files
   - Dragging and dropping files into the upload area
   - Copying an image and pasting anywhere on the page

2. Choose the appropriate OCR model for your needs:
   - Standard: Good for most documents
   - High Accuracy: Best for complex text with numbers and special characters
   - Fast Mode: When speed is more important than perfect accuracy
   - Table Detection: Optimized for spreadsheets and tabular data
   - Custom Settings: When you need to fine-tune the preprocessing

3. Configure additional options:
   - Enable AI enhancement for better number and table detection
   - Select table output format if your images contain tables
   - Adjust image preprocessing options for difficult images

4. Click "Extract Text" to process the images

5. View the extracted text in the text area below

6. Click "Copy All" to copy the extracted text to your clipboard

## License

ISC #   I m a g e - T o - T e x t  
 #   I m a g e - t o - t e x t  
 