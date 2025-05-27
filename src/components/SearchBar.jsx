// ✅ SearchBar.jsx - added X button to cancel search
import React, { useState } from "react";
import "./SearchBar.css";

export default function SearchBar({ posts, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    const filtered = posts.filter((post) =>
      post.caption.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setResults(filtered);
  };

  return (
    <div className="search-overlay">
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search posts by country..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">Search</button>
        <button type="button" onClick={onClose} style={{ marginLeft: "10px" }}>
          ✖
        </button>
      </form>
      <div className="search-results">
        {results.length > 0
          ? results.map((post) => (
              <div key={post.id} className="result-card">
                <h4>{post.username}</h4>
                <img src={post.image} alt="post" />
                <p>{post.caption}</p>
              </div>
            ))
          : searchTerm && <p>No results found.</p>}
      </div>
    </div>
  );
}
