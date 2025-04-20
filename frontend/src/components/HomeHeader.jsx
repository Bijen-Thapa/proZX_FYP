import React, { useEffect } from "react";

import styled from "styled-components";

import vid from "/astro.mp4";
import play from "/play.png";
import pause from "/pause.png";

const Component = styled.div`
	.fade-in {
		opacity: 0;
		animation: fadeIn 1.5s ease-in-out forwards;
	}
	.fade-in:nth-child(1) {
		animation-delay: 0.5s;
	}
	.fade-in:nth-child(2) {
		animation-delay: 1s;
	}
	.fade-in:nth-child(3) {
		animation-delay: 1.5s;
	}
	.fade-in:nth-child(4) {
		animation-delay: 2s;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.button-animation {
		transition: transform 10s ease;
	}
	.button-animation:hover {
		transform: scale(1.1);
	}
`;

const VideoContainer = styled.div`
	.video-wrapper {
		aspect-ratio: 16 / 9;
	}

	.video-wrapper iframe {
		width: 100%;
		height: 100%;
	}
`;

function HomeHeader() {
	return (
		<Component>
			<section
				className="relative w-full overflow-hidden flex items-center text-white px-16 max-sm:px-6" // Added mt-16 and relative
			>
				<VideoContainer>
					<video
						id="bgVideo"
						className="fixed inset-0 w-full h-full object-cover -z-10" // Changed to fixed and added z-index
						autoPlay
						loop
						height="auto"
						muted
					>
						<source src={vid} type="video/mp4" />
						Your browser does not support the video tag.
					</video>
				</VideoContainer>
				<div
					className="absolute inset-0 bg-gradient-to-r from-gray-950 to-transparent -z-5 h-[100vh]" // Added z-index
				></div>

				<br />
				<br />
				<div class=" relative z-10  px-30 max-sm:flex-col max-sm:   w-full items-normal">
					<h1 class="text-7xl  max-sm:text-3xl font-extrabold leading-tight fade-in  ">
						Lorem <br /> Lorem ipsum 
					</h1>
					<br />
					<h2 class="text-4xl max-sm:text-sm font-semibold mt-4  fade-in pl-5 ">
						SHARPEN YOUR SKILLS, <br /> REFINE YOUR <br /> SOUND, AND BUILD YOUR{" "}
						<br /> MUSIC LEGACY.
					</h2>
					<div class="fade-in right-0 flex justify-end pr-16 -mt-16 max-sm:hidden">
						<button
							id="togglePlay"
							class=" right-0   text-black px-3   rounded-full button-animation justify-self-end"
						>
							<img id="pauseIcon" src={pause} alt="Pause" class="w-13" />
							<img
								id="playIcon"
								src={play}
								alt="Play"
								class="w-13 h-13"
								hidden
							/>
						</button>
					</div>
					<br />

					<hr class="border-t-3.9 border-white w-full mx-auto fade-in" />

					<div class="flex flex-col justify-items-start text-center">
						<p class="mt-4 text-lg md:text-xl font-semibold  fade-in duration-500">
							JOIN TODAY AND START CREATING THE WORLD AROUND YOUR MUSIC <br />{" "}
							WITH OTHER TALENTED ARTISTS.
						</p>
						<div class="  mt-6 fade-in">
							<button
								onClick={() => {
									scrollToElement("artist-slider");
								}}
								class="bg-red-500 text-white  opacity-45 hover:opacity-100 hover:bg-red-600 transition-transform duration-1000 px-5 py-3 rounded-lg font-semibold text-sm  pb-3 "
							>
								EXPLORE ARTISTS <br />
								<i class="fa-solid fa-angles-down"></i>
							</button>
						</div>
					</div>
				</div>
			</section>
		</Component>
	);
}

export default HomeHeader;
