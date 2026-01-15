import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Mail, Lock, UserCheck, User, KeyRound } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/config';

// Fixed email mappings for roles
const ROLE_EMAILS = {
  'EB': ['happyrajpurohit2006@gmail.com', 'psareen_be24@thapar.edu', 'bhavyaagarwal00000@gmail.com', 'lgupta1_be23@thapar.edu', 'ecdev4ishan@gmail.com', 'abhinivesh2005@gmail.com', 'raghav98233@gmail.com', 'isharma1_be23@thapar.edu', 'hkumra_be23@thapar.edu'],
  'EC': ['happyrajpurohit2006@gmail.com', 'chopragarv0@gmail.com'],
  'Core': ['happyrajpurohit2006@gmail.com',
    'extraid11981@gmail.com',
    'psareen_be24@thapar.edu',
    'achopra_be24@thapar.edu',
    'marushikagupta@gmail.com',
    'agupta16_be24@thapar.edu',
    'parakhgeetika@gmail.com',
    'mgupta1_be24@thapar.edu',
    'arathore_be24@thapar.edu',
    'aarora4_be24@thapar.edu',
    'ugoyal_be24@thapar.edu',
    'asharma23_be24@thapar.edu',
    'arshiabajaj51@gmail.com',
    'saanvikhurana06@gmail.com',
    'mahuja_be24@thapar.edu',
    'sgera_be24@thapar.edu',
    'darya_be24@thapar.edu',
    'kbansal3_be24@thapar.edu',
    'prishuacharya@gmail.com',
    'mgoela_be24@thapar.edu',
    'ngupta4_be24@thapar.edu',
    'arjites.bariyar@gmail.com',
    'akumar5_be24@thapar.edu',
    'saanvikhurana06@gmail.com'
  ],
  'Member': ['happyrajpurohit2006@gmail.com',
    'imittal_be24@thapar.edu',
    'ggoyal1_be24@thapar.edu',
    'riddhidhawan2@gmail.com',
    'singhmanavjit100@gmail.com',
    'rsharma2_be24@thapar.edu',
    'harshittaneja71@gmail.com',
    'nverma1_be24@thapar.edu',
    'ajwandha_be24@thapar.edu',
    'agandhi_be24@thapar.edu',
    'kgautam_be24@thapar.edu',
    'ajuneja_be24@thapar.edu',
    'smishra_be24@thapar.edu',
    'upant_be24@thapar.edu',
    'PARVDHRUV@GMAIL.COM',
    'parvdhruv@gmail.com',
    'abassi_be24@thapar.edu',
    'skunwarpreet19@gmail.com',
    'pramittiwari9@gmail.com',
    'sakshamt2006@gmail.com',
    'bbhavika_be25@thapar.edu',
    'kgupta2_be25@thapar.edu',
    'varunjoshi2014@gmail.com',
    'saarushi206@gmail.com',
    'syadav2_be25@thapar.edu',
    'manaktalaverain@gmail.com',
    '07bhavyagoyal@gmail.com',
    'harshilmadaan170607@gmail.com',
    'achaudhary2_be25@thapar.edu',
    'tgupta1087@gmail.com',
    'htrikha_be25@thapar.edu',
    'blam.cathunter@gmail.com',
    'sgupta16_be25@thapar.edu',
    'yugamdeep@gmail.com',
    'kgupta9_be25@thapar.edu',
    'gkohli_be25@thapar.edu',
    'unnat131206@gmail.com',
    'ihit1600@gmail.com',
    'siyajain116@gmail.com',
    'bhuwangera030@gmail.com',
    'supurna1505@gmail.com',
    'mbhatia1_be25@thapar.edu',
    'rishitajain900@gmail.com',
    'lsharma_be25@thapar.edu',
    'ggupta2_be25@thapar.edu',
    'itsridhipuri@gmail.com',
    'harmanjot08singh@gmail.com',
    'rjain4_be25@thapar.edu',
    'gargrumani@gmail.com',
    'siddhantjindal72@gmail.com',
    'arorarushaan6@gmail.com',
    'priyalatka@gmail.com',
    'sakshammahajan68@gmail.com',
    'guptaarmaan1505@gmail.com',
    'jbhinder_be25@thapar.edu',
    'msethi1_be25@thapar.edu',
    'stutisharma159@gmail.com',
    'abhinavak819@gmail.com',
    'gulatisaksham07@gmail.com',
    'lsachdeva_be25@thapar.edu',
    'hkasturia_be25@thapar.edu',
    'shubhgulati786@gmail.com',
    'kavisha.14pia@gmail.com',
    'asahu1_be25@thapar.edu',
    'hkaur11_be25@thapar.edu',
    'avani.dobhal0411@gmail.com',
    'wadhwakavyansh2008@gmail.com',
    'krishgarg2202@gmail.com',
    'gaurigoyal1793@gmail.com',
    'akumar2_be25@thapar.edu',
    'mkumra_be25@thapar.edu',
    'sahuja1_be25@thapar.edu',
    'samridhi2982@gmail.com',
    'varchasvi.987@gmail.com',
    'myadav_be25@thapar.edu',
    'shreyagupta2990@gmail.com',
    'msingla3_be25@thapar.edu',
    'vaishnavipixy@gmail.com',
    'sagarwal1_be25@thapar.edu',
    'ggoyal_be25@thapar.edu'
  ]
};

const Login: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'EB' | 'EC' | 'Core' | 'Member'>('Member');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    setResetLoading(true);
    setResetMessage('');
    setError('');

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage('Password reset email sent! Check your inbox.');
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail('');
        setResetMessage('');
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to send reset email');
    }
    setResetLoading(false);
  };

  const getAuthorizedEmails = (selectedRole: string) => {
    return ROLE_EMAILS[selectedRole as keyof typeof ROLE_EMAILS];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8 transition-all duration-500">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 dark:opacity-20 opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 dark:opacity-20 opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 dark:opacity-20 opacity-30 animate-pulse animation-delay-4000"></div>
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
        <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-4 sm:p-6 lg:p-8 animate-fade-in-up">
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
            <p className="text-gray-400 dark:text-gray-400 text-gray-600 text-sm">
              Welcome back! Please sign in to continue
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 sm:px-4 sm:py-3 rounded-lg mb-4 sm:mb-6 backdrop-blur-sm text-sm">
              {error}
            </div>
          )}

          {resetMessage && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-2 sm:px-4 sm:py-3 rounded-lg mb-4 sm:mb-6 backdrop-blur-sm text-sm">
              {resetMessage}
            </div>
          )}

          {!showForgotPassword ? (
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

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4 sm:space-y-6">
              <div className="text-center mb-4">
                <KeyRound className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-white mb-2">Reset Password</h3>
                <p className="text-gray-400 text-sm">Enter your email to receive a password reset link</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 z-10" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-10 w-full px-3 py-2 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200 text-sm sm:text-base"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 sm:py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] font-medium shadow-lg text-sm sm:text-base"
              >
                {resetLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  'Send Reset Email'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail('');
                    setError('');
                    setResetMessage('');
                  }}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
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