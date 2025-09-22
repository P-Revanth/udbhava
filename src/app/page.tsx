import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <div className="h-screen bg-[#DEEED9] p-15">
      {/* Main container */}
      <div className="container h-full">
        <div className="bg-[#DEEED9] h-full rounded-3xl shadow-2xl">
          <Navbar />

          {/* Hero section */}
          <div className="px-8 py-16 lg:px-16 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">

              {/* Left content */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    Overall Wellness
                    <br />
                    <span className="text-green-600">through Ayurveda</span>
                    <br />
                    is our muse
                  </h1>

                  <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-lg">
                    Complete switch to chemical-free products to nourish your soul.
                  </p>
                </div>

                <div>
                  <button className="px-8 py-4 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                    Explore More
                  </button>
                </div>
              </div>

              {/* Right content - Product showcase */}
              <div className="relative">
                <div className="relative z-10">
                  {/* Large decorative leaf */}
                  <div className="absolute top-0 right-0 w-48 h-48 opacity-20">
                    <svg viewBox="0 0 200 200" className="w-full h-full text-green-400">
                      <path d="M100,20 Q160,40 180,100 Q160,160 100,180 Q40,160 20,100 Q40,40 100,20 Z" fill="currentColor" />
                    </svg>
                  </div>

                  {/* Product bottles mockup */}
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-8 shadow-inner">
                    <div className="grid grid-cols-2 gap-4 items-end justify-center max-w-sm mx-auto">
                      {/* Bottle 1 */}
                      <div className="bg-amber-100 rounded-2xl p-4 h-32 flex items-end justify-center shadow-sm">
                        <div className="w-6 h-16 bg-amber-600 rounded-full"></div>
                      </div>

                      {/* Bottle 2 */}
                      <div className="bg-green-100 rounded-2xl p-4 h-40 flex items-end justify-center shadow-sm">
                        <div className="w-6 h-20 bg-green-600 rounded-full"></div>
                      </div>

                      {/* Bottle 3 */}
                      <div className="bg-orange-100 rounded-2xl p-4 h-36 flex items-end justify-center shadow-sm">
                        <div className="w-6 h-18 bg-orange-600 rounded-full"></div>
                      </div>

                      {/* Bottle 4 */}
                      <div className="bg-emerald-100 rounded-2xl p-4 h-44 flex items-end justify-center shadow-sm">
                        <div className="w-6 h-22 bg-emerald-600 rounded-full"></div>
                      </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="flex justify-center mt-4 space-x-2">
                      <div className="w-3 h-3 bg-amber-800 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-700 rounded-full mt-0.5"></div>
                      <div className="w-4 h-2 bg-orange-700 rounded-full mt-0.5"></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}