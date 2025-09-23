'use client';
import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#EAD9ED] p-4 md:p-8 lg:p-10">
      {/* Main container */}
      <div className="container h-full w-full mx-auto">
        <div className="bg-[#FFF4FF] min-h-screen rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden">
          <Navbar />

          {/* Hero section */}
          <div className="px-4 py-8 sm:px-6 md:px-8 lg:px-16 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

              {/* Left content */}
              <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
                <div className="space-y-3 lg:space-y-4">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                    Food Isn't Just Nutrition,
                    <br className="hidden sm:block" />
                    It's Medicine—Discover the Healing
                    <span className="text-[#5F2C66]"> Power of Ayurveda</span>
                    <br className="hidden sm:block" />
                    in Your Daily Plate.
                  </h1>
                  <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-2xl lg:max-w-lg mx-auto lg:mx-0">
                    Smarter care for every unique body. Eat right for your dosha, season, and lifestyle.
                  </p>
                </div>

                <div className="flex justify-center lg:justify-start">
                  <button
                    onClick={() => window.location.href = '/sign-up'}
                    className="px-6 py-3 md:px-8 md:py-4 bg-[#5F2C66] text-white font-semibold rounded-full hover:bg-[#8c5f94] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-base md:text-lg"
                  >
                    Explore More
                  </button>
                </div>
              </div>

              {/* Right content - Product showcase */}
              <div className="relative order-first lg:order-last sm:z-10 md:z-0">
                <img
                  src="/images/home-page-img.jpg"
                  alt="home-image"
                  className="w-full h-auto rounded-2xl md:rounded-3xl lg:rounded-4xl sm:z-10 shadow-lg"
                />
              </div>

            </div>
          </div>

          {/* Additional responsive features section */}
          <div className="px-4 sm:px-6 md:px-8 lg:px-16 pb-8 lg:pb-16">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">

              {/* Feature 1 */}
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 text-center hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 bg-[#5F2C66] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌿</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalized Plans</h3>
                <p className="text-sm text-gray-600">Customized diet plans based on your unique dosha and health goals.</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 text-center hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 bg-[#5F2C66] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert Guidance</h3>
                <p className="text-sm text-gray-600">Connect with certified Ayurvedic dietitians for professional advice.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 text-center hover:shadow-lg transition-shadow duration-300 sm:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 bg-[#5F2C66] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚖️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Holistic Wellness</h3>
                <p className="text-sm text-gray-600">Balance your mind, body, and spirit through ancient wisdom.</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}