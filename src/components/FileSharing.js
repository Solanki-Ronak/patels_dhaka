import React, { useState, useEffect } from 'react';
import { storage, db, auth } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  where 
} from 'firebase/firestore';
import './FileSharing.css';

const FileSharing = () => {
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const filesRef = collection(db, 'files');
    const q = query(filesRef, where("userId", "==", auth.currentUser.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fileList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFiles(fileList);
    });

    return () => unsubscribe();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const storageRef = ref(storage, `files/${auth.currentUser.uid}/${file.name}`);
      
      // Upload file
      const uploadTask = uploadBytes(storageRef, file);
      
      // Monitor upload progress
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        }
      );

      // Get download URL after upload completes
      const downloadURL = await getDownloadURL(storageRef);

      // Save file metadata to Firestore
      await addDoc(collection(db, 'files'), {
        name: file.name,
        type: file.type,
        size: file.size,
        url: downloadURL,
        userId: auth.currentUser.uid,
        uploadedAt: new Date().toISOString()
      });

      setProgress(100);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleDelete = async (fileId, fileName) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        // Delete from Storage
        const storageRef = ref(storage, `files/${auth.currentUser.uid}/${fileName}`);
        await deleteObject(storageRef);

        // Delete from Firestore
        await deleteDoc(doc(db, 'files', fileId));
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.includes('image')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('document')) return '📝';
    if (type.includes('spreadsheet')) return '📊';
    return '📎';
  };

  return (
    <div className="file-sharing">
      <div className="file-header">
        <h1>File Sharing</h1>
        <div className="file-actions">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <label className="upload-button">
            Upload File
            <input
              type="file"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {uploading && (
        <div className="upload-progress">
          <div 
            className="progress-bar" 
            style={{ width: `${progress}%` }}
          >
            {Math.round(progress)}%
          </div>
        </div>
      )}

      <div className="files-grid">
        {files
          .filter(file => 
            file.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map(file => (
            <div key={file.id} className="file-card">
              <div className="file-icon">
                {getFileIcon(file.type)}
              </div>
              <div className="file-info">
                <h3>{file.name}</h3>
                <p>{formatFileSize(file.size)}</p>
                <p className="upload-date">
                  {new Date(file.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="file-actions">
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="download-button"
                >
                  Download
                </a>
                <button 
                  onClick={() => handleDelete(file.id, file.name)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>

      {files.length === 0 && !uploading && (
        <div className="no-files">
          <p>No files uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default FileSharing;