import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddPost from "../add-post/AddPost";
import SearchBar from "../search-bar/SearchBar";
import Posts from "./Posts";
import "./Feed.css";
import NavBar from "../nav-bar/NavBar";

const Feed = ({ posts }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleNavigateToProfile = () => {
    navigate("/profile");
  };

  return (
    <div className="feed-wrapper">
      <NavBar onClick={handleNavigateToProfile} />
      <div className="feed-content">
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <div className="divider" />
        <AddPost />
        <Posts posts={posts} />
      </div>
    </div>
  );
};

export default Feed;
