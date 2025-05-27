import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Log from "./components/Log";
import Reg from "./components/Reg";
import Main from "./components/Main";
import Post from "./components/Post";
import AddPost from "./components/AddPost";
import Profile from "./components/Profile";
import Feed from "./components/Feed";

function App() {
  return (
    <Router>
      <div className="App">
        {" "}
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/log" element={<Log />} /> {/* First instance */}
          <Route path="/reg" element={<Reg />} />
          <Route path="/log" element={<Log />} /> {/* Duplicate instance */}
          <Route path="/post" element={<Post />} />
          <Route path="/addpost" element={<AddPost />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/feed" element={<Feed />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
