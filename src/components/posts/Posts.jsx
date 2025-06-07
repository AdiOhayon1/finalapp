import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Posts.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth } from "../../firebaseConfig";
import { FiTrash2 } from "react-icons/fi";

const Posts = ({ posts, onRefresh }) => {
  const BASE_URL = "http://localhost:5001";
  const [likesState, setLikesState] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  // Get current user on component mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      // Initialize likes state when user changes
      if (user && posts) {
        const initialLikesState = {};
        posts.forEach(post => {
          initialLikesState[post.id] = {
            count: post.likes || 0,
            likedByUser: post.likedBy?.includes(user.email) || false
          };
        });
        setLikesState(initialLikesState);
      }
    });
    return () => unsubscribe();
  }, [posts]);

  const handleLike = async (postId) => {
    const user = auth.currentUser;
    if (!user) {
      toast.warning("You must be logged in to like posts");
      return;
    }

    const alreadyLiked = likesState[postId]?.likedByUser;
    const action = alreadyLiked ? "unlike" : "like";

    try {
      const token = await user.getIdToken();
      const response = await axios.post(
        `${BASE_URL}/posts/${postId}/like`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state with the server response
      const updatedPost = response.data;
      setLikesState(prev => ({
        ...prev,
        [postId]: {
          count: updatedPost.likes,
          likedByUser: updatedPost.likedBy?.includes(user.email) || false
        }
      }));

      toast.success(alreadyLiked ? "Post unliked" : "Post liked!");
    } catch (err) {
      if (err.response?.status === 400) {
        toast.error(err.response.data.error);
      } else {
        console.error("Error toggling like:", err.response?.data || err.message);
        toast.error("Failed to update like");
      }
    }
  };

  const handleDelete = async (post) => {
    if (!currentUser || post.email !== currentUser.email) {
      toast.error("You can only delete your own posts");
      return;
    }

    const confirm = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirm) return;

    try {
      const token = await auth.currentUser.getIdToken();
      await axios.delete(`${BASE_URL}/posts/${post.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (onRefresh) onRefresh();
      toast.success("Post deleted successfully!");
    } catch (err) {
      console.error("Failed to delete post:", err);
      if (err.response?.status === 403) {
        toast.error("You are not authorized to delete this post");
      } else {
        toast.error("Failed to delete post");
      }
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
          <div className="post-header">
            <h4>{post.username}</h4>
            {currentUser && post.email === currentUser.email && (
              <button 
                onClick={() => handleDelete(post)} 
                className="delete-button"
                title="Delete post"
              >
                <FiTrash2 />
              </button>
            )}
          </div>
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
          </div>

          <ul className="comments-list">
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
