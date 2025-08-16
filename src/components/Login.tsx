import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Mail, Lock, UserCheck, User } from 'lucide-react';

// Fixed email mappings for roles
const ROLE_EMAILS = {
  'EB': ['eb@society.com', 'president@society.com', 'vicepresident@society.com'],
  'EC': ['ec1@society.com', 'ec2@society.com', 'secretary@society.com'],
  'Core': ['core1@society.com', 'core2@society.com', 'treasurer@society.com'],
  'Member': ['member1@society.com', 'member2@society.com', 'member3@society.com']
};

const Login: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'EB' | 'EC' | 'Core' | 'Member'>('Member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const validateEmailForRole = (email: string, role: string) => {
    const allowedEmails = ROLE_EMAILS[role as keyof typeof ROLE_EMAILS];
    return allowedEmails.includes(email.toLowerCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate email for selected role
    if (!validateEmailForRole(email, role)) {
      setError(`This email is not authorized for ${role} role. Please use an authorized email address.`);
      setLoading(false);
      return;
    }

    try {
      await login(email, password, role, name);
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    }
    
    setLoading(false);
  };

  const getAuthorizedEmails = (selectedRole: string) => {
    return ROLE_EMAILS[selectedRole as keyof typeof ROLE_EMAILS];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-10 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          ></div>
        ))}
      </div>

      <div className="max-w-md w-full relative z-10 mx-auto">
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-4 sm:p-6 lg:p-8">
          {/* Logo and Title Section */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                <Users className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-ping"></div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full"></div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Society Organiser
            </h1>
            <p className="text-gray-400 text-sm">
              Welcome back! Please sign in to continue
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 sm:px-4 sm:py-3 rounded-lg mb-4 sm:mb-6 backdrop-blur-sm text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 z-10" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 w-full px-3 py-2 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200 text-sm sm:text-base"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Role
              </label>
              <div className="relative">
                <UserCheck className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 z-10" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="pl-10 w-full px-3 py-2 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200 text-sm sm:text-base"
                >
                  <option value="Member">Member</option>
                  <option value="Core">Core</option>
                  <option value="EC">EC</option>
                  <option value="EB">EB</option>
                </select>
              </div>
              <div className="mt-2 p-2 bg-gray-700/30 rounded text-xs text-gray-400">
                <p className="font-medium mb-1">Authorized emails for {role}:</p>
                <ul className="space-y-1">
                  {getAuthorizedEmails(role).map((email, index) => (
                    <li key={index} className="text-blue-300">{email}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 z-10" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full px-3 py-2 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200 text-sm sm:text-base"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 z-10" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full px-3 py-2 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200 text-sm sm:text-base"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 sm:py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] font-medium shadow-lg text-sm sm:text-base"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(120deg); }
          66% { transform: translateY(10px) rotate(240deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Login;