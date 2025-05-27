import { useState } from "react";
import axios from "axios";
import { auth } from "../firebaseConfig"; // אם את שומרת עם המשתמש המחובר

export default function Post() {
  const [image, setImage] = useState("");
  const [caption, setCaption] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      setMessage("You must be logged in to post.");
      return;
    }

    const post = {
      username: user.email,
      image,
      caption,
    };

    try {
      const res = await axios.post("http://localhost:5000/posts", post);
      setMessage("Post created successfully!");
      setImage("");
      setCaption("");
    } catch (err) {
      console.error("Error posting:", err);
      setMessage("Failed to post.");
    }
  };

  return (
    <form className="post-form form-container" onSubmit={handleSubmit}>
      <h2>Create Post</h2>
      <input
        type="text"
        placeholder="Image URL"
        value={image}
        onChange={(e) => setImage(e.target.value)}
        required
      />
      <textarea
        placeholder="Caption"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        required
      />
      <button type="submit">Post</button>
      {message && <p>{message}</p>}
    </form>
  );
}
