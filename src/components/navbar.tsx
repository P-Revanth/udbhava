'use client';
export default function Navbar() {
    return (
        <nav className="w-full bg-transparent backdrop-blur-sm h-20 rounded-t-3xl">
            <div className="container h-full w-full p-15 flex items-center justify-between">

                {/* left - Navigation links */}
                <ul className="flex items-center space-x-8">
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

                {/* center - Logo/Brand */}
                <div className="flex items-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-[#5F2C66] rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-md">A</span>
                        </div>
                        <span className="text-lg font-semibold text-gray-800">AYURVEDA</span>
                    </div>
                </div>

                {/* Left side - Login/Signin buttons */}
                <div className="flex items-center space-x-4">
                    <button onClick={() => window.location.href = '/login'} className="px-4 py-2 text-md font-medium text-gray-700 hover:text-[#5F2C66] transition-colors cursor-pointer">
                        Login
                    </button>
                    <button onClick={() => window.location.href = '/sign-up'} className="px-6 py-2 text-md font-medium bg-[#5F2C66] text-white rounded-full hover:bg-[#864492] transition-colors shadow-sm cursor-pointer">
                        Sign Up
                    </button>
                </div>
            </div>
        </nav>
    );
}