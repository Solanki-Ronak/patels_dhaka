import React, { useState, useEffect } from 'react';
import { storage, db, auth } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, query, onSnapshot, deleteDoc, doc, where } from 'firebase/firestore';
import './FileSharing.css';

const FileSharing = () => {
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // Replace uploadingFile with progress

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

    setLoading(true);
    setUploadProgress(0);
    
    try {
      const storageRef = ref(storage, `files/${auth.currentUser.uid}/${file.name}`);
      
      // Create upload task to track progress
      const uploadTask = uploadBytes(storageRef, file);
      
      // Track upload progress
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        }
      );

      // Wait for upload to complete
      await uploadTask;
      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'files'), {
        name: file.name,
        type: file.type,
        size: file.size,
        url: downloadURL,
        userId: auth.currentUser.uid,
        uploadedAt: new Date().toISOString(),
      });

      setUploadProgress(100);
    } catch (error) {
      console.error("Error uploading file: ", error);
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000); // Reset progress after 1 second
    }
  };

  const handleDelete = async (fileId, fileName) => {
    try {
      const storageRef = ref(storage, `files/${auth.currentUser.uid}/${fileName}`);
      await deleteObject(storageRef);
      await deleteDoc(doc(db, 'files', fileId));
    } catch (error) {
      console.error("Error deleting file: ", error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="file-sharing">
      <div className="file-header">
        <h1>File Sharing</h1>
        <div className="file-actions">
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <label className="upload-btn">
            Upload File
            <input
              type="file"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {loading && (
        <div className="upload-progress">
          <div 
            className="progress-bar" 
            style={{ width: `${uploadProgress}%` }}
          >
            {Math.round(uploadProgress)}%
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
                {file.type.includes('image') ? '🖼️' : 
                 file.type.includes('pdf') ? '📄' :
                 file.type.includes('document') ? '📝' : '📎'}
              </div>
              <div className="file-info">
                <h3>{file.name}</h3>
                <p>{formatFileSize(file.size)}</p>
                <p className="upload-date">
                  {new Date(file.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="file-actions">
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="download-btn">
                  Download
                </a>
                <button 
                  onClick={() => handleDelete(file.id, file.name)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default FileSharing;