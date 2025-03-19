import React, { useEffect } from "react";

import styled from "styled-components";

import HomeHeader from "../components/HomeHeader";
import Loader from "../components/Loader";

const PrimaryButton = ({ children, onClick, className = "" }) => (
	<button
		className={`bg-red-500 p-3 px-6 rounded-xl hover:bg-red-800 transition-colors duration-300 text-white ${className}`}
		onClick={onClick}
	>
		{children}
		<i className="fa-solid fa-arrow-right align-middle ps-1"></i>
	</button>
);

const cardSize = "h-48 w-48";

function Home() {
	return (
		<div className="items-center justify-center flex flex-col">
			{/* <Loader /> */}
			<HomeHeader />
			<section className="pt-40">
				<div className="grid grid-cols-4 grid-rows-2 gap-4">
					<div className="row-span-2 text-black">
						<div className="bg-slate-400 h-36 w-36"></div>
						<h2>Song Name</h2>
						<p className="text-gray-400">lorem ipsum</p>
					</div>
					<div className="row-span-2">
						<div className="row-span-2 text-black">
							<div className="bg-slate-400 h-36 w-36"></div>
							<h2>Song Name</h2>
							<p className="text-gray-400">lorem ipsum</p>
						</div>
					</div>
					<div className="row-span-2">
						<div className="row-span-2 text-black">
							<div className="bg-slate-400 h-36 w-36"></div>
							<h2>Song Name</h2>
							<p className="text-gray-400">lorem ipsum</p>
						</div>
					</div>
					<div className="row-span-2 row-start-3">
						<div className="row-span-2 text-black">
							<div className="bg-slate-400 h-36 w-36"></div>
							<h2>Song Name</h2>
							<p className="text-gray-400">lorem ipsum</p>
						</div>
					</div>
					<div className="row-span-2 row-start-3">
						<div className="row-span-2 text-black">
							<div className="bg-slate-400 h-36 w-36"></div>
							<h2>Song Name</h2>
							<p className="text-gray-400">lorem ipsum</p>
						</div>
					</div>
					<div className="row-span-2 row-start-3">
						<div className="row-span-2 text-black">
							<div className="bg-slate-400 h-36 w-36"></div>
							<h2>Song Name</h2>
							<p className="text-gray-400">lorem ipsum</p>
						</div>
					</div> 
					<div className="row-span-2 ">
						<div className="row-span-2 text-black">
							<div className="bg-slate-400 h-36 w-36 rounded-full"></div>
							<h2>Song Name</h2>
							<p className="text-gray-400">lorem ipsum</p>
						</div>
					</div>
					<div className="row-span-2 row-start-3">
						<div className="row-span-2 text-black ">
							<div className="bg-slate-400 h-36 w-36 rounded-full"></div>
							<h2>Song Name</h2>
							<p className="text-gray-400">lorem ipsum</p>
						</div>
					</div>
				</div>
			</section>
			<section className="flex flex-col md:flex-row items-center justify-evenly py-16 px-4 md:px-16 snap-always snap-start self-center ">
				<div className="w-full md:w-1/2 p-20">
					<h2 className="font-bold text-3xl md:text-5xl text-red-500">
						About Section
					</h2>
					<p className="mt-6 text-justify text-black">
						Lorem ipsum dolor sit amet consectetur. A elit aliquet dui et
						vestibulum feugiat. Nibh sed imperdiet tempus eu nisi ornare blandit
						sit tincidunt. At eros bibendum ut neque turpis. Donec amet porta ac
						in nisl proin in. Lorem ipsum dolor sit amet consectetur. A elit
						aliquet dui et vestibulum feugiat. Nibh sed imperdiet tempus eu nisi
						ornare blandit sit tincidunt. At eros bibendum ut neque turpis.
						Donec amet porta ac in nisl proin in. Lorem ipsum dolor sit amet
						consectetur.
					</p>
					<div className="mt-8">
						<PrimaryButton>Explore more about our Artists</PrimaryButton>
					</div>
				</div>
				<div className="w-fit  mt-8 md:mt-0 ">
					<img
						src="/logo.png"
						alt="AstroNote Artists"
						className="mix-blend-multiply w-fit h-auto"
					/>
				</div>
			</section>

			<section className="text-black justify-center items-center flex flex-col p-20">
				<h1 className="text-6xl font-bold">
					Thanks for listening, Join us Now
				</h1>
				<br />
				<p className="text-balance px-12 text-center">
					Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis
					nemo illum quod tempore mollitia. Sit aperiam quae voluptatum veniam
					cum nobis quas culpa facilis ad quibusdam rerum animi, et ipsa.
				</p>
				<br />
				<PrimaryButton>Create Account</PrimaryButton>
				<br />
				<span>
					Already have an account?<a href="/login">Login</a>
				</span>
			</section>
		</div>
	);
}

export default Home;
