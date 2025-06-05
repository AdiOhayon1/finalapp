import React, { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth"; // ✅ נוספה השורה הזו
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchUserPosts = async (email) => {
    try {
      const res = await axios.get(`http://localhost:5001/posts?user=${email}`);
      setPosts(res.data.posts);
    } catch (err) {
      console.error("Failed to fetch user posts:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserPosts(currentUser.email);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/log"); // ✅ ודא שיש לך נתיב כזה ב־App.js
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="profile-container" style={{ position: "relative" }}>
      <button
        onClick={handleBackClick}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.5)",
          border: "none",
          borderRadius: "40%",
          padding: "10px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "20px",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
        }}
      >
        ➤
      </button>

      <h2>My profile</h2>
      {user && <p>Email: {user.email}</p>}
      <button
        onClick={handleLogout}
        style={{
          marginBottom: "20px",
          padding: "8px 16px",
          backgroundColor: "rgba(41, 143, 147, 0.5)",
          color: "black",
          border: "none",
          borderRadius: "20px",
          cursor: "pointer",
        }}
      >
        Log Out
      </button>

      <h3>My Posts</h3>
      {posts.length === 0 ? (
        <p>You haven’t posted anything yet.</p>
      ) : (
        <div className="profile-posts-list">
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              <h4>{post.username}</h4>
              <img
                src={`http://localhost:5001${post.image}`}
                alt="post"
                className="profile-post-img"
              />
              <p>{post.caption}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
