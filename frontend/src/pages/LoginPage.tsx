import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from 'react-query';
import { toast } from 'react-hot-toast';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  Mail, 
  Lock, 
  Shield, 
  Sparkles, 
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Globe
} from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { LoginRequest } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { scrollY } = useScroll();

  // Parallax transforms
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const loginMutation = useMutation(
    (data: LoginRequest) => authService.login(data),
    {
      onSuccess: (response) => {
        login(response.data.token, response.data.user);
        toast.success('Welcome back! 🎉');
        
        // Role-based redirect logic
        const user = response.data.user;
        const from = location.state?.from?.pathname;
        
        if (from && from !== '/') {
          navigate(from, { replace: true });
        } else {
          if (user.role === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Login failed');
      }
    }
  );

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const features = [
    {
      icon: Shield,
      title: 'Secure Access',
      description: 'Bank-level security protects your data'
    },
    {
      icon: Users,
      title: 'Community Impact',
      description: 'Join thousands making a difference'
    },
    {
      icon: Globe,
      title: 'Real-time Updates',
      description: 'Track progress as it happens'
    }
  ];

  const stats = [
    { value: '50K+', label: 'Active Users', color: 'from-blue-500 to-cyan-500' },
    { value: '12K+', label: 'Issues Resolved', color: 'from-green-500 to-emerald-500' },
    { value: '98%', label: 'Success Rate', color: 'from-purple-500 to-pink-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Dynamic Mouse Follower */}
      <motion.div
        className="fixed w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none z-0"
        animate={{
          x: mousePosition.x - 192,
          y: mousePosition.y - 192,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 30 }}
      />

      {/* Animated Background Elements */}
      <motion.div 
        style={{ y: y1 }}
        className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
      />
      <motion.div 
        style={{ y: y2 }}
        className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl"
      />

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-black/20"></div>
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

          <div className="relative z-10 text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4 mr-2" />
                Welcome to CivicTrack
              </span>

              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Transform Your
                <br />
                <span className="text-blue-200">Community</span>
              </h1>

              <p className="text-xl text-blue-100 mb-12 leading-relaxed">
                Join the movement of engaged citizens making real change. Report issues, track progress, and build stronger neighborhoods together.
              </p>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="space-y-6 mb-12"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center space-x-4 group"
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                    <p className="text-blue-200 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="grid grid-cols-3 gap-6"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-blue-200 text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-md"
          >
            {/* Logo for mobile */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CivicTrack
              </h1>
              <p className="text-gray-600 mt-2">Sign in to your account</p>
            </div>

            <div className="card-glass p-8 lg:p-10">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <Shield className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
                <p className="text-gray-600">Sign in to continue your civic journey</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Field */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      {...register('email')}
                      type="email"
                      className={`w-full pl-12 pr-4 py-4 bg-white/80 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                        errors.email ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-500 text-sm mt-1"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </motion.div>

                {/* Password Field */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      className={`w-full pl-12 pr-12 py-4 bg-white/80 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                        errors.password ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-500 text-sm mt-1"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loginMutation.isLoading}
                  className="w-full btn-primary btn-lg relative overflow-hidden group"
                >
                  {loginMutation.isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      Sign In
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </motion.button>

                {/* Divider */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="relative my-6"
                >
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">New to CivicTrack?</span>
                  </div>
                </motion.div>

                {/* Register Link */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-center"
                >
                  <Link
                    to="/register"
                    className="inline-flex items-center text-blue-600 hover:text-purple-600 font-semibold transition-colors group"
                  >
                    Create your account
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </form>
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-8 text-center"
            >
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  Secure
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  Trusted
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-blue-500 mr-1" />
                  50K+ Users
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
