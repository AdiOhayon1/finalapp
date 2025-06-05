import React, { useState } from "react";
import axios from "axios";
import { auth } from "../../firebaseConfig";
import "./addPost.css";

const AddPost = ({ onPostCreated }) => {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [message, setMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const fileUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(fileUrl);
    } else {
      setFile(null);
      setPreviewUrl("");
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
      setMessage("Please select an image.");
      return;
    }

    try {
      const token = await user.getIdToken();

      const formData = new FormData();
      formData.append("image", file);
      formData.append("caption", caption);
      formData.append("username", user.email);

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

      // רענון הפיד אחרי העלאת פוסט מוצלחת
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err) {
      console.error("❌ Upload failed:", err);
      setMessage("Failed to upload post.");
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
              accept="image/*"
              onChange={handleFileChange}
              required
              id="file-input"
            />
            <label htmlFor="file-input" className="file-label">
              📷
            </label>
          </div>
        </div>
      </div>
      {previewUrl && (
        <div className="image-preview">
          <img src={previewUrl} alt="Preview" />
        </div>
      )}
      <button type="submit">Create Post</button>
      {message && <p className="message">{message}</p>}
    </form>
  );
};

export default AddPost;
