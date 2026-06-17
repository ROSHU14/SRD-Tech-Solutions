import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function FileUploadPremium({
  onFilesSelected,
  accept,
  label,
  icon,
  maxFiles = 10,
  previews = [],
  onRemove,
  acceptType = 'image'
}) {
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(r => {
        if (r.errors[0].code === 'file-too-large') {
          return `${r.file.name} is too large`;
        }
        return r.errors[0].message;
      });
      alert(errors.join(', '));
      return;
    }
    onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    noClick: false,
    noKeyboard: false,
    maxSize: Infinity // NO SIZE LIMIT
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-xs text-gray-400">(Max {maxFiles} files, No size limit)</span>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <p className="text-sm text-gray-600">
            {isDragActive ? 'Drop files here' : 'Click or drag to upload'}
          </p>
          <p className="text-xs text-gray-400">
            {acceptType === 'image' ? 'PNG, JPG, GIF, WEBP (No size limit)' : 'MP4, MOV, AVI, WEBM, MKV (No size limit)'}
          </p>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {previews.map((file, index) => (
            <div key={index} className="relative group">
              {file.type?.startsWith('image/') ? (
                <div className="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-lg border border-gray-200 bg-gray-50 flex flex-col items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[10px] text-gray-500 mt-1 truncate max-w-[60px]">
                    {file.name.split('.').pop()}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}