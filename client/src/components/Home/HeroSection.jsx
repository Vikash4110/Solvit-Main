import React from "react";
import {
  Brain,
  CheckCircle,
  Heart,
  MessageCircle,
  Shield,
  Star,
  UserPlus,
  Users,
  Calendar,
  Award,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Link } from 'react-router-dom';
import logo from "../../assets/logo.png";
import Img from "../../assets/vecteezy_world-mental-health-day-logo_51045099.png";
import { useCounselorAuth } from "../../contexts/CounselorAuthContext";
import { useClientAuth } from "../../contexts/ClientAuthContext";

const HeroSection = () => {
  const { counselor, counselorLoading } = useCounselorAuth();
  const { client, clientLoading } = useClientAuth();

  const isAuthenticated = !!(counselor || client);
  const isLoading = counselorLoading || clientLoading;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 py-20 px-4 sm:px-6 lg:px-8">
      {/* Background floating blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Content container */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Left content - text and buttons */}
        <div className="space-y-8 animate-fadeInUp">
          <div className="inline-flex items-center space-x-3 rounded-full bg-blue-100 px-5 py-3 text-blue-700 font-semibold shadow-lg ring-1 ring-blue-200">
            <Shield className="w-5 h-5" />
            <span>Verified & Licensed Counselors</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight tracking-tight mb-1">
            <span className="text-gray-900">Progress in</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Mental Wellness
            </span>
            <br />
            <span className="text-gray-900">— with Solvit</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 max-w-2xl">
            Partner with certified counselors in a safe, supportive environment.
            Start your journey towards better mental health — personalized,
            secure, and stigma-free.
          </p>

          {/* ✅ CONDITIONAL BUTTONS - Only show when NOT authenticated */}
          {!isAuthenticated && !isLoading && (
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/login"
                className="inline-flex items-center justify-center bg-indigo-600 text-white rounded-xl px-8 py-4 font-semibold shadow-lg hover:bg-indigo-700 transition-all duration-300 hover:scale-105"
              >
                <MessageCircle className="w-6 h-6 mr-2" />
                Start Your Journey
              </Link>
              <Link
                to="/counselor/login"
                className="inline-flex items-center justify-center border-2 border-indigo-600 text-indigo-600 rounded-xl px-8 py-4 font-semibold hover:bg-indigo-50 transition-all duration-300"
              >
                <UserPlus className="w-6 h-6 mr-2" />
                Join as Expert
              </Link>
            </div>
          )}

          {/* ✅ UPDATED: Styled welcome message aligned with hero section design */}
          {isAuthenticated && (
            <div className="relative">
              {/* Background gradient similar to floating blobs */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/50 via-blue-100/50 to-purple-100/50 rounded-2xl blur-sm" />
              
              {/* Main welcome card */}
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
                {/* Welcome header with gradient text */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      <span className="text-gray-900">Welcome back, </span>
                      <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {counselor?.fullName || client?.fullName}
                      </span>
                      <span className="text-gray-900">!</span>
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {counselor 
                        ? "Ready to help more clients on their wellness journey?"
                        : "Continue your path to better mental health."
                      }
                    </p>
                  </div>
                </div>

                {/* Action buttons with hero section styling */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to={counselor ? "/counselor/dashboard" : "/client/dashboard"}
                    className="inline-flex items-center justify-center bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl px-6 py-3 font-semibold shadow-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 hover:scale-105"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                  
                  {!counselor && (
                    <Link
                      to="/browse-counselors"
                      className="inline-flex items-center justify-center border-2 border-indigo-600 text-indigo-600 rounded-xl px-6 py-3 font-semibold hover:bg-indigo-50 transition-all duration-300"
                    >
                      <Users className="w-5 h-5 mr-2" />
                      Find Counselors
                    </Link>
                  )}
                  
                  {/* {counselor && (
                    <Link
                      to="/blogs"
                      className="inline-flex items-center justify-center border-2 border-purple-600 text-purple-600 rounded-xl px-6 py-3 font-semibold hover:bg-purple-50 transition-all duration-300"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Manage Blogs
                    </Link>
                  )} */}
                </div>

                {/* Status indicators matching hero badges */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <span className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full shadow-sm font-medium">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>
                      {counselor ? "Available for Sessions" : "Active Member"}
                    </span>
                  </span>
                  
                  <span className="inline-flex items-center space-x-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full shadow-sm font-medium">
                    <Shield className="w-4 h-4" />
                    <span>Verified Account</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Feature badges */}
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <span className="inline-flex items-center space-x-2 bg-white/80 px-3 py-2 rounded-full shadow-sm">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span>24/7 Availability</span>
            </span>
            <span className="inline-flex items-center space-x-2 bg-white/80 px-3 py-2 rounded-full shadow-sm">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Secure & Confidential</span>
            </span>
            <span className="inline-flex items-center space-x-2 bg-white/80 px-3 py-2 rounded-full shadow-sm">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Affordable Care</span>
            </span>
          </div>
        </div>

        {/* Right content - image with floating elements */}
        <div className="relative flex justify-center">
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5">
              <img
                src={Img}
                alt="Mental Health Journey"
                className="w-full h-auto object-cover max-w-md hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Floating icons */}
            <div className="absolute -top-6 -left-6 p-4 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg animate-pulse">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-6 -right-6 p-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-xl animate-bounce">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>

            <div className="absolute bottom-12 -left-12 bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:scale-110 transition-transform duration-300">
              <div className="text-center">
                <div className="font-bold text-2xl text-green-600">98%</div>
                <div className="text-xs text-gray-500">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
