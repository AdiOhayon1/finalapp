import React from "react";
import "./Posts.css";

const Posts = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return <p>No posts to display</p>;
  }

  return (
    <div className="posts-container">
      {posts.map((post) => (
        <div key={post.id} className="post-card">
          <h4>{post.username}</h4>
          <img src={post.image} alt="post" />
          <p>{post.caption}</p>
          <p>
            <strong>{post.likes || 0} Likes</strong>
          </p>
          <ul>
            {post.comments &&
              post.comments.map((comment, i) => <li key={i}>{comment}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Posts; 