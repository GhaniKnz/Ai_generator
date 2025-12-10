# Fixes Applied to AI Generator

## 1. Increased Dataset Upload Limit (100MB → 5GB)

### Changes Made:
- **FileUpload.tsx**: Updated `maxSizeMB` default from 100 to 5000
- **FileUpload.tsx**: Replaced `fetch()` with `XMLHttpRequest` for better upload progress tracking
- **FileUpload.tsx**: Added real-time progress percentage display
- **datasets.tsx**: Updated maxSizeMB prop to 5000MB

### Benefits:
- Users can now upload multi-gigabyte datasets
- Real-time upload progress with percentage
- Better handling of large files

## 2. CSV File Support for Image-Label Mapping

### Changes Made:
- **uploads.py**: Added CSV format support (`.csv`, `.tsv`, `.txt`)
- **uploads.py**: Implemented `parse_csv_file()` function with smart column detection
- **uploads.py**: Auto-detects image and label columns using common naming conventions
- **uploads.py**: Saves parsed CSV metadata as JSON alongside the original file
- **FileUpload.tsx**: Added CSV data interface to handle parsed mappings
- **datasets.tsx**: Display CSV mapping count in upload success message

### CSV Format Support:
The system automatically detects columns with these common names:
- **Image columns**: image, filename, file, img, path, image_path, file_name
- **Label columns**: label, class, category, tag, description, caption, text

Example CSV:
```csv
filename,label
img001.jpg,badminton
img002.jpg,football
img003.jpg,basketball
```

### Benefits:
- AI can now read CSV files and associate images with labels
- Automatic column detection for flexible CSV formats
- Labels like "badminton", "football" are automatically linked to images
- Metadata saved for use during training

## 3. Training Monitor Synchronization

### Changes Made:
- **training-monitor.tsx**: Complete rewrite to connect to real API endpoints
- **training-monitor.tsx**: Added job selection dropdown for multiple training tasks
- **training-monitor.tsx**: Fetches training jobs from `/api/training/` every 5 seconds
- **training-monitor.tsx**: Fetches job progress from `/api/training/{job_id}/progress` every 2 seconds
- **training-monitor.tsx**: Displays real-time metrics, logs, and current training images
- **training-monitor.tsx**: Shows progress bar, epoch count, and loss values

### API Endpoints Used:
- `GET /api/training/` - List all training jobs
- `GET /api/training/{job_id}/progress` - Get real-time progress for a job
- Shows: status, progress, current_epoch, current_step, loss, current_image, logs

### Benefits:
- Monitor is now synchronized with actual training tasks
- Can select which training job to monitor from dropdown
- Real-time updates of training progress
- Displays current image being processed
- Shows training logs and metrics

## 4. Dataset Upload Integration

### Changes Made:
- **FileUpload.tsx**: Added optional `datasetId` prop
- **uploads.py**: Added `dataset_id` form parameter
- **uploads.py**: Organizes uploaded files by dataset in subdirectories
- **datasets.tsx**: Passes selectedDatasetId to FileUpload component
- **datasets.tsx**: Refreshes dataset list after successful upload

### Benefits:
- Uploaded files are properly organized by dataset
- Dataset item counts update automatically
- Clear association between files and datasets

## Known Issues & How to Fix

### Issue 1: Service Worker Response.clone() Error

**Error**: `sw.js:44 Uncaught (in promise) TypeError: Failed to execute 'clone' on 'Response': Response body is already used`

**Cause**: This error occurs during development when Next.js tries to cache API responses. The response stream can only be read once.

**Solutions**:
1. **For Development**: Clear browser cache and service workers
   - Open DevTools → Application → Service Workers → Unregister
   - Application → Clear Storage → Clear site data
   
2. **For Production**: Add this to `next.config.js`:
   ```javascript
   const nextConfig = {
     reactStrictMode: true,
     // Disable service worker in development
     swcMinify: true,
     async rewrites() {
       return [
         {
           source: '/api/:path*',
           destination: 'http://localhost:8000/api/:path*',
         },
       ]
     },
   }
   ```

3. **Alternative**: The error is harmless and doesn't affect functionality. It can be safely ignored in development.

### Issue 2: 404 Error on /api/training/

**Error**: `:3000/api/training/:1 Failed to load resource: the server responded with a status of 404 (Not Found)`

**Cause**: Backend server not running or not accessible.

