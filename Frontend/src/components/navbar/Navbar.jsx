import React from "react";
import { useState } from "react";
import logo from "../../assets/logo.png";
import PrimaryButton from "../common/PrimaryButton";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // state variable to track whether hamburger menu is open or not
  return (
    <>
      <div className="w-full flex justify-center  bg-primary">
        <div className="w-11/12 h-16 bg-primary flex text-gray justify-between items-center">
          <div className="flex justify center">
            <img src={logo} alt="Logo" />
          </div>

          <div className="w-2/5 relative ">
            <input
              type="text"
              placeholder="search"
              className="bg-black w-full font-medium text-sm md:text-md lg:text-lg  text-gray border border-white  outline-none pl-10 py-1"
            />
            {/* search icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-3 absolute top-2 left-2  md:size-4 lg:size-6 "
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>

          <div className="hidden md:flex gap-5">
            <button className="font-semibold">Log in</button>
            <PrimaryButton>Sign up</PrimaryButton>
          </div>
          {/* hamburger menu for smaller screens */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? "✖️" : "☰"}
            </button>
          </div>
        </div>
        {/* Mobile dropdowns */}
      </div>
      {isOpen && (
        <div
          className="md:hidden w-full font-semibold flex flex-col text-gray gap-2 border-t border-gray-800
         bg-black opacity-60 p-5"
        >
          <button>Log In</button>
          <button>Sign Up</button>
        </div>
      )}
    </>
  );
}

export default Navbar;
