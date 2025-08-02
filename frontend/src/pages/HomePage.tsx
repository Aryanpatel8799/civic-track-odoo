import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
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
  Heart,
  Sparkles,
  Zap,
  Award,
  Target,
  Camera,
  Smartphone,
  Eye,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { scrollY } = useScroll();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Parallax transforms
  const y1 = useTransform(scrollY, [0, 300], [0, 100]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const stats = [
    { 
      icon: Users, 
      value: '50K+', 
      label: 'Active Citizens', 
      color: 'from-blue-500 to-cyan-500',
      description: 'Engaged community members'
    },
    { 
      icon: MapPin, 
      value: '12K+', 
      label: 'Issues Resolved', 
      color: 'from-green-500 to-emerald-500',
      description: 'Successfully completed projects'
    },
    { 
      icon: TrendingUp, 
      value: '98%', 
      label: 'Response Rate', 
      color: 'from-purple-500 to-pink-500',
      description: 'Government response efficiency'
    },
    { 
      icon: Clock, 
      value: '24hrs', 
      label: 'Avg. Response', 
      color: 'from-orange-500 to-red-500',
      description: 'Average initial response time'
    },
  ];

  const features = [
    {
      icon: Camera,
      title: 'Visual Documentation',
      description: 'Capture issues with high-quality photos and geo-location data for precise reporting.',
      color: 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200',
      iconColor: 'text-blue-600',
    },
    {
      icon: Users,
      title: 'Community Collaboration',
      description: 'Connect with neighbors, vote on priorities, and track collective impact.',
      color: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200',
      iconColor: 'text-green-600',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Monitor progress with detailed insights and transparent government response tracking.',
      color: 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200',
      iconColor: 'text-purple-600',
    },
    {
      icon: Shield,
      title: 'Secure & Transparent',
      description: 'Bank-level security with full transparency in government response and actions.',
      color: 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200',
      iconColor: 'text-orange-600',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Community Leader',
      avatar: 'SJ',
      rating: 5,
      text: 'CivicTrack revolutionized how our neighborhood addresses local issues. The response times have improved dramatically and we feel truly heard.',
      image: '/api/placeholder/64/64',
    },
    {
      name: 'Mike Chen',
      role: 'Local Business Owner',
      avatar: 'MC',
      rating: 5,
      text: 'Finally, a platform that gives citizens a real voice. The tracking feature keeps everyone accountable and builds trust in our local government.',
      image: '/api/placeholder/64/64',
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Urban Planning Expert',
      avatar: 'ER',
      rating: 5,
      text: 'The data insights from CivicTrack help us make evidence-based decisions for city planning. It\'s an invaluable tool for sustainable urban development.',
      image: '/api/placeholder/64/64',
    },
  ];

  const recentActivity = [
    { 
      type: 'resolved', 
      title: 'Pothole on Main Street Intersection', 
      time: '2 hours ago', 
      status: 'completed',
      location: 'Downtown District',
      votes: 45
    },
    { 
      type: 'reported', 
      title: 'Broken streetlight at Central Park', 
      time: '4 hours ago', 
      status: 'in-progress',
      location: 'Central Park Area',
      votes: 23
    },
    { 
      type: 'updated', 
      title: 'Graffiti removal at subway station', 
      time: '6 hours ago', 
      status: 'pending',
      location: 'Transit Hub',
      votes: 67
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <div className="relative overflow-hidden">
      {/* Dynamic Mouse Follower */}
      <motion.div
        className="fixed w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none z-0"
        animate={{
          x: mousePosition.x - 192,
          y: mousePosition.y - 192,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 30 }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated Background Elements */}
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl"
        />

        <div className="container-responsive relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.div variants={itemVariants} className="mb-8">
              <span className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 text-blue-800 text-sm font-semibold mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                Transforming Cities, One Report at a Time
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-6xl md:text-8xl font-bold mb-8 leading-tight"
            >
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Smart Cities
              </span>
              <br />
              <span className="text-gray-900">Start Here</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Empower your community with AI-driven civic engagement. Report issues, track progress, and build stronger neighborhoods together.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            >
              {user ? (
                <Link
                  to="/dashboard"
                  className="btn-primary btn-xl group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-primary btn-xl group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center">
                      Start Making Impact
                      <Zap className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                    </span>
                  </Link>
                  <Link
                    to="/issues"
                    className="btn-secondary btn-xl group"
                  >
                    <span className="flex items-center">
                      Explore Issues
                      <Eye className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                    </span>
                  </Link>
                </>
              )}
            </motion.div>

            {/* Live Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="card-glass p-6 text-center group cursor-pointer"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm font-semibold text-gray-700 mb-1">{stat.label}</div>
                  <div className="text-xs text-gray-500">{stat.description}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          style={{ opacity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
              className="w-1 h-3 bg-gray-400 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="container-responsive">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="text-center mb-20"
          >
            <motion.h2
              variants={itemVariants}
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              <span className="gradient-text">Powerful Features</span>
              <br />
              for Modern Cities
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Discover how CivicTrack transforms civic engagement with cutting-edge technology and user-centered design.
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -10 }}
                className={`${feature.color} p-8 rounded-3xl border-2 hover:shadow-2xl transition-all duration-500 group cursor-pointer`}
              >
                <div className={`w-16 h-16 ${feature.iconColor} bg-white/80 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Live Activity Feed */}
      <section className="py-32 bg-gradient-to-br from-gray-50 to-blue-50/30 relative">
        <div className="container-responsive">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                <span className="gradient-text">Live Community</span>
                <br />
                Activity
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                See real-time updates from citizens and government responses across your community.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
              <div className="card-glass p-8">
                <div className="space-y-6">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-4 p-6 rounded-2xl bg-white/80 hover:bg-white hover:shadow-lg transition-all duration-300 group cursor-pointer"
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        activity.status === 'completed' ? 'bg-green-100 text-green-600' :
                        activity.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {activity.status === 'completed' ? <CheckCircle className="w-6 h-6" /> :
                         activity.status === 'in-progress' ? <Clock className="w-6 h-6" /> :
                         <MessageSquare className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {activity.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{activity.location}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-400">{activity.time}</span>
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4 text-red-400" />
                            <span className="text-xs text-gray-500">{activity.votes}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 relative">
        <div className="container-responsive">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                <span className="gradient-text">Community</span>
                <br />
                Success Stories
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Hear from real citizens who are making a difference in their communities with CivicTrack.
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="card p-8 hover:shadow-2xl transition-all duration-500 group"
                >
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <blockquote className="text-gray-700 mb-6 leading-relaxed italic">
                    "{testimonial.text}"
                  </blockquote>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4 group-hover:scale-110 transition-transform duration-300">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute -top-40 -left-40 w-80 h-80 bg-white/10 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-40 -right-40 w-96 h-96 bg-white/10 rounded-full"
          />
        </div>

        <div className="container-responsive relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center text-white"
          >
            <motion.h2
              variants={itemVariants}
              className="text-5xl md:text-7xl font-bold mb-8"
            >
              Ready to Transform
              <br />
              Your Community?
            </motion.h2>
            
            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90"
            >
              Join thousands of citizens who are already making their cities better. Start your civic journey today.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              {!user && (
                <Link
                  to="/register"
                  className="btn-xl bg-white text-blue-600 hover:bg-gray-100 hover:scale-105 font-bold shadow-2xl"
                >
                  <span className="flex items-center">
                    Get Started Free
                    <Award className="ml-2 w-6 h-6" />
                  </span>
                </Link>
              )}
              
              <Link
                to="/issues"
                className="btn-xl border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold"
              >
                <span className="flex items-center">
                  Explore Platform
                  <Target className="ml-2 w-6 h-6" />
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
