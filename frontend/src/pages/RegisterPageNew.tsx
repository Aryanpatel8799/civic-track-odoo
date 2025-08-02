import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import { toast } from 'react-hot-toast';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Sparkles, 
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Shield,
  Heart,
  Zap,
  Award,
  Globe,
  Check
} from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterRequest } from '@/types';

const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[0-9]+$/, 'Phone number can only contain digits'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
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
    watch,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const registerMutation = useMutation(
    (data: RegisterRequest) => authService.register(data),
    {
      onSuccess: (response) => {
        login(response.data.token, response.data.user);
        toast.success('Welcome to CivicTrack! 🎉');
        navigate('/dashboard', { replace: true });
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Registration failed');
      }
    }
  );

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  const benefits = [
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security and never shared without permission.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Community Impact',
      description: 'Join 50,000+ citizens already making real change in their neighborhoods.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Zap,
      title: 'Instant Updates',
      description: 'Get real-time notifications when your issues are addressed by local government.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Award,
      title: 'Recognition',
      description: 'Earn civic points and badges for your community contributions.',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const steps = ['Account Info', 'Contact Details', 'Security', 'Complete'];
  
  const progressPercent = (currentStep / (steps.length - 1)) * 100;

  // Watch password for strength indicator
  const password = watch('password');
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { strength: 0, label: '', color: 'gray' };
    
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (/[a-z]/.test(pass)) strength += 25;
    if (/[A-Z]/.test(pass)) strength += 25;
    if (/[0-9]/.test(pass)) strength += 12.5;
    if (/[@$!%*?&]/.test(pass)) strength += 12.5;
    
    if (strength < 50) return { strength, label: 'Weak', color: 'red' };
    if (strength < 75) return { strength, label: 'Good', color: 'yellow' };
    return { strength, label: 'Strong', color: 'green' };
  };

  const passwordStrength = getPasswordStrength(password || '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Dynamic Mouse Follower */}
      <motion.div
        className="fixed w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl pointer-events-none z-0"
        animate={{
          x: mousePosition.x - 192,
          y: mousePosition.y - 192,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 30 }}
      />

      {/* Animated Background Elements */}
      <motion.div 
        style={{ y: y1 }}
        className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
      />
      <motion.div 
        style={{ y: y2 }}
        className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"
      />

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Benefits & Features */}
        <div className="hidden xl:flex xl:w-1/2 flex-col justify-center p-12 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-black/20"></div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full"
          />

          <div className="relative z-10 text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-8">
                <Heart className="w-4 h-4 mr-2" />
                Join the Movement
              </span>

              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Be the Change
                <br />
                <span className="text-purple-200">Your City Needs</span>
              </h1>

              <p className="text-xl text-purple-100 mb-12 leading-relaxed">
                Empower yourself to make a real difference. Report issues, collaborate with neighbors, and track the positive impact you're creating in your community.
              </p>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="space-y-8 mb-12"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-start space-x-4 group"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${benefit.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-purple-200 text-sm leading-relaxed">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="flex items-center space-x-8"
            >
              <div className="text-center">
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-purple-200 text-sm">Active Citizens</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">12K+</div>
                <div className="text-purple-200 text-sm">Issues Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">98%</div>
                <div className="text-purple-200 text-sm">Success Rate</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-full xl:w-1/2 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-lg"
          >
            {/* Logo for mobile */}
            <div className="xl:hidden text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                CivicTrack
              </h1>
              <p className="text-gray-600 mt-2">Create your account</p>
            </div>

            <div className="card-glass p-8 lg:p-10">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <Star className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Join CivicTrack</h2>
                <p className="text-gray-600">Start making a difference in your community today</p>
              </div>

              {/* Progress Indicator */}
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "100%" }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progressPercent)}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </motion.div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Username Field */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    </div>
                    <input
                      {...register('username')}
                      type="text"
                      className={`w-full pl-12 pr-4 py-4 bg-white/80 border rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${
                        errors.username ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="Choose a username"
                    />
                  </div>
                  {errors.username && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-500 text-sm mt-1"
                    >
                      {errors.username.message}
                    </motion.p>
                  )}
                </motion.div>

                {/* Email Field */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    </div>
                    <input
                      {...register('email')}
                      type="email"
                      className={`w-full pl-12 pr-4 py-4 bg-white/80 border rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${
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

                {/* Phone Field */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    </div>
                    <input
                      {...register('phone')}
                      type="tel"
                      className={`w-full pl-12 pr-4 py-4 bg-white/80 border rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${
                        errors.phone ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  {errors.phone && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-500 text-sm mt-1"
                    >
                      {errors.phone.message}
                    </motion.p>
                  )}
                </motion.div>

                {/* Password Field */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    </div>
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      className={`w-full pl-12 pr-12 py-4 bg-white/80 border rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${
                        errors.password ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="Create a secure password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-purple-500 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">Password Strength</span>
                        <span className={`font-medium ${
                          passwordStrength.color === 'red' ? 'text-red-500' :
                          passwordStrength.color === 'yellow' ? 'text-yellow-500' :
                          'text-green-500'
                        }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-all duration-300 ${
                            passwordStrength.color === 'red' ? 'bg-red-500' :
                            passwordStrength.color === 'yellow' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${passwordStrength.strength}%` }}
                        />
                      </div>
                    </motion.div>
                  )}
                  
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

                {/* Confirm Password Field */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    </div>
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`w-full pl-12 pr-12 py-4 bg-white/80 border rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-purple-500 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-500 text-sm mt-1"
                    >
                      {errors.confirmPassword.message}
                    </motion.p>
                  )}
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={registerMutation.isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 focus:ring-4 focus:ring-purple-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  {registerMutation.isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Creating Account...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      Create Account
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </motion.button>

                {/* Divider */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="relative my-6"
                >
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Already have an account?</span>
                  </div>
                </motion.div>

                {/* Login Link */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="text-center"
                >
                  <Link
                    to="/login"
                    className="inline-flex items-center text-purple-600 hover:text-pink-600 font-semibold transition-colors group"
                  >
                    Sign in to your account
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </form>
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-8 text-center"
            >
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 text-green-500 mr-1" />
                  Secure
                </div>
                <div className="flex items-center">
                  <Globe className="w-4 h-4 text-blue-500 mr-1" />
                  Global
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-purple-500 mr-1" />
                  Community
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
