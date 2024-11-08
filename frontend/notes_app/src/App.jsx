import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp'; // Fixed typo in SignUp import

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Redirect from root path to /Login */}
        <Route path="/" element={<Navigate to="/Login" />} />
        <Route path="/dashboard" exact element={<Home />} />
        <Route path="/Login" exact element={<Login />} />
        <Route path="/signup" exact element={<SignUp />} />
      </Routes>
    </Router>
  );
}

export default App;
