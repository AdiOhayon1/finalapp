import React, { useState } from "react";
import axios from "axios";
import { auth } from "../../firebaseConfig";
import "./addPost.css";

const AddPost = ({ onPostCreated }) => {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [message, setMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [mediaType, setMediaType] = useState("image");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file type
      if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
        setMessage("Please select an image or video file.");
        return;
      }

      // Check file size (50MB limit)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setMessage("File size must be less than 50MB.");
        return;
      }

      setFile(selectedFile);
      setMediaType(selectedFile.type.startsWith('video/') ? 'video' : 'image');
      
      // Create preview URL
      const fileUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(fileUrl);
      setMessage("");
    } else {
      setFile(null);
      setPreviewUrl("");
      setMediaType("image");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      setMessage("You must be logged in to post.");
      return;
    }

    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    try {
      const token = await user.getIdToken();

      const formData = new FormData();
      formData.append("media", file);
      formData.append("caption", caption);
      formData.append("mediaType", mediaType);

      await axios.post("http://localhost:5001/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("Post uploaded successfully!");
      setCaption("");
      setFile(null);
      setPreviewUrl("");
      setMediaType("image");

      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err) {
      console.error("❌ Upload failed:", err);
      setMessage(err.response?.data?.error || "Failed to upload post.");
    }
  };

  return (
    <form className="post-form" onSubmit={handleUpload} noValidate>
      <h2>Create Post</h2>
      <div className="input-group">
        <div className="input-with-upload">
          <input
            type="text"
            placeholder="Write your post..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            required
          />
          <div className="file-upload">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              required
              id="file-input"
            />
            <label htmlFor="file-input" className="file-label" title="Upload media">
              {mediaType === 'video' ? '🎥' : '📷'}
            </label>
          </div>
        </div>
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
      <button type="submit">Create Post</button>
      {message && <p className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</p>}
    </form>
  );
};

export default AddPost;