**Solutions**:
1. **Start the Backend Server**:
   ```bash
   cd /home/runner/work/Ai_generator/Ai_generator
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Verify Backend is Running**:
   ```bash
   curl http://localhost:8000/health
   # Should return: {"status":"ok","app":"AI Generator","version":"1.0.0"}
   ```

3. **Test Training Endpoint**:
   ```bash
   curl http://localhost:8000/api/training/
   # Should return: []  (empty list if no jobs)
   ```

4. **Check Next.js Proxy**:
   - Ensure Next.js dev server is running on port 3000
   - Verify `/api` requests are being proxied to port 8000
   - Check `next.config.js` rewrites configuration

### Issue 3: Training Jobs Not Appearing

**Cause**: No training jobs created yet or database not initialized.

**Solutions**:
1. **Create a Test Training Job**:
   ```bash
   curl -X POST http://localhost:8000/api/training/ \
     -H "Content-Type: application/json" \
     -d '{
       "dataset_id": 1,
       "base_model_id": 1,
       "type": "lora",
       "output_name": "test-lora",
       "config": {
         "learning_rate": 0.0001,
         "batch_size": 4,
         "num_epochs": 10,
         "lora_rank": 4,
         "lora_alpha": 32,
         "mixed_precision": "fp16"
       }
     }'
   ```

2. **Create a Dataset First** (if needed):
   ```bash
   curl -X POST http://localhost:8000/api/datasets/ \
     -H "Content-Type: application/json" \
     -d '{
       "name": "My Training Dataset",
       "description": "Test dataset for training",
       "type": "image",
       "tags": ["test", "training"]
     }'
   ```

## Testing the New Features

### 1. Test Large File Upload
1. Navigate to Datasets page
2. Create a new dataset
3. Click "Upload" on the dataset
4. Select files totaling more than 100MB
5. Observe upload progress percentage
6. Verify files are uploaded successfully

### 2. Test CSV Integration
1. Create a CSV file with image filenames and labels:
   ```csv
   filename,label
   image1.jpg,badminton
   image2.jpg,football
   image3.jpg,basketball
   ```
2. Upload the CSV file along with the images
3. Check the success message shows number of mappings found
4. Verify CSV metadata is saved in `uploads/csv/` directory

### 3. Test Training Monitor
1. Start backend server
2. Create a training job via API or UI
3. Navigate to Training Monitor page
4. Select the job from dropdown
5. Observe real-time progress updates
6. Verify metrics chart updates
7. Check training logs appear

## File Changes Summary

### Frontend Files Modified:
- `frontend/components/FileUpload.tsx` - Large file support, CSV handling, progress tracking
- `frontend/pages/datasets.tsx` - CSV upload info, dataset ID integration
- `frontend/pages/training-monitor.tsx` - Complete rewrite for real-time sync
- `frontend/public/README.md` - Created public assets directory

### Backend Files Modified:
- `app/routers/uploads.py` - CSV parsing, dataset organization, larger file limits

## Next Steps

1. **Start Backend Server**: Run `uvicorn app.main:app --reload` in the `app` directory
2. **Start Frontend Server**: Run `npm run dev` in the `frontend` directory
3. **Test Upload**: Try uploading large files and CSV files
4. **Test Training**: Create and monitor a training job
5. **Clear Service Worker**: If you see the clone() error, clear browser cache

## Architecture Improvements

### Upload Flow:
```
User selects files → FileUpload component
                   ↓
         XMLHttpRequest with progress
                   ↓
         POST /api/uploads/batch
                   ↓
    Upload router processes files
                   ↓
    - Images → uploads/image/dataset_{id}/
    - CSV → uploads/csv/ + parse and save metadata
                   ↓
         Return upload results
                   ↓
    Update UI with success/CSV info
```

### Training Monitor Flow:
```
Training Monitor loads
         ↓
GET /api/training/ (fetch all jobs)
         ↓
Select job from dropdown
         ↓
Poll GET /api/training/{job_id}/progress every 2s
         ↓
Update UI:
  - Progress bar
  - Metrics chart
  - Current image
  - Training logs
  - Epoch count
```

## Support

For issues or questions:
1. Check backend is running: `curl http://localhost:8000/health`
2. Check frontend is running: Visit `http://localhost:3000`
3. Clear browser cache and service workers
4. Check console for detailed error messages
