import {
  Brain,
  CheckCircle,
  Heart,
  MessageCircle,
  Shield,
  Sparkles,
  Star,
  UserPlus,
  Users,
} from "lucide-react";
import React from "react";
import Img from "../../assets/vecteezy_world-mental-health-day-logo_51045099.png";

const HeroSection = () => {
  return (
    <section className="relative py-20 min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.08),transparent_50%)]"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-tr from-indigo-400/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8 animate-fade-in-up">
            {/* Enhanced Trust Badge */}
            <div>
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-lg border border-blue-200/50 backdrop-blur-sm">
                <Shield className="w-4 h-4" />
                <span>Verified & Licensed Professionals</span>
                <div className="flex space-x-1 ml-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3 h-3 text-yellow-500 fill-yellow-500"
                    />
                  ))}
                </div>
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                  4.9/5
                </span>
              </div>
            </div>

            {/* Enhanced Main Heading */}
            <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
                Transform
              </span>
              <br />
              <span className="text-slate-800">Your Life with</span>
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-4">
                Expert Support
                <Sparkles className="w-12 h-12 text-yellow-500 animate-pulse" />
              </span>
            </h1>

            {/* Enhanced Subtitle */}
            <p className="text-xl text-slate-600 max-w-xl leading-relaxed font-medium">
              Connect with certified counselors, therapists, and life coaches in
              a safe, stigma-free environment. Your mental wellness journey
              starts here with personalized care that truly understands you.
            </p>

            {/* Enhanced Trust Indicators */}
            <div className="flex items-center space-x-8 py-4">
              <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-full shadow-lg border border-slate-200/50">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-slate-800 text-lg">50K+</span>
                <span className="text-sm text-slate-600">Happy Clients</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-full shadow-lg border border-slate-200/50">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-bold text-slate-800 text-lg">500+</span>
                <span className="text-sm text-slate-600">Licensed Experts</span>
              </div>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
              <button className="group relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center space-x-3 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <MessageCircle className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Start Your Journey</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>

              <button className="group border-2 border-slate-300 bg-white/90 backdrop-blur-sm text-slate-700 px-8 py-4 rounded-2xl font-bold flex items-center justify-center space-x-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105">
                <UserPlus className="w-5 h-5 transition-colors duration-300 group-hover:text-blue-600" />
                <span>Join as Expert</span>
              </button>
            </div>

            {/* Enhanced Additional Info */}
            <div className="pt-6 flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-2 text-slate-600 bg-white/60 px-3 py-2 rounded-full backdrop-blur-sm border border-slate-200/50">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                24/7 Available
              </span>
              <span className="flex items-center gap-2 text-slate-600 bg-white/60 px-3 py-2 rounded-full backdrop-blur-sm border border-slate-200/50">
                <Shield className="w-3 h-3 text-blue-500" />
                Secure & Private
              </span>
              <span className="flex items-center gap-2 text-slate-600 bg-white/60 px-3 py-2 rounded-full backdrop-blur-sm border border-slate-200/50">
                <Heart className="w-3 h-3 text-red-500" />
                Affordable Care
              </span>
            </div>
          </div>

          {/* Right Side - Enhanced Visual with Mental Health Background */}
          <div className="relative lg:pl-8 animate-fade-in-right">
            <div className="relative">
              {/* Main Visual Container with Mental Health Background */}
              <div className="relative bg-gradient-to-br from-white/95 to-blue-50/95 rounded-3xl p-8 shadow-2xl border border-blue-100 backdrop-blur-sm overflow-hidden">
                {/* Mental Health Background Image */}

                <img
                  src={Img}
                  className="absolute inset-0 opacity-20 bg-cover bg-center bg-no-repeat rounded-3xl"
                />

                {/* Gradient Overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-blue-50/80 to-indigo-50/90 rounded-3xl"></div>

                {/* Content over background */}
                <div className="relative z-10 aspect-square bg-gradient-to-br from-transparent via-white/30 to-transparent rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <div className="text-center space-y-6 p-8">
                    <div className="relative">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                        <Brain className="w-12 h-12 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                        <Heart className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-slate-800 drop-shadow-sm">
                        Professional Mental Care
                      </h3>
                      <p className="text-slate-600 font-medium drop-shadow-sm">
                        Personalized therapy and support for your unique mental
                        wellness journey
                      </p>

                      {/* Additional mental health indicators */}
                      <div className="flex justify-center gap-4 pt-4">
                        <div className="flex items-center gap-2 bg-white/80 px-3 py-2 rounded-full shadow-sm backdrop-blur-sm">
                          <MessageCircle className="w-4 h-4 text-blue-500" />
                          <span className="text-xs font-medium text-slate-700">
                            Therapy
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/80 px-3 py-2 rounded-full shadow-sm backdrop-blur-sm">
                          <Users className="w-4 h-4 text-green-500" />
                          <span className="text-xs font-medium text-slate-700">
                            Support
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-full shadow-2xl animate-bounce border-2 border-white">
                  <CheckCircle className="w-5 h-5" />
                </div>

                <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-full shadow-2xl animate-bounce delay-1000 border-2 border-white">
                  <Shield className="w-5 h-5" />
                </div>
              </div>

              {/* Enhanced Decorative Background Elements */}
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-cyan-400/30 to-blue-400/30 rounded-full blur-xl animate-pulse delay-700"></div>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="absolute -left-8 top-20 bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-2xl border border-slate-200/50 hover:scale-110 transition-transform duration-300 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-green-600 fill-green-600" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-lg">4.9/5</div>
                  <div className="text-xs text-slate-500 font-medium">
                    Client Rating
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -right-8 bottom-20 bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-2xl border border-slate-200/50 hover:scale-110 transition-transform duration-300 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-lg">98%</div>
                  <div className="text-xs text-slate-500 font-medium">
                    Success Rate
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-fade-in-right {
          animation: fade-in-right 1s ease-out 0.3s both;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
