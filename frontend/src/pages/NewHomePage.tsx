import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Users, 
  TrendingUp, 
  Shield, 
  ArrowRight, 
  Star,
  CheckCircle,
  Clock,
  MessageSquare,
  BarChart3,
  Globe,
  Heart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const HomePage: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { icon: Users, value: '10K+', label: 'Active Citizens', color: 'from-blue-500 to-cyan-500' },
    { icon: MapPin, value: '2.5K+', label: 'Issues Resolved', color: 'from-green-500 to-emerald-500' },
    { icon: TrendingUp, value: '95%', label: 'Response Rate', color: 'from-purple-500 to-pink-500' },
    { icon: Clock, value: '48hrs', label: 'Avg. Response Time', color: 'from-orange-500 to-red-500' },
  ];

  const features = [
    {
      icon: MapPin,
      title: 'Location-Based Reporting',
      description: 'Report issues with precise location data and visual documentation.',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Users,
      title: 'Community Engagement',
      description: 'Connect with neighbors and collaborate on local improvements.',
      color: 'bg-green-50 text-green-600',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Tracking',
      description: 'Monitor progress and receive updates on reported issues.',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security.',
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Community Leader',
      avatar: 'SJ',
      rating: 5,
      text: 'CivicTrack has transformed how our neighborhood addresses local issues. Response times have improved dramatically.',
    },
    {
      name: 'Mike Chen',
      role: 'Local Resident',
      avatar: 'MC',
      rating: 5,
      text: 'Finally, a platform that gives citizens a real voice. The tracking feature keeps everyone accountable.',
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Urban Planner',
      avatar: 'ER',
      rating: 5,
      text: 'The data insights from CivicTrack help us make better decisions for city planning and resource allocation.',
    },
  ];

  const recentActivity = [
    { type: 'resolved', title: 'Pothole on Main Street', time: '2 hours ago', status: 'completed' },
    { type: 'reported', title: 'Broken streetlight at Park Ave', time: '4 hours ago', status: 'in-progress' },
    { type: 'updated', title: 'Graffiti removal downtown', time: '6 hours ago', status: 'pending' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-purple-100 opacity-70"></div>
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + i * 10}%`,
              }}
            />
          ))}
        </div>

        <div className="container-responsive relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants} className="mb-8">
              <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full mb-4">
                🚀 Empowering Communities Since 2024
              </span>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-tight">
                Your Voice,
                <br />
                Your Community
              </h1>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed"
            >
              Report, track, and resolve civic issues in your community.
              <br />
              Join thousands of citizens making a real difference.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              {user ? (
                <Link
                  to="/report"
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Report an Issue
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      Get Started Free
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:border-blue-500 hover:text-blue-600 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container-responsive">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.span variants={itemVariants} className="text-blue-600 font-semibold text-lg">
              Powerful Features
            </motion.span>
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6">
              Everything you need to make an impact
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-gray-600 max-w-3xl mx-auto">
              From reporting to resolution, CivicTrack provides all the tools needed to create meaningful change in your community.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="py-24 bg-white">
        <div className="container-responsive">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <div>
              <motion.span variants={itemVariants} className="text-purple-600 font-semibold text-lg">
                Live Updates
              </motion.span>
              <motion.h2 variants={itemVariants} className="text-4xl font-bold text-gray-900 mt-4 mb-6">
                See real-time community progress
              </motion.h2>
              <motion.p variants={itemVariants} className="text-xl text-gray-600 mb-8">
                Track the pulse of your community with live updates on issue reports, government responses, and resolution progress.
              </motion.p>
              <motion.div variants={itemVariants}>
                <Link
                  to="/issues"
                  className="inline-flex items-center text-purple-600 font-semibold hover:text-purple-700 transition-colors"
                >
                  View All Issues
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      activity.status === 'completed' ? 'bg-green-500' :
                      activity.status === 'in-progress' ? 'bg-blue-500' : 'bg-orange-500'
                    }`}></div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{activity.title}</h4>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {activity.time}
                        <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                          activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                          activity.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {activity.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container-responsive">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.span variants={itemVariants} className="text-blue-600 font-semibold text-lg">
              Testimonials
            </motion.span>
            <motion.h2 variants={itemVariants} className="text-4xl font-bold text-gray-900 mt-4 mb-6">
              Loved by communities everywhere
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed italic">"{testimonial.text}"</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container-responsive text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to make a difference?
              </h2>
              <p className="text-xl text-blue-100 mb-10">
                Join thousands of citizens who are already creating positive change in their communities.
              </p>
              <motion.div variants={itemVariants}>
                {user ? (
                  <Link
                    to="/report"
                    className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-2xl hover:bg-gray-100 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl"
                  >
                    <Heart className="mr-2 w-5 h-5" />
                    Start Reporting Issues
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-2xl hover:bg-gray-100 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl"
                  >
                    <Heart className="mr-2 w-5 h-5" />
                    Join CivicTrack Today
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
