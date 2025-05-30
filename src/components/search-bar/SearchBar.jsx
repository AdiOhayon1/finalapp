import React from "react";
import { FaSearch } from "react-icons/fa";
import "./SearchBar.css";

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search posts..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <FaSearch className="search-icon" />
    </div>
  );
};

export default SearchBar; 