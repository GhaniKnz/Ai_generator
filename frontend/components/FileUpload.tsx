import { useState, useRef, DragEvent } from 'react'
import { CloudArrowUpIcon, DocumentIcon, PhotoIcon, VideoCameraIcon, MusicalNoteIcon, ArchiveBoxIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface FileUploadProps {
  onUploadComplete?: (files: UploadedFile[]) => void
  onUploadError?: (error: string) => void
  acceptedTypes?: string[]
  multiple?: boolean
  maxSizeMB?: number
  extractArchives?: boolean
  datasetId?: number
}

interface UploadedFile {
  filename: string
  path: string
  size: number
  type: string
  extracted_files?: string[]
  csv_data?: {
    total_rows: number
    image_column: string
    label_column: string
    mappings: { [key: string]: string }
    columns: string[]
  }
  error?: string
}

interface PreviewFile extends File {
  preview?: string
}

export default function FileUpload({
  onUploadComplete,
  onUploadError,
  acceptedTypes = [],
  multiple = true,
  maxSizeMB = 5000,
  extractArchives = true,
  datasetId
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState<PreviewFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = (files: File[]) => {
    // Filter files by size
    const validFiles = files.filter(file => {
      const sizeMB = file.size / (1024 * 1024)
      return sizeMB <= maxSizeMB
    })

    if (validFiles.length !== files.length) {
      onUploadError?.(`Some files exceed the ${maxSizeMB}MB size limit`)
    }

    // Create previews for image files
    const filesWithPreviews = validFiles.map(file => {
      const previewFile = file as PreviewFile
      if (file.type.startsWith('image/')) {
        previewFile.preview = URL.createObjectURL(file)
      }
      return previewFile
    })

    setSelectedFiles(prev => multiple ? [...prev, ...filesWithPreviews] : filesWithPreviews)
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev]
      // Revoke preview URL if exists
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    selectedFiles.forEach(file => {
      formData.append('files', file)
    })
    formData.append('extract_archives', extractArchives.toString())
    if (datasetId) {
      formData.append('dataset_id', datasetId.toString())
    }

    try {
      const xhr = new XMLHttpRequest()
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          setUploadProgress(percentComplete)
        }
      })

      // Handle completion
      const uploadPromise = new Promise<UploadedFile[]>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const results = JSON.parse(xhr.responseText)
              resolve(results)
            } catch (e) {
              reject(new Error('Failed to parse response'))
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'))
        })

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'))
        })
      })

      xhr.open('POST', '/api/uploads/batch')
      xhr.send(formData)

      const results = await uploadPromise
      
      // Clean up previews
      selectedFiles.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
      
      setSelectedFiles([])
      setUploadProgress(100)
      onUploadComplete?.(results)
      
    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <PhotoIcon className="w-8 h-8 text-blue-500" />
    } else if (file.type.startsWith('video/')) {
      return <VideoCameraIcon className="w-8 h-8 text-purple-500" />
    } else if (file.type.startsWith('audio/')) {
      return <MusicalNoteIcon className="w-8 h-8 text-green-500" />
    } else if (file.name.match(/\.(zip|rar|7z|tar|gz)$/i)) {
      return <ArchiveBoxIcon className="w-8 h-8 text-orange-500" />
    } else {
      return <DocumentIcon className="w-8 h-8 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="w-full">
      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-200 ease-in-out backdrop-blur-sm
          ${isDragging 
            ? 'border-blue-500 bg-blue-500/10 scale-[1.02]' 
            : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800/70'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <CloudArrowUpIcon className={`w-16 h-16 mx-auto mb-4 transition-colors ${isDragging ? 'text-blue-400' : 'text-gray-400'}`} />
        
        <h3 className="text-xl font-semibold text-white mb-2">
          {isDragging ? 'Drop files here' : 'Upload Files'}
        </h3>
        
        <p className="text-gray-400 mb-4">
          Drag and drop files here, or click to browse
        </p>
        
        <div className="text-sm text-gray-500">
          <p>Supports: Images (PNG, JPG, GIF, etc.), Videos (MP4, AVI, MOV, etc.)</p>
          <p>Audio (WAV, MP3, etc.), Archives (ZIP, RAR, etc.), CSV files for labels</p>
          <p className="mt-2">Max file size: {maxSizeMB}MB per file</p>
        </div>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">
              Selected Files ({selectedFiles.length})
            </h4>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-gray-600 transition-all"
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    getFileIcon(file)
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{file.name}</p>
                    <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => removeFile(index)}
                  className="ml-4 p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <button
            onClick={uploadFiles}
            disabled={uploading}
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 
                     disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl 
                     transition-all duration-200 shadow-lg hover:shadow-blue-500/50 disabled:shadow-none
                     disabled:cursor-not-allowed"
          >
            {uploading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Uploading... {uploadProgress}%</span>
              </div>
            ) : (
              `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}`
            )}
          </button>
        </div>
      )}
    </div>
  )
}
