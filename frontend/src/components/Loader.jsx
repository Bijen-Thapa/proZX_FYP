import React, { useEffect } from "react";
import styled from "styled-components";
import gsap from "gsap";
import Lenis from "@studio-freight/lenis";

const Component = styled.div`
	.part-7 {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100vh;
		background-color: #000;
	}

	.our-work-txt {
		position: absolute;
		width: 60vw;
		height: 10vh;
		z-index: 9;
        display: flex;
        flex-direction: column;
	}

	#our {
		position: absolute;
		top: 0;
		left: 15%;
		transform: translate(-20%, -50%);
		color: #fff;
		font-size: 4.2vw;
	}

	#work {
		position: absolute;
		padding-left: 200px;
		bottom: 0;
		right: 15%;
		transform: translate(20%, 50%);
		color: #fff;
		font-size: 4.2vw;
	}

	.our-work-txt-div {
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		width: 100vw;
		height: 0vh;
		background-color: #fff;
	}

	.scroll-work {
		width: 100%;
		height: 100vh;
		background-color: #919191;
		overflow: hidden;
	}

	.scroll-img {
		width: 100%;
		margin-top: 0%;
		transition: all cubic-bezier(0.19, 1, 0.22, 1) 1s;
	}

	.scroll-img img {
		width: 100%;
	}

	#demo {
		position: absolute;
		bottom: -10%;
		padding: 1.5vw 3vw;
		background-color: #ffffff;
		font-size: 0.8vw;
		border: none;
		border-radius: 50px;
	}
`;

function Loader() {
	useEffect(() => {
		document.addEventListener("DOMContentLoaded", function () {
			// body...
			var n = 12;
			while (n > 0) {
				$(".animation-container").append(
					$(".animation-container").children().first().clone()
				);
				n -= 1;
			}
		});

		const lenis = new Lenis();

		lenis.on("scroll", (e) => {
			console.log(e);
		});

		function raf(time) {
			lenis.raf(time);
			requestAnimationFrame(raf);
		}

		requestAnimationFrame(raf);

		let mm = gsap.matchMedia();

		// part7

		let tl7 = gsap.timeline({
			scrollTrigger: {
				trigger: ".part-7",
				start: "50% 50%",
				end: "200% -100%",
				pin: true,
				// markers: true,
				scrub: 1,
			},
		});
		tl7.to("#demo", {
			bottom: "7%",
		});
		tl7.to(
			".our-work-txt-div",
			{
				height: "100vh",
			},
			"height"
		);
		tl7.to(
			".our-work-txt",
			{
				height: "100vh",
			},
			"height"
		);
		tl7.to(
			"#our",
			{
				left: "-150%",
				opacity: 0,
			},
			"height"
		);
		tl7.to(
			"#work",
			{
				right: "-150%",
                // bottom: "-50%",
				opacity: -10,
			},
			"height"
		);
		tl7.to(".scroll-img", {
			marginTop: "-300%",
		});
	}, []);
	return (
		<Component>
			<div class="part-7">
				<div class="our-work-txt ">
					<h1 id="our" className="fade-in">
						Geet
					</h1><br />
					<h1 id="work" className="fade-in">
						Sansar
					</h1>
				</div>
				<div class="our-work-txt-div">
					<div class="scroll-work">
						<div class="scroll-img">
							<a href="">
								<img src="sipsync/naxetra.jpg" alt="" />
							</a>

							<a
								href="https://www.youtube.com/watch?v=5_qg9Mmwkh8&ab_channel=Sip%26Sync"
								target="_blank"
							>
								<img src="/sipsync/bthregan.jpg" alt="" />
							</a>

							<a href="">
								<img src="/sipsync/yogi.jpg" alt="" />
							</a>

							<a href="">
								<img src="/sipsync/jybs.jpg" alt="" />
							</a>

							<a href="">
								<img src="/sipsync/fursang.jpg" alt="" />
							</a>

							<a href="">
								<img src="/sipsync/monique.jpg" alt="" />
							</a>
							<a href="">
								<img src="/sipsync/naxetra.jpg" alt="" />
							</a>
						</div>
					</div>
				</div>
				{/* <button id="demo">Our Vision</button> */}
			</div>
		</Component>
	);
}

export default Loader;
