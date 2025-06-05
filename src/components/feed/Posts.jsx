import React, { useState } from "react";
import axios from "axios";
import "./Posts.css";
import { auth } from "../../firebaseConfig";

const Posts = ({ posts }) => {
  const BASE_URL = "http://localhost:5001";
  const [commentInput, setCommentInput] = useState({});

  const [likesState, setLikesState] = useState({});

  const handleLike = async (postId) => {
    const user = auth.currentUser;
    if (!user) {
      console.warn("🔒 User not logged in, cannot like");
      return;
    }

    const alreadyLiked = likesState[postId]?.likedByUser;
    const targetPost = posts.find((p) => p.id === postId); // ✅ זה הפתרון

    try {
      const token = await user.getIdToken();

      await axios.post(
        `${BASE_URL}/posts/${postId}/like`,
        { action: alreadyLiked ? "unlike" : "like" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLikesState((prev) => ({
        ...prev,
        [postId]: {
          count:
            (prev[postId]?.count || targetPost?.likes || 0) +
            (alreadyLiked ? -1 : 1),
          likedByUser: !alreadyLiked,
        },
      }));
    } catch (err) {
      console.error(
        "❌ Error toggling like:",
        err.response?.data || err.message
      );
    }
  };

  const handleComment = async (postId) => {
    const user = auth.currentUser;
    if (!user || !commentInput[postId]) return;

    try {
      const token = await user.getIdToken();
      await axios.post(
        `${BASE_URL}/posts/${postId}/comment`,
        {
          text: {
            text: commentInput[postId],
            user: user.email,
            createdAt: new Date().toISOString(),
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentInput((prev) => ({ ...prev, [postId]: "" }));
      window.location.reload();
    } catch (err) {
      console.error("Error adding comment:", err.response?.data || err.message);
    }
  };

  if (!posts || posts.length === 0) {
    return <p>No posts to display</p>;
  }

  return (
    <div className="posts-container">
      {posts.map((post) => (
        <div key={post.id} className="post-card">
          <h4>{post.username}</h4>
          <img
            src={
              post.image.startsWith("http")
                ? post.image
                : `${BASE_URL}${post.image}`
            }
            alt="post"
            style={{ width: "100%", maxHeight: "300px", objectFit: "cover" }}
          />
          <p>{post.caption}</p>

          <div className="like-comment">
            <button onClick={() => handleLike(post.id)} className="like-button">
              ❤️
            </button>
            <span className="like-count">
              {likesState[post.id]?.count ?? post.likes ?? 0}{" "}
              <strong>Likes</strong>
            </span>
          </div>

          <ul className="comments-list">
            {post.comments &&
              post.comments.map((comment, i) => (
                <li key={i}>
                  <strong>{comment.user}:</strong> {comment.text}
                </li>
              ))}
          </ul>

          <div className="comment-box">
            <input
              type="text"
              value={commentInput[post.id] || ""}
              onChange={(e) =>
                setCommentInput({ ...commentInput, [post.id]: e.target.value })
              }
              placeholder="Add a comment..."
            />
            <button
              onClick={() => handleComment(post.id)}
              className="comment-button"
            >
              💬
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Posts;
