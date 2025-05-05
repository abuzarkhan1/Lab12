import React, { useState } from 'react';
import { Upload, Check, X, FileText, Loader2, Image, Film, File, Music } from 'lucide-react';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // null, 'success', 'error'
  const [progress, setProgress] = useState(0);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setUploadStatus(null);
    }
  };


  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setProgress(0);
    
    const mockProgress = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        return newProgress > 95 ? 95 : newProgress;
      });
    }, 200);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result.split(',')[1];
      
      try {
        const res = await fetch(
          'https://kwf7qi3b4i.execute-api.us-east-1.amazonaws.com/prod/upload',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              image: base64Data,
              filename: file.name,
              contentType: file.type
            })
          }
        );
        
        clearInterval(mockProgress);
        setProgress(100);
        
        if (res.ok) {
          const data = await res.json();
          console.log('Upload successful:', data);
          setUploadStatus('success');
          // Save the image URL from the response
          if (data.imageUrl) {
            setUploadedImageUrl(data.imageUrl);
          }
        } else {
          console.error('Upload failed with status:', res.status);
          setUploadStatus('error');
        }
      } catch (err) {
        clearInterval(mockProgress);
        console.error('Upload failed:', err);
        setUploadStatus('error');
      } finally {
        setIsUploading(false);
      }
    };
    
    reader.readAsDataURL(file);
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="text-indigo-400" size={28} />;
    
    const fileType = file.type.split('/')[0];
    
    switch (fileType) {
      case 'image':
        return <Image className="text-indigo-400" size={28} />;
      case 'video':
        return <Film className="text-indigo-400" size={28} />;
      case 'audio':
        return <Music className="text-indigo-400" size={28} />;
      case 'text':
      case 'application':
        return <FileText className="text-indigo-400" size={28} />;
      default:
        return <File className="text-indigo-400" size={28} />;
    }
  };

  const formatFileSize = (size) => {
    if (size < 1024) return `${size} B`;
    else if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    else if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    else return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">File Upload</h1>
          <p className="text-gray-400">Upload your files securely and easily</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden">
          {/* Upload Area */}
          <div 
            className={`relative p-8 ${isDragging ? 'bg-gray-700' : ''} border-2 border-dashed rounded-t-lg ${
              isDragging 
                ? 'border-indigo-500' 
                : uploadStatus === 'success'
                ? 'border-green-500'
                : uploadStatus === 'error'
                ? 'border-red-500'
                : 'border-gray-600'
            } transition-all duration-200`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            />
            
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-gray-700">
                {uploadStatus === 'success' ? (
                  <Check className="text-green-500" size={28} />
                ) : uploadStatus === 'error' ? (
                  <X className="text-red-500" size={28} />
                ) : (
                  getFileIcon()
                )}
              </div>
              
              {file ? (
                <div className="text-white font-medium mb-1">{file.name}</div>
              ) : (
                <div className="text-white font-medium mb-1">Drop your file here or click to browse</div>
              )}
              
              {file && (
                <div className="text-gray-400 text-sm">{formatFileSize(file.size)}</div>
              )}
              
              {!file && (
                <p className="text-gray-400 text-sm mt-2">Support for images, documents, and more</p>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          {isUploading && (
            <div className="px-4 py-3 bg-gray-750">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-gray-400 text-xs mt-2 text-right">{Math.round(progress)}%</div>
            </div>
          )}
          
          {/* Actions */}
          <div className="px-4 py-4 bg-gray-750 rounded-b-lg">
            <div className="flex justify-between items-center">
              {file && !isUploading && !uploadStatus && (
                <button 
                  onClick={() => setFile(null)}
                  className="text-gray-400 hover:text-red-400 text-sm flex items-center transition-colors"
                >
                  <X size={16} className="mr-1" />
                  Clear
                </button>
              )}
              
              {!file && !isUploading && !uploadStatus && <div></div>}
              
              {uploadStatus === 'success' && (
                <span className="text-green-500 text-sm flex items-center">
                  <Check size={16} className="mr-1" />
                  Upload Complete
                </span>
              )}
              
              {uploadStatus === 'error' && (
                <span className="text-red-500 text-sm flex items-center">
                  <X size={16} className="mr-1" />
                  Upload Failed
                </span>
              )}
              
              <button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className={`flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  !file || isUploading
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} className="mr-2" />
                    Upload File
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Upload Result Section */}
        <div className="mt-8 bg-gray-800 rounded-xl shadow-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-medium">Uploaded Image</h2>
          </div>
          
          {uploadedImageUrl ? (
            <div className="flex flex-col items-center">
              <div className="mb-4 overflow-hidden rounded-lg">
                <img 
                  src={uploadedImageUrl} 
                  alt="Uploaded" 
                  className="w-full h-auto max-h-56 object-cover"
                />
              </div>
              <div className="w-full bg-gray-700 rounded p-3 text-sm break-all">
                <p className="text-gray-300 mb-2">Image URL:</p>
                <a 
                  href={uploadedImageUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 truncate flex items-center"
                >
                  {uploadedImageUrl}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4 text-sm">
              No uploads yet. Upload an image to see it here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;