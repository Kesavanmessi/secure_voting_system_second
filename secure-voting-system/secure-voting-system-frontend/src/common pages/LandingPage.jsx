import { Link } from 'react-router-dom';

function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-900 overflow-hidden relative selection:bg-cyan-500 selection:text-white">
            {/* Dynamic Background */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[128px] animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] animate-pulse delay-1000"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 min-h-screen flex flex-col justify-center items-center px-6">

                {/* Header */}
                <div className="text-center mb-16 space-y-6 max-w-3xl">
                    <div className="inline-block px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-md mb-4">
                        <span className="text-cyan-400 text-sm font-medium tracking-wider uppercase">Secure • Transparent • Immutable</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight">
                        Next Generation <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">Voting System</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
                        Experience the future of democracy with our blockchain-powered voting platform.
                        Secure, anonymous, and verifiable elections at your fingertips.
                    </p>
                </div>

                {/* Portal Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">

                    {/* Admin Portal Card */}
                    <Link to='/admin-login' className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
                        <div className="relative h-full bg-slate-800/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:border-cyan-500/50 transition-all duration-300 transform group-hover:-translate-y-2">
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Admin Portal</h3>
                            <p className="text-slate-400 mb-6 leading-relaxed">
                                Comprehensive tools for election management, candidate verification, and real-time monitoring.
                            </p>
                            <div className="flex items-center text-cyan-400 font-medium group-hover:gap-2 transition-all">
                                <span>Access Dashboard</span>
                                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </div>
                    </Link>

                    {/* Voter Portal Card */}
                    <Link to='/voter-login' className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
                        <div className="relative h-full bg-slate-800/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:border-purple-500/50 transition-all duration-300 transform group-hover:-translate-y-2">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Voter Portal</h3>
                            <p className="text-slate-400 mb-6 leading-relaxed">
                                Secure interface for casting votes. Your voice matters, make it count anonymously.
                            </p>
                            <div className="flex items-center text-purple-400 font-medium group-hover:gap-2 transition-all">
                                <span>Cast Your Vote</span>
                                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </div>
                    </Link>

                </div>

                {/* Footer */}
                <div className="mt-20 border-t border-white/5 pt-8 w-full max-w-4xl flex items-center justify-between text-slate-500 text-sm">
                    <p>&copy; 2024 Secure Voting System</p>
                    <div className="flex space-x-6">
                        <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
                        <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default LandingPage;
