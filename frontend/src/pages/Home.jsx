import React, { useEffect } from "react";
import styled from "styled-components";
import HomeHeader from "../components/HomeHeader";
import Loader from "../components/Loader";
import { motion } from "framer-motion"; // Add this import for animations

const PrimaryButton = ({ children, onClick, className = "" }) => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`bg-red-500 p-3 px-6 rounded-xl hover:bg-red-800 transition-colors duration-300 text-white ${className}`}
        onClick={onClick}
    >
        {children}
        <i className="fa-solid fa-arrow-right align-middle ps-1"></i>
    </motion.button>
);

function Home() {
    return (
        <div className="min-h-screen"> {/* Add padding-top to prevent navbar overlap */}
            <HomeHeader />

            {/* Featured Content Section */}
            <section className="px-4 md:px-8 lg:px-16 py-12 bg-white">
                <h2 className="text-2xl font-bold mb-8 text-black">Featured Songs</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {/* Songs Grid */}
                    {[1, 2, 3, 4].map((item) => (
                        <motion.div
                            key={item}
                            whileHover={{ scale: 1.05 }}
                            className="bg-white rounded-lg shadow-md overflow-hidden"
                        >
                            <div className="bg-slate-400 h-48 w-full"></div>
                            <div className="p-4">
                                <h3 className="font-semibold text-black">Song Name</h3>
                                <p className="text-gray-400">Artist Name</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <h2 className="text-2xl font-bold my-8 text-black">Popular Artists</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                    {/* Artists Grid */}
                    {[1, 2, 3, 4].map((item) => (
                        <motion.div
                            key={item}
                            whileHover={{ scale: 1.05 }}
                            className="text-center"
                        >
                            <div className="bg-slate-400 h-36 w-36 rounded-full mx-auto"></div>
                            <h3 className="mt-4 font-semibold text-black">Artist Name</h3>
                            <p className="text-gray-400">Genre</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* About Section */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between">
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="w-full md:w-1/2 md:pr-12"
                    >
                        <h2 className="font-bold text-3xl md:text-5xl text-red-500">
                            About Section
                        </h2>
                        <p className="mt-6 text-justify text-black">
                            Lorem ipsum dolor sit amet consectetur...
                        </p>
                        <div className="mt-8">
                            <PrimaryButton>Explore more about our Artists</PrimaryButton>
                        </div>
                    </motion.div>
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="w-full md:w-1/2 mt-8 md:mt-0"
                    >
                        <img
                            src="/logo.png"
                            alt="AstroNote Artists"
                            className="mix-blend-multiply max-w-md mx-auto"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Sign Up Section */}
            <section className="py-20 bg-gradient-to-b from-white to-gray-50">
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto text-center px-4"
                >
                    <h1 className="text-4xl md:text-6xl font-bold text-black mb-6">
                        Thanks for listening, Join us Now
                    </h1>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        Lorem ipsum dolor sit amet consectetur...
                    </p>
                    <PrimaryButton>Create Account</PrimaryButton>
                    <p className="mt-6 text-gray-600">
                        Already have an account?{" "}
                        <a href="/login" className="text-red-500 hover:text-red-700">
                            Login
                        </a>
                    </p>
                </motion.div>
            </section>
        </div>
    );
}

export default Home;
