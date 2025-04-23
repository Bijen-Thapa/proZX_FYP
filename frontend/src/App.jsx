import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";

import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./pages/Home";

import userProfile from "./components/userProfile";
import EmailVerification from "./components/EmailVerification";

// import { Route, Routes } from "react-router-dom";

import { CookiesProvider, useCookies } from "react-cookie";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Navbar from './components/Navbar';
import Feed from "./components/Feed";
import Profile from "./components/Profile";
import CreatePost from "./components/CreatePost";
import AudioPlayer from "./components/AudioPlayer";
import PostContent from "./components/PostContent";

import { AuthProvider } from "./context/AuthContext";
import AudioPost from "./components/AudioPost";
import { ThemeProvider } from "./context/ThemeContext";
import { AdminProvider } from "./context/AdminContext";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminUsers from "./components/admin/AdminUsers";
import AdminPosts from "./components/admin/AdminPosts";
import AdminArtists from "./components/admin/AdminArtists";
import AdminOverview from "./components/admin/AdminOverview";

function App() {
    const [cookies, setCookie] = useCookies(["user"]);
    const [count, setCount] = useState(0);

    function handleLogin(user) {
        setCookie("user", user, { path: "/" });
    }
    return (
        <ThemeProvider>
            <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
                <AuthProvider>
                    <AdminProvider>
                        <NavBar />
                        <Routes>
                            <Route path={"/"} element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/userprofile" element={<userProfile />} />
                            <Route path="/verify-email" element={<EmailVerification />} />
                            <Route path="/verify-email/:token" element={<EmailVerification />} />
                            <Route path="/post" element={<PostContent />} />
                            <Route path="/feed" element={<Feed />} />
                            <Route path="/profile" element={<Profile />} />
                            
                            {/* Admin routes */}
                            <Route path="/admin/login" element={<AdminLogin />} />
                            <Route path="/admin" element={<AdminDashboard />}>
                                <Route index element={<AdminOverview />} />
                                <Route path="dashboard" element={<AdminOverview />} />
                                <Route path="users" element={<AdminUsers />} />
                                <Route path="posts" element={<AdminPosts />} />
                                <Route path="artists" element={<AdminArtists />} />
                            </Route>
                        </Routes>
                        <Footer />
                    </AdminProvider>
                </AuthProvider>
            </div>
        </ThemeProvider>
    );
}

export default App;
