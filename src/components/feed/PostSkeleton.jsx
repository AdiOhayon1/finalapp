import React from 'react';
import './PostSkeleton.css';

const PostSkeleton = ({ count = 3 }) => {
  return (
    <div className="posts-container">
      {[...Array(count)].map((_, index) => (
        <div key={index} className="post-card skeleton">
          <div className="post-header skeleton">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-username"></div>
          </div>
          <div className="skeleton-media"></div>
          <div className="skeleton-content">
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
          </div>
          <div className="skeleton-actions">
            <div className="skeleton-button"></div>
            <div className="skeleton-button"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostSkeleton; 