import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Board from "./components/Board/Board";
import PublicBoard from "./components/Board/PublicBoard";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/public/:publicId" element={<PublicBoard />} />
          <Route path="/" element={<Board />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
