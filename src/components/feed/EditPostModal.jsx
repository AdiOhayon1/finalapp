import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../firebaseConfig';
import './EditPostModal.css';

const EditPostModal = ({ post, onClose, onPostUpdated }) => {
  const [caption, setCaption] = useState(post.caption);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mediaType, setMediaType] = useState(post.mediaType || 'image');

  useEffect(() => {
    // Set initial preview URL from post media
    if (post.media) {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      setPreviewUrl(`${baseUrl}${post.media}`);
    }
  }, [post]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.classList.contains('modal-overlay')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file type
      if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
        setError('Please select an image or video file.');
        return;
      }

      // Check file size (50MB limit)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB.');
        return;
      }

      setFile(selectedFile);
      setMediaType(selectedFile.type.startsWith('video/') ? 'video' : 'image');
      const fileUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(fileUrl);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to edit posts');
      }

      const token = await user.getIdToken();
      const formData = new FormData();
      formData.append('caption', caption);
      formData.append('mediaType', mediaType);
      
      if (file) {
        formData.append('media', file);
      }

      await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/posts/${post.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onPostUpdated();
      onClose();
    } catch (err) {
      console.error('Error updating post:', err);
      setError(err.response?.data?.error || 'Failed to update post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Edit Post</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write your caption..."
              required
            />
          </div>
          
          <div className="form-group">
            <label className="file-upload-label">
              Change Media
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="file-input"
              />
            </label>
          </div>

          {previewUrl && (
            <div className="media-preview">
              {mediaType === 'video' ? (
                <video 
                  src={previewUrl} 
                  controls 
                  style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '5px' }}
                />
              ) : (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '5px', objectFit: 'contain' }}
                />
              )}
            </div>
          )}

          {error && <p className="error-message">{error}</p>}
          
          <div className="button-group">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal; 