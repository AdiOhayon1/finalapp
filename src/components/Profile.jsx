// ✅ Profile.jsx - show user email from Firebase & their posts
import React, { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import axios from "axios";

export default function Profile() {
  const [userEmail, setUserEmail] = useState("");
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email);
      axios
        .get(`http://localhost:5000/posts?user=${user.email}`)
        .then((res) => setPosts(res.data))
        .catch((err) => console.error("Failed to fetch user posts", err));
    }
  }, []);

  return (
    <div className="profile page-container">
      <h2>My profile</h2>
      <p>Email: {userEmail}</p>
      <h3>My Posts</h3>
      {posts.length > 0 ? (
        posts.map((post, i) => (
          <div key={i} className="post-card">
            <h4>{post.username}</h4>
            <img src={post.image} alt="post" />
            <p>{post.caption}</p>
          </div>
        ))
      ) : (
        <p>You haven’t posted anything yet.</p>
      )}
    </div>
  );
}
