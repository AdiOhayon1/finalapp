import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Posts.css";
import { auth } from "../../firebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditPostModal from "./EditPostModal";
import { FiEdit2, FiTrash2, FiHeart, FiMessageSquare, FiSend } from "react-icons/fi";
import PostSkeleton from "./PostSkeleton";

const Posts = ({ posts, onRefresh, isLoading }) => {
  const BASE_URL = "http://localhost:5001";
  const [commentInput, setCommentInput] = useState({});
  const [likesState, setLikesState] = useState({});
  const [editingPost, setEditingPost] = useState(null);
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
        console.error("❌ Error toggling like:", err.response?.data || err.message);
        toast.error("Failed to update like");
      }
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
      
      // Clear the input after successful comment
      setCommentInput((prev) => ({ ...prev, [postId]: "" }));
      
      // Refresh the posts to show the new comment
      if (onRefresh) onRefresh();
      
      toast.success("Comment added successfully!");
    } catch (err) {
      console.error("Error adding comment:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Failed to add comment");
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const token = await auth.currentUser.getIdToken();
      await axios.delete(`${BASE_URL}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (onRefresh) onRefresh();
      toast.success("Post deleted successfully!");
    } catch (err) {
      console.error("Error deleting post:", err.response?.data || err.message);
      toast.error("Failed to delete post");
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
  };

  const handleEditClose = () => {
    setEditingPost(null);
  };

  const handleEditSuccess = () => {
    if (onRefresh) onRefresh();
    setEditingPost(null);
    toast.success("Post updated successfully!");
  };

  if (isLoading) {
    return <PostSkeleton count={3} />;
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="posts-container">
        <div className="no-posts">
          <p>No posts to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="posts-container">
      <ToastContainer position="bottom-right" />
      {posts.map((post) => (
        <div key={post.id} className="post-card">
          <div className="post-header">
            <h4>{post.username}</h4>
            {currentUser && post.email === currentUser.email && (
              <div className="post-actions">
                <button
                  onClick={() => handleEdit(post)}
                  className="edit-button"
                  title="Edit post"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="delete-button"
                  title="Delete post"
                >
                  <FiTrash2 />
                </button>
              </div>
            )}
          </div>
          {post.mediaType === "video" ? (
            <video 
              className="post-media"
              controls
              src={`${process.env.REACT_APP_API_URL}/uploads/${post.media}`}
              poster={`${process.env.REACT_APP_API_URL}/uploads/${post.media.replace(/\.[^/.]+$/, '.jpg')}`}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <img 
              className="post-media"
              src={`${process.env.REACT_APP_API_URL}/uploads/${post.media}`}
              alt={post.caption}
            />
          )}
          <p className="post-caption">{post.caption}</p>
          <div className="post-actions">
            <button 
              className={`like-button ${likesState[post.id]?.likedByUser ? 'liked' : ''}`}
              onClick={() => handleLike(post.id)}
            >
              <FiHeart className={likesState[post.id]?.likedByUser ? 'liked-icon' : ''} />
              <span>{likesState[post.id]?.count ?? post.likes ?? 0}</span>
            </button>
            <button 
              className="comment-button"
              onClick={() => handleComment(post.id)}
            >
              <FiMessageSquare />
              <span>{post.comments ? post.comments.length : 0}</span>
            </button>
          </div>

          <div className="comments-section">
            {/* Comments List */}
            {post.comments && post.comments.length > 0 && (
              <div className="comments-list">
                {post.comments.slice(0, 6).map((comment, index) => (
                  <div key={index} className="comment">
                    <div className="comment-avatar">
                      {comment.user.charAt(0).toUpperCase()}
                    </div>
                    <div className="comment-content">
                      <div className="comment-bubble">
                        <p className="comment-text">{comment.text}</p>
                      </div>
                      <div className="comment-actions">
                        <button className="comment-action">Like</button>
                        <button className="comment-action">Reply</button>
                        <span className="comment-time">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {post.comments.length > 6 && (
                  <>
                    <div className="comments-divider">
                      <span>View previous {post.comments.length - 6} comments</span>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="comment-section-divider"></div>

            {/* Comment Input */}
            <div className="comment-input-container">
              <div className="comment-avatar">
                {currentUser?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="comment-input-wrapper">
                <input
                  type="text"
                  value={commentInput[post.id] || ''}
                  onChange={(e) => setCommentInput(prev => ({ ...prev, [post.id]: e.target.value }))}
                  placeholder="Write a comment..."
                  className="comment-input"
                  onKeyUp={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleComment(post.id);
                    }
                  }}
                />
                <button 
                  onClick={() => handleComment(post.id)}
                  className="comment-submit-button"
                  disabled={!commentInput[post.id]}
                  title="Post comment"
                >
                  <FiSend />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onPostUpdated={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default Posts;
