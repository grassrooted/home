import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// ✅ Use official CDN worker — works every time
pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

export default function PDFBoxParser() {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div>
      <h2>PDF Upload</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {file && (
        <Document
          file={file}
          onLoadSuccess={handleLoadSuccess}
          onLoadError={console.error}
        >
          {Array.from(new Array(numPages), (_, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={600}
            />
          ))}
        </Document>
      )}
    </div>
  );
}
