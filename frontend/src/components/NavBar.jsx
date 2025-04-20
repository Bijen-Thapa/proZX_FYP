import React, { useEffect } from "react";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

// import logo from "/logo.svg";

import { Link, useNavigate } from "react-router-dom";
import logo from "/logo.png";

// import { JWTverification } from "../../../middlewares/verifyJWT";

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// const NavBar = () => {
// 	// useEffect(() =>{
// 	// 	const token = localStorage.getItem("token");

// 	// 	if(token){
// 	// 		try{
// 	// 			const decoded =
// 	// 		}
// 	// 	}

// 	// })
// 	// const nav = ["Login", "Register"];
// 	const nav = ["Home", "Artists", "Services", "About", "Enquiry"];
// 	return (
// 		<>
// 			<div className="flex justify-around items-center p-2 bg-[#282828] text-white z-50 sticky top-0">
// 				<img
// 					src={logo}
// 					alt=""
// 					style={{}}
// 					className="mix-blend-screen w-12 invert"
// 				/>

// 				<div className="flex items-center justify-center p-0 opacity-45 focus-within:opacity-95">
// 					<div className="rounded-lg bg-gray-200 p-0">
// 						<div className="flex">
// 							<div className="flex w-10 items-center justify-center rounded-tl-lg rounded-bl-lg border-r border-gray-200 bg-white p-5">
// 								<svg
// 									viewBox="0 0 20 20"
// 									aria-hidden="true"
// 									className="pointer-events-none absolute w-5 fill-gray-500 transition"
// 								>
// 									<path d="M16.72 17.78a.75.75 0 1 0 1.06-1.06l-1.06 1.06ZM9 14.5A5.5 5.5 0 0 1 3.5 9H2a7 7 0 0 0 7 7v-1.5ZM3.5 9A5.5 5.5 0 0 1 9 3.5V2a7 7 0 0 0-7 7h1.5ZM9 3.5A5.5 5.5 0 0 1 14.5 9H16a7 7 0 0 0-7-7v1.5Zm3.89 10.45 3.83 3.83 1.06-1.06-3.83-3.83-1.06 1.06ZM14.5 9a5.48 5.48 0 0 1-1.61 3.89l1.06 1.06A6.98 6.98 0 0 0 16 9h-1.5Zm-1.61 3.89A5.48 5.48 0 0 1 9 14.5V16a6.98 6.98 0 0 0 4.95-2.05l-1.06-1.06Z"></path>
// 								</svg>
// 							</div>
// 							<input
// 								type="text"
// 								className="w-full max-w-[160px] bg-white pl-2 text-base font-semibold outline-0 text-black focus:outline-1 focus:outline-indigo-600"
// 								placeholder="search"
// 								id=""
// 							/>
// 							<input
// 								type="button"
// 								value="Search"
// 								className="bg-blue-500 p-2 rounded-tr-lg rounded-br-lg text-white font-semibold hover:bg-blue-800 transition-colors"
// 							/>
// 						</div>
// 					</div>
// 				</div>

// 				<ul className="flex space-x-4 text-black hidden">
// 					{nav.map((element) => {
// 						return (
// 							<Link to={"/" + element.toLowerCase()}>
// 								<button className="px-5 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 ">
// 									{element}
// 								</button>
// 							</Link>
// 						);
// 					})}
// 				</ul>
// 				<div className=" flex">
// 					<a href="#" className="underline ">
// 						Upload
// 					</a>

// 					<FontAwesomeIcon icon={faBell} size="2x" />
// 					<Link to={"/profile"}></Link>

// 					<Menu as="div" className="relative ml-3">
// 						<div>
// 							<MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
// 								<span className="absolute -inset-1.5" />
// 								<span className="sr-only">Open user menu</span>
// 								<img
// 									alt=""
// 									src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
// 									className="size-8 rounded-full"
// 								/>
// 							</MenuButton>
// 						</div>
// 						<MenuItems
// 							transition
// 							className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
// 						>
// 							<MenuItem>
// 								<a
// 									href="#"
// 									className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden hover:underline"
// 								>
// 									Your Profile
// 								</a>
// 							</MenuItem>
// 							<MenuItem>
// 								<a
// 									href="#"
// 									className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden hover:underline"
// 								>
// 									Settings
// 								</a>
// 							</MenuItem>
// 							<MenuItem>
// 								<a
// 									href="#"
// 									className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden hover:underline"
// 								>
// 									Sign out
// 								</a>
// 							</MenuItem>
// 						</MenuItems>
// 					</Menu>
// 				</div>
// 			</div>
// 		</>
// 	);
// };

function Navbar() {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/search?q=${searchQuery}`);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="bg-[#282828] shadow-md">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center">
                        <img src={logo} alt="Geet Sansar" className="w-12 invert" />
                    </Link>

                    <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
                        <input
                            type="search"
                            placeholder="Search tracks, artists..."
                            className="w-full px-4 py-2 rounded-full bg-gray-100"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                {user.isArtist && (
                                    <Link 
                                        to="/create" 
                                        className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
                                    >
                                        Upload
                                    </Link>
                                )}
                                
                                <Menu as="div" className="relative">
                                    <MenuButton className="flex items-center space-x-2">
                                        <img
                                            src={user.profilePic || "https://via.placeholder.com/32"}
                                            alt={user.username}
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <span className="text-white">{user.username}</span>
                                    </MenuButton>
                                    
                                    <MenuItems className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                                        <MenuItem>
                                            <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                Profile
                                            </Link>
                                        </MenuItem>
                                        <MenuItem>
                                            <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                Settings
                                            </Link>
                                        </MenuItem>
                                        <MenuItem>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Sign out
                                            </button>
                                        </MenuItem>
                                    </MenuItems>
                                </Menu>
                            </>
                        ) : (
                            <div className="space-x-4">
                                <Link 
                                    to="/login" 
                                    className="text-white hover:text-gray-300"
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/register" 
                                    className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
