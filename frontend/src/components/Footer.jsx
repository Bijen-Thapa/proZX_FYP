import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faFacebook,
	faInstagram,
	faGithub,
	faLinkedin,
} from "@fortawesome/free-brands-svg-icons";

function Footer() {
	return (
		<div>
			<footer className="bg-blue-100/80 font-sans dark:bg-gray-900 relative">
				<div className="container px-6 py-6 mx-auto">
					<div className="flex p-5 px-16 justify-between  grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-4">
						<div>
							<img src="/logo.png" alt="" className="invert w-32"/>
						</div>
						<div className="sm:justify-items-start">
							<p className="font-semibold text-gray-800 dark:text-white">
								Quick Link
							</p>

							<div className="flex flex-col items-start mt-5 space-y-2">
								<p className="text-gray-600 transition-colors duration-300 dark:text-gray-300 dark:hover:text-blue-400 hover:underline hover:cursor-pointer hover:text-blue-500">
									Home
								</p>
								<p className="text-gray-600 transition-colors duration-300 dark:text-gray-300 dark:hover:text-blue-400 hover:underline hover:cursor-pointer hover:text-blue-500">
									Who We Are
								</p>
							</div>
						</div>

						<div className="sm:justify-items-start">
							<p className="font-semibold text-gray-800 dark:text-white ">
								Navigation
							</p>

							<div className="flex flex-col items-start mt-5 space-y-2">
								<p className="text-gray-600 transition-colors duration-300 dark:text-gray-300 dark:hover:text-blue-400 hover:underline hover:cursor-pointer hover:text-blue-500">
									lorem
								</p>
								<p className="text-gray-600 transition-colors duration-300 dark:text-gray-300 dark:hover:text-blue-400 hover:underline hover:cursor-pointer hover:text-blue-500">
									lorem
								</p>
								<p className="text-gray-600 transition-colors duration-300 dark:text-gray-300 dark:hover:text-blue-400 hover:underline hover:cursor-pointer hover:text-blue-500">
									lorem
								</p>
							</div>
						</div>
						<div className="sm:col-span-2 justify-items-start">
							<h1 className="max-w-lg text-xl font-semibold tracking-tight text-gray-800 xl:text-2xl dark:text-white">
								Subscribe our newsletter to get an update.
							</h1>

							<div className="flex mb-5 flex-col mx-auto mt-6 space-y-3 md:space-y-0 md:flex-row">
								<input
									id="emailFoot"
									type="text"
									className="px-4 py-2 text-gray-700 bg-white border rounded-md dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-opacity-40 focus:ring-blue-300"
									placeholder="Email Address"
								/>

								<button className="w-full px-6 py-2.5 text-sm font-medium tracking-wider text-white transition-colors duration-300 transform md:w-auto md:mx-4 focus:outline-none bg-gray-800 rounded-lg hover:bg-gray-700 focus:ring focus:ring-gray-300 focus:ring-opacity-80">
									Subscribe
								</button>
							</div>
							<div className="flex gap-4 hover:cursor-pointer ">
								<FontAwesomeIcon
									icon={faFacebook}
									size="2x"
									alt="fb"
									className="hover:opacity-50"
								/>
								<FontAwesomeIcon
									icon={faInstagram}
									size="2x"
									alt="ig"
									className="hover:opacity-50"
								/>
								<FontAwesomeIcon
									icon={faGithub}
									size="2x"
									alt="fb"
									className="hover:opacity-50"
								/>
								<FontAwesomeIcon
									icon={faLinkedin}
									size="2x"
									alt="fb"
									className="hover:opacity-50"
								/>
							</div>
						</div>
					</div>

					<div className="sm:flex sm:items-center sm:justify-end">
						{/* <div className="flex flex-1 gap-4 hover:cursor-pointer">
                <img src="https://www.svgrepo.com/show/303139/google-play-badge-logo.svg" width="130" height="110" alt="" />
                <img src="https://www.svgrepo.com/show/303128/download-on-the-app-store-apple-logo.svg" width="130" height="110" alt="" />
                </div> */}
					</div>
					<hr className="my-6 border-gray-200 md:my-2 dark:border-gray-700 h-2" />

					<p className="font-sans p-8 text-start md:text-center md:text-lg md:p-2">
						© 2024 Geet Sansar. All rights reserved.
					</p>
				</div>
			</footer>
		</div>
	);
}

export default Footer;
