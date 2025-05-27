import React, { useState } from "react";
import axios from "axios";
import { auth } from "../../firebaseConfig";
import "./add-post.css";

const AddPost = () => {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("caption", caption);
    formData.append("username", user.email);

    try {
      const res = await axios.post("http://localhost:5000/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Uploaded:", res.data);
      alert("Post uploaded!");
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  return (
    <form className="wrapper" onSubmit={handleUpload}>
      <h2>Create Post</h2>
      <div className="form">
        <div className="input">
          <input
            type="text"
            placeholder="Caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            required
          />
        </div>
        <div className="uplaod-file">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </div>
        <button type="submit">Create</button>
      </div>
    </form>
  );
};

export default AddPost;
