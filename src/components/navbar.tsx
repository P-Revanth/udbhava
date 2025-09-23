'use client';
import { useState } from 'react';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="w-full bg-transparent backdrop-blur-sm lg:p-10 h-30 rounded-t-3xl relative z-[1000]">
            <div className="container h-full w-full px-4 lg:px-8 flex items-center justify-between">

                {/* Desktop Navigation - left side */}
                <ul className="hidden lg:flex items-center space-x-8">
                    <li>
                        <a href="#" className="text-md font-medium text-gray-700 hover:text-[#5F2C66] transition-colors cursor-pointer">
                            Home
                        </a>
                    </li>
                    <li>
                        <a href="#" className="text-md font-medium text-gray-700 hover:text-[#5F2C66] transition-colors cursor-pointer">
                            Contact Us
                        </a>
                    </li>
                    <li>
                        <a href="#" className="text-md font-medium text-gray-700 hover:text-[#5F2C66] transition-colors cursor-pointer">
                            About Us
                        </a>
                    </li>
                </ul>

                {/* Center - Logo/Brand (always visible) */}
                <div className="flex items-center lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2">
                    <div className="flex items-center space-x-2">
                        <img src="/images/logo.png" alt="Logo" className="w-8 h-8 lg:w-10 lg:h-10" />
                        <span className="text-lg lg:text-xl font-semibold text-gray-800">AYURAAHARYA</span>
                    </div>
                </div>

                {/* Desktop - Login/Signin buttons */}
                <div className="hidden lg:flex items-center space-x-4">
                    <button onClick={() => window.location.href = '/login'} className="px-4 py-2 text-md font-medium text-gray-700 hover:text-[#5F2C66] transition-colors cursor-pointer">
                        Login
                    </button>
                    <button onClick={() => window.location.href = '/sign-up'} className="px-6 py-2 text-md font-medium bg-[#5F2C66] text-white rounded-full hover:bg-[#864492] transition-colors shadow-sm cursor-pointer">
                        Sign Up
                    </button>
                </div>

                {/* Mobile - Burger Menu Button */}
                <button
                    onClick={toggleMenu}
                    className="lg:hidden flex flex-col space-y-1 p-2 focus:outline-none"
                    aria-label="Toggle menu"
                >
                    <span className={`block w-6 h-0.5 bg-gray-700 transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                    <span className={`block w-6 h-0.5 bg-gray-700 transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`block w-6 h-0.5 bg-gray-700 transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                </button>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="lg:hidden fixed top-20 left-4 right-4 bg-white/95 backdrop-blur-md shadow-lg rounded-b-3xl z-[1001]">
                        <div className="px-6 py-6 space-y-4">
                            {/* Navigation Links */}
                            <div className="space-y-4">
                                <a href="#" className="block text-lg font-medium text-gray-700 hover:text-[#5F2C66] transition-colors cursor-pointer">
                                    Home
                                </a>
                                <a href="#" className="block text-lg font-medium text-gray-700 hover:text-[#5F2C66] transition-colors cursor-pointer">
                                    About Us
                                </a>
                                <a href="#" className="block text-lg font-medium text-gray-700 hover:text-[#5F2C66] transition-colors cursor-pointer">
                                    Contact Us
                                </a>
                            </div>

                            {/* Divider */}
                            <hr className="border-gray-200" />

                            {/* Auth Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={() => window.location.href = '/login'}
                                    className="w-full px-6 py-3 text-lg font-medium text-gray-700 border border-gray-300 rounded-full hover:text-[#5F2C66] hover:border-[#5F2C66] transition-colors cursor-pointer"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => window.location.href = '/sign-up'}
                                    className="w-full px-6 py-3 text-lg font-medium bg-[#5F2C66] text-white rounded-full hover:bg-[#864492] transition-colors shadow-sm cursor-pointer"
                                >
                                    Sign Up
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}