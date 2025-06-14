import { useState } from "react";
import axios from "axios";
import { auth } from "../firebaseConfig";
import "./Post.css";

export default function Post() {
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      setMessage("You must be logged in to post.");
      return;
    }

    const formData = new FormData();
    formData.append("media", file); 
    formData.append("caption", caption);
    formData.append("username", user.email);

    try {
      const token = await user.getIdToken(); 
      const res = await axios.post("http://localhost:5001/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, 
        },
      });

      setMessage("Post created successfully!");
      setCaption("");
      setFile(null);
      setPreviewUrl("");
    } catch (err) {
      console.error("Error posting:", err);
      setMessage("Failed to post.");
    }
  };

  return (
    <form className="post-form form-container" onSubmit={handleSubmit}>
      <h2>Create Post</h2>
      <div className="input-group">
        <input
          type="text"
          placeholder="Caption"
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
          <label htmlFor="file-input" className="file-label">
            Choose Media
          </label>
        </div>
      </div>
      {previewUrl && (
        <div className="media-preview">
          {file?.type.startsWith("video/") ? (
            <video src={previewUrl} controls className="preview-media" />
          ) : (
            <img src={previewUrl} alt="Preview" className="preview-media" />
          )}
        </div>
      )}
      <button type="submit">Post</button>
      {message && <p className="message">{message}</p>}
    </form>
  );
}
