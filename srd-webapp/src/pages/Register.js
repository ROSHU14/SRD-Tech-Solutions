import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [company, setCompany] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Check if Terms & Conditions are agreed
    if (!agreeTerms) {
      toast.error('Please agree to the Terms & Conditions');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register({ name, email, password, company });
    if (result.success) {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Terms & Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowTerms(false)}>
          <div className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 border border-white/20" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Terms & Conditions</h3>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">1. Acceptance of Terms</h4>
                <p className="text-indigo-300 text-sm">By accessing and using SRD Tech Solutions platform, you agree to be bound by these Terms & Conditions.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">2. User Accounts</h4>
                <p className="text-indigo-300 text-sm">You are responsible for maintaining the confidentiality of your account credentials. You agree to accept responsibility for all activities that occur under your account.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">3. Acceptable Use</h4>
                <p className="text-indigo-300 text-sm">You agree not to use the platform for any unlawful purpose or any purpose prohibited by these terms. You may not disrupt or interfere with the security of the platform.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">4. Privacy Policy</h4>
                <p className="text-indigo-300 text-sm">Your privacy is important to us. We collect and process personal data in accordance with our Privacy Policy.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">5. Ticket Submissions</h4>
                <p className="text-indigo-300 text-sm">When submitting tickets, you agree to provide accurate information. SRD Tech Solutions reserves the right to prioritize and respond to tickets based on urgency and subscription level.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">6. Service Modifications</h4>
                <p className="text-indigo-300 text-sm">We reserve the right to modify or discontinue the service at any time with reasonable notice.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">7. Limitation of Liability</h4>
                <p className="text-indigo-300 text-sm">SRD Tech Solutions shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">8. Governing Law</h4>
                <p className="text-indigo-300 text-sm">These terms shall be governed by and construed in accordance with the laws of [Your Country/State].</p>
              </div>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowTerms(false)}
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left Side - Premium Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-between w-full px-12 py-12">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-xl">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
              <div>
                <h2 className="text-white text-2xl font-bold tracking-tight">SRD Tech Solutions</h2>
                <p className="text-indigo-300 text-sm">Enterprise Support Platform</p>
              </div>
            </div>
          </div>

          <div className="my-auto py-12">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="w-16 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></div>
                <h1 className="text-5xl font-bold text-white leading-tight">
                  Join the<br />
                  <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                    SRD Family
                  </span>
                </h1>
                <p className="text-indigo-200 text-base max-w-md">
                  Create your account and experience the future of support management.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <p className="text-2xl font-bold text-white">24/7</p>
                  <p className="text-indigo-300 text-xs">Support</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <p className="text-2xl font-bold text-white">98%</p>
                  <p className="text-indigo-300 text-xs">Satisfaction</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <p className="text-2xl font-bold text-white">500+</p>
                  <p className="text-indigo-300 text-xs">Resolved</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <p className="text-2xl font-bold text-white">Instant</p>
                  <p className="text-indigo-300 text-xs">Response</p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-5">
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  <span className="text-lg">🚀</span> What you get
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-indigo-200 text-xs">Unlimited Support Tickets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-indigo-200 text-xs">Real-Time Updates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <span className="text-indigo-200 text-xs">Priority Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-indigo-300 text-xs">© 2024 SRD Tech Solutions. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Premium Glass Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-gray-900 to-slate-800">
        <div className="w-full max-w-md px-6 py-8">
          <div className="lg:hidden text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-lg mb-3">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <h2 className="text-xl font-bold text-white">SRD Tech Solutions</h2>
            <p className="text-indigo-300 text-sm">Create Account</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Create Account</h3>
              <p className="text-indigo-300 text-sm mt-1">Join SRD Tech Solutions</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-white placeholder-white/50"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-white placeholder-white/50"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-2">Company (Optional)</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-white placeholder-white/50"
                  placeholder="Your Company"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-white placeholder-white/50"
                  placeholder="••••••••"
                  required
                />
                <p className="text-indigo-400 text-xs mt-1">Minimum 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-white placeholder-white/50"
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* ✅ Terms & Conditions Checkbox - REQUIRED */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded bg-white/10 border-white/20 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="text-sm">
                  <span className="text-indigo-300">I agree to the </span>
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-white font-medium hover:text-indigo-200 transition"
                  >
                    Terms & Conditions
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-indigo-300">
                Already have an account?{' '}
                <Link to="/login" className="text-white font-medium hover:text-indigo-200 transition">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}