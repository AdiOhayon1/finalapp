import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaPlus, FaUser } from "react-icons/fa";
import SearchBar from "./SearchBar"; // ודא שהנתיב נכון
import "./SideNavBar.css"; // עיצוב הלחצנים בצד

const Feed = ({ posts }) => {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);

  const handleNavigateToProfile = () => {
    navigate("/profile");
  };

  const handleNavigateToAddPost = () => {
    navigate("/addpost");
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  return (
    <div className="feed-with-sidebar">
      <div className="sidebar">
        <button onClick={toggleSearch}>
          <FaSearch />
        </button>
        <button onClick={handleNavigateToAddPost}>
          <FaPlus />
        </button>
        <button onClick={handleNavigateToProfile}>
          <FaUser />
        </button>
      </div>

      {/* תוכן הפיד */}
      <div className="feed-content">
        <h1>Welcome to PostPassport</h1>
        {posts && posts.length > 0 ? (
          posts.map((post) => (
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
          ))
        ) : (
          <p>No posts to display</p>
        )}
      </div>

      {showSearch && <SearchBar posts={posts} />}
    </div>
  );
};

export default Feed;
