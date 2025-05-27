import React, { useState } from "react";
import axios from "axios";
import { auth } from "../firebaseConfig"; // ודאי שזה הנתיב הנכון

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
    <form className="add-post form-container" onSubmit={handleUpload}>
      <h2>Upload a photo</h2>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        required
      />
      <input
        type="text"
        placeholder="Caption"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        required
      />
      <button type="submit">Upload</button>
    </form>
  );
};

export default AddPost;
