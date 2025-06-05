import React, { useState } from "react";
import axios from "axios";
import "./Posts.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth } from "../../firebaseConfig";

const Posts = ({ posts, onRefresh }) => {
  const BASE_URL = "http://localhost:5001";
  const [likesState, setLikesState] = useState({});

  const handleLike = async (postId) => {
    const user = auth.currentUser;
    if (!user) return;

    const alreadyLiked = likesState[postId]?.likedByUser;

    try {
      const token = await user.getIdToken();

      await axios.post(
        `${BASE_URL}/posts/${postId}/like`,
        {
          action: alreadyLiked ? "unlike" : "like",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLikesState((prev) => ({
        ...prev,
        [postId]: {
          count:
            (prev[postId]?.count ||
              posts.find((p) => p.id === postId)?.likes ||
              0) + (alreadyLiked ? -1 : 1),
          likedByUser: !alreadyLiked,
        },
      }));

      toast.success(alreadyLiked ? "Post unliked" : "Post liked!");
    } catch (err) {
      console.error(
        "❌ Error toggling like:",
        err.response?.data || err.message
      );
      toast.error("Failed to update like");
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirm) return;

    try {
      const token = await auth.currentUser.getIdToken();
      await axios.delete(`${BASE_URL}/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("❌ Failed to delete post:", err);
      toast.error("Failed to delete post");
    }
  };

  if (!posts || posts.length === 0) {
    return <p>No posts to display</p>;
  }

  return (
    <div className="posts-container">
      <ToastContainer position="bottom-right" />
      {posts.map((post) => (
        <div key={post.id} className="post-card">
          <h4>{post.username}</h4>
          <img src={`${BASE_URL}${post.image}`} alt="post" />
          <p>{post.caption}</p>

          <div className="post-actions">
            <button
              onClick={() => handleLike(post.id)}
              className={`like-button ${
                likesState[post.id]?.likedByUser ? "heart-liked" : ""
              }`}
            >
              ❤️ {likesState[post.id]?.count ?? post.likes ?? 0}
            </button>
            <button onClick={() => handleDelete(post.id)}>🗑️ Delete</button>
          </div>

          <ul>
            {post.comments &&
              post.comments.map((comment, i) => (
                <li key={i}>
                  <strong>{comment.user}</strong>: {comment.text}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Posts;
