
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Users, Shield, Star, Zap, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLoginSuccess = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      const decoded: any = jwtDecode(credentialResponse.credential);
      setUser(decoded);
      // Simple admin check: if email contains 'admin', treat as admin
      if (decoded.email && decoded.email.includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    }
  };

  const features = [
    {
      icon: MapPin,
      title: 'Report Issues',
      description: 'Quickly report road problems with photos and GPS location',
      color: 'text-blue-600'
    },
    {
      icon: Eye,
      title: 'Track Progress',
      description: 'Monitor the status of your reports from submission to resolution',
      color: 'text-green-600'
    },
    {
      icon: Users,
      title: 'Community Impact',
      description: 'Join thousands of citizens making roads safer for everyone',
      color: 'text-purple-600'
    },
    {
      icon: Shield,
      title: 'Verified Reports',
      description: 'Admin verification ensures authentic and actionable reports',
      color: 'text-orange-600'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Snap & Report',
      description: 'Take a photo of the road issue and add location details'
    },
    {
      number: '02',
      title: 'Track Status',
      description: 'Monitor your report as it moves through verification to resolution'
    },
    {
      number: '03',
      title: 'See Impact',
      description: 'Watch as your community becomes safer through collective action'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 py-20 overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,rgba(17,24,39,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,24,39,0.04)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-6 animate-fade-in">
              <Zap className="w-4 h-4 mr-2" />
              Making Roads Safer, One Report at a Time
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-fade-in [animation-delay:200ms]">
              Report Road Issues,
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Build Better Communities
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto animate-fade-in [animation-delay:400ms]">
              Join thousands of citizens using RoadTracker to report potholes, cracks, and road hazards. 
              Together, we're creating safer streets for everyone.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in [animation-delay:600ms]">
              <Link to="/report">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Report an Issue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/map">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4 rounded-xl border-2 hover:bg-gray-50 transition-all duration-300">
                  View Live Map
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 animate-fade-in [animation-delay:800ms]">
              {[
                { number: '12,847', label: 'Issues Reported' },
                { number: '8,923', label: 'Issues Resolved' },
                { number: '5,432', label: 'Active Citizens' },
                { number: '89%', label: 'Resolution Rate' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">How RoadTracker Works</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-16">Three simple steps to make your community's roads safer</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6 text-3xl font-bold text-white shadow-lg bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-700 dark:to-blue-900">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Powerful Features for Civic Engagement
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
            Everything you need to report, track, and resolve road issues in your community
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col items-center transition-colors duration-500">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${feature.color} bg-opacity-20`}></div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Preview */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Real-Time Issue Tracking</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">See reported issues on an interactive map with live updates</p>
          <div className="flex justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 w-full max-w-3xl transition-colors duration-500">
              <div className="bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-xl flex flex-col items-center justify-center h-64 mb-6 transition-colors duration-500">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-300 font-medium">Interactive Map Preview</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View live road issues across your city</p>
                </div>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow transition-all duration-300">
                Explore Live Map
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Star className="w-12 h-12 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join the RoadTracker community today and help build safer roads for everyone in your neighborhood.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/report">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100 text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Report Your First Issue
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-blue-700 text-lg px-8 py-4 rounded-xl transition-all duration-300">
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
