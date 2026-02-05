import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Mail, Lock, AlertCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

const LoginPage = ({ onNavigateToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { signIn } = useAuth();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const { data, error } = await signIn(email, password);

    if (error) {
      if (error.code === 'email_not_confirmed' || error.message.includes('Email not confirmed')) {
        toast({
          title: 'Email Confirmation Required',
          description: 'Please check your email inbox and confirm your address before logging in.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Login Failed',
          description: error.message || 'Invalid credentials. Please try again.',
          variant: 'destructive',
        });
      }
      setLoading(false);
    } else {
      toast({
        title: 'Welcome Back!',
        description: 'Successfully logged in.',
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - SafeZone Community</title>
        <meta name="description" content="Login to SafeZone - Your community safety and disaster management platform" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="lg:w-1/2 relative bg-gradient-to-br from-red-600 via-orange-600 to-purple-700 flex items-center justify-center p-8"
        >
          <div className="absolute inset-0 bg-black/30" />
          <img 
            src="https://images.unsplash.com/photo-1610774149656-f4d74dafa99b" 
            alt="Emergency response team"
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
          />
          <div className="relative z-10 text-center text-white max-w-md">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              <Shield className="w-24 h-24 mx-auto mb-6" />
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-5xl font-bold mb-4"
            >
              SafeZone
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl mb-8"
            >
              Community Safety & Disaster Management Platform
            </motion.p>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-lg opacity-90"
            >
              Stay informed. Stay safe. Stay connected.
            </motion.p>
          </div>
        </motion.div>

        {/* Login Form Section */}
        <div className="lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-gray-300 mb-8">Sign in to access your safety dashboard</p>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-300">
                  Don't have an account?{' '}
                  <button
                    onClick={onNavigateToSignup}
                    className="text-orange-400 hover:text-orange-300 font-semibold transition-colors"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;