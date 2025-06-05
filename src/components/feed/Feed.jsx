import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SearchBar from "../search-bar/SearchBar";
import Posts from "./Posts";
import NavBar from "../nav-bar/NavBar";
import AddPost from "../add-post/AddPost";
import passportImage from '../../assets/passport.png';
import "./Feed.css";

const Feed = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);

  const navigate = useNavigate();

  const handleNavigateToProfile = () => {
    navigate("/profile");
  };

  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:5001/posts");
      setAllPosts(res.data);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const filtered = allPosts.filter((post) =>
      post.caption?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPosts(filtered);
  }, [searchTerm, allPosts]);

  return (
    <div
      className="feed-wrapper"
      style={{
        backgroundImage: `url(${passportImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      <NavBar onClick={handleNavigateToProfile} />
      <div className="feed-content">
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <div className="divider" />
        <AddPost onPostCreated={fetchPosts} />
        <Posts posts={filteredPosts} />
      </div>
    </div>
  );
};

export default Feed;
