import React, { useState, useEffect } from 'react';
import { UserTier } from '../types';
import { ShieldAlert, Calculator, CheckCircle2, Lock, Youtube, User, Key, ExternalLink, AlertTriangle, Link as LinkIcon, UserPlus, LogIn } from 'lucide-react';

interface AuthFlowProps {
  onAuthenticated: (tier: UserTier) => void;
}

type Step = 'login' | 'antibot' | 'tier_selection' | 'premium_verify' | 'free_verify';

const PREMIUM_KEYS = ['aiiscoked', 'baddreamasriel', 'kingasgore'];
const USERS_DB_KEY = 'fredbear_users_db';

const AuthFlow: React.FC<AuthFlowProps> = ({ onAuthenticated }) => {
  const [step, setStep] = useState<Step>('login');
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Auth State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Math State
  const [mathProblem, setMathProblem] = useState({ q: '', a: 0 });
  const [mathInput, setMathInput] = useState('');
  
  // Verify State
  const [keyInput, setKeyInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');

  // Free Tier Logic States
  const [hasClickedSubscribe, setHasClickedSubscribe] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  useEffect(() => {
    generateMathProblem();
  }, []);

  useEffect(() => {
    // Clear inputs when switching steps
    setError('');
    setKeyInput('');
  }, [step]);

  const generateMathProblem = () => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    const op = Math.random() > 0.5 ? '+' : '*';
    setMathProblem({
      q: `${n1} ${op} ${n2}`,
      a: op === '+' ? n1 + n2 : n1 * n2
    });
  };

  const handleAuthAction = () => {
    if (!username || !password) {
        setError("Please enter username and password.");
        return;
    }

    // Local Database Simulation
    const usersStr = localStorage.getItem(USERS_DB_KEY);
    const users = usersStr ? JSON.parse(usersStr) : {};

    if (isSignUp) {
        // Sign Up Logic
        if (users[username]) {
            setError("Username already exists. Please login.");
            return;
        }
        // Create Account
        users[username] = password;
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
        setError('');
        // Proceed to verification
        setStep('antibot');
    } else {
        // Login Logic
        if (!users[username]) {
             setError("User not found. Please Sign Up.");
             return;
        }
        if (users[username] !== password) {
            setError("Incorrect password.");
            return;
        }
        setError('');
        setStep('antibot');
    }
  };

  const handleMathSubmit = () => {
    if (parseInt(mathInput) === mathProblem.a) {
      setStep('tier_selection');
      setError('');
    } else {
      setError('Incorrect. Anti-Bot Protocol Failed.');
      generateMathProblem();
      setMathInput('');
    }
  };

  // FREE TIER LOGIC
  const handleSubscribeClick = () => {
      window.open("https://youtube.com/@Fredbear555", "_blank");
      // Simulate "checking" subscription
      setTimeout(() => {
        setHasClickedSubscribe(true);
      }, 1500);
  };

  const handleGenerateKey = () => {
      setIsGeneratingKey(true);
      setTimeout(() => {
          setKeyInput('FREDBEAR-FREE-V2.1-ACCESS');
          setIsGeneratingKey(false);
      }, 2000);
  };

  const handleFreeKeyVerify = () => {
    setIsChecking(true);
    setError('');
    
    setTimeout(() => {
        // Valid key patterns
        if (keyInput.includes('FREDBEAR') || keyInput.length > 5) {
             setIsChecking(false);
             onAuthenticated('free');
        } else {
            setIsChecking(false);
            setError('Invalid Key. Please generate a new key.');
        }
    }, 1500);
  };

  // PREMIUM TIER LOGIC
  const handlePremiumVerify = () => {
    const normalizedInput = keyInput.trim().toLowerCase();

    if (!normalizedInput) {
        setError("Please enter the Premium Key.");
        return;
    }

    setIsChecking(true);
    setError('');

    setTimeout(() => {
        if (PREMIUM_KEYS.includes(normalizedInput)) {
             setIsChecking(false);
             onAuthenticated('premium');
        } else {
            setIsChecking(false);
            setError("Invalid Key. Please complete the link to get the correct key.");
        }
    }, 2000);
  };

  const openUnlockLink = () => {
      window.open("https://sub4unlock.com/SL/1723051", "_blank");
  };

  // --- RENDERERS ---

  if (step === 'login') {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-gray-200 p-8 rounded-2xl shadow-xl">
           <div className="text-center mb-8">
             <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="text-orange-500" size={32} />
             </div>
             <h1 className="text-3xl font-bold text-gray-800 mb-2">Fredbear555Ai</h1>
             <p className="text-gray-500 text-sm">Secure Access Gateway</p>
           </div>
           
           <div className="flex border-b border-gray-200 mb-6">
               <button 
                 className={`flex-1 pb-2 text-sm font-bold ${!isSignUp ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-400'}`}
                 onClick={() => { setIsSignUp(false); setError(''); }}
               >
                 Log In
               </button>
               <button 
                 className={`flex-1 pb-2 text-sm font-bold ${isSignUp ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-400'}`}
                 onClick={() => { setIsSignUp(true); setError(''); }}
               >
                 Sign Up
               </button>
           </div>
           
           <div className="space-y-4 mb-6">
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Username</label>
                <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-800"
                        placeholder="Enter username"
                    />
                </div>
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                <div className="relative">
                    <Key className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-800"
                        placeholder="••••••••"
                    />
                </div>
             </div>
             {error && <p className="text-red-500 text-xs">{error}</p>}
           </div>

           <button onClick={handleAuthAction} className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98] flex items-center justify-center gap-2">
                {isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}
                {isSignUp ? 'Create Account' : 'Log In System'}
           </button>
           
           <div className="mt-6 flex justify-center gap-2">
                <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] rounded border border-green-200 flex items-center gap-1 font-bold"><ShieldAlert size={10}/> Anti-Hack</span>
                <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] rounded border border-blue-200 flex items-center gap-1 font-bold"><Lock size={10}/> Encrypted</span>
           </div>
        </div>
      </div>
    );
  }

  if (step === 'antibot') {
    return (
        <div className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white border border-gray-200 p-8 rounded-2xl shadow-xl text-center">
           <Calculator className="w-12 h-12 text-orange-500 mx-auto mb-4" />
           <h2 className="text-xl font-bold text-gray-800 mb-2">Anti-Bot Verification</h2>
           <p className="text-gray-500 text-sm mb-6">Solve the equation to prove you are human.</p>
           
           <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 mb-4">
             <span className="text-2xl font-mono text-orange-600 font-bold">{mathProblem.q} = ?</span>
           </div>

           <input 
             type="number" 
             value={mathInput}
             onChange={(e) => setMathInput(e.target.value)}
             className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 text-center mb-4 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
             placeholder="Enter result"
           />
           
           {error && <p className="text-red-500 text-xs mb-4 font-medium">{error}</p>}

           <button onClick={handleMathSubmit} className="w-full py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-semibold">
             Verify
           </button>
        </div>
      </div>
    );
  }

  if (step === 'tier_selection') {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-4xl">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Select Your Access Level</h2>
            <p className="text-center text-gray-500 mb-8">Choose the power you need.</p>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Free Tier */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col hover:border-orange-300 hover:shadow-lg transition-all">
                    <h3 className="text-xl font-bold text-gray-800">Free Access</h3>
                    <div className="my-4 space-y-2">
                        <div className="text-3xl font-bold text-gray-900">Free</div>
                        <div className="text-xs text-gray-500">Requires Subscription Key</div>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                        <li className="text-gray-600 text-sm flex gap-2"><CheckCircle2 size={16} className="text-green-500"/> Model AI v2.1</li>
                        <li className="text-gray-600 text-sm flex gap-2"><CheckCircle2 size={16} className="text-green-500"/> Normal Processing</li>
                        <li className="text-gray-600 text-sm flex gap-2"><CheckCircle2 size={16} className="text-green-500"/> Limit Time 30 Days</li>
                        <li className="text-gray-400 text-sm flex gap-2"><CheckCircle2 size={16} className="text-gray-300"/> Research 0.8x Slow</li>
                    </ul>
                    <button onClick={() => setStep('free_verify')} className="w-full py-3 bg-gray-100 text-gray-700 border border-gray-300 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                        Enter Key
                    </button>
                </div>

                {/* Premium Tier */}
                <div className="bg-gradient-to-br from-gray-900 to-black border border-orange-500/50 rounded-2xl p-6 flex flex-col relative overflow-hidden shadow-2xl text-white">
                    <div className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-lg">BEST VALUE</div>
                    <h3 className="text-xl font-bold text-white">Premium</h3>
                    <div className="my-4 space-y-2">
                        <div className="text-3xl font-bold text-orange-400">Free <span className="text-sm text-gray-400 font-normal">/ Via Task</span></div>
                        <div className="text-xs text-gray-400">Key Required • Complete Link</div>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                        <li className="text-gray-200 text-sm flex gap-2"><CheckCircle2 size={16} className="text-orange-500"/> Hybrid v2.7 (GPT+Gemini+Core)</li>
                        <li className="text-gray-200 text-sm flex gap-2"><CheckCircle2 size={16} className="text-orange-500"/> Fast Think & More Think</li>
                        <li className="text-gray-200 text-sm flex gap-2"><CheckCircle2 size={16} className="text-orange-500"/> Deep Research & Analysis</li>
                        <li className="text-gray-200 text-sm flex gap-2"><CheckCircle2 size={16} className="text-orange-500"/> Priority Anti-Bot</li>
                    </ul>
                    <button onClick={() => setStep('premium_verify')} className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold hover:from-orange-500 hover:to-red-500 transition-colors shadow-lg shadow-orange-500/30">
                        Get Premium
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (step === 'free_verify') {
      return (
        <div className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white border border-gray-200 p-8 rounded-2xl shadow-xl">
                <button onClick={() => setStep('tier_selection')} className="text-gray-400 hover:text-gray-800 mb-4 text-sm font-medium">&larr; Back</button>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Free License Key</h2>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 space-y-5">
                    
                    {/* Step 1: Subscribe */}
                    <div>
                        <p className="text-sm text-gray-600 mb-2 font-medium">Step 1: Subscribe to unlock</p>
                        <button 
                            onClick={handleSubscribeClick}
                            className={`flex items-center justify-center gap-2 text-white font-bold bg-red-600 hover:bg-red-500 p-3 rounded-xl w-full transition-colors shadow-md ${hasClickedSubscribe ? 'opacity-50' : ''}`}
                        >
                            <Youtube size={20} />
                            {hasClickedSubscribe ? 'Subscribed' : 'Subscribe @Fredbear555'}
                        </button>
                    </div>
                    
                    {/* Step 2: Generate */}
                    <div className={`transition-all duration-500 ${hasClickedSubscribe ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-2 pointer-events-none grayscale'}`}>
                         <p className="text-sm text-gray-600 mb-2 font-medium">Step 2: Generate Access Key</p>
                         <button 
                            onClick={handleGenerateKey}
                            disabled={isGeneratingKey || !!keyInput}
                            className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold p-3 rounded-xl w-full hover:bg-gray-50 transition-all hover:border-orange-300"
                         >
                            {isGeneratingKey ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-gray-400 border-t-orange-500 rounded-full animate-spin"></span>
                                    Generating...
                                </span>
                            ) : (
                                <>
                                  {keyInput ? (
                                    <span className="text-green-600 flex items-center gap-2"><CheckCircle2 size={18}/> Key Generated</span>
                                  ) : (
                                    <span className="flex items-center gap-2"><Key size={18} /> Generate Key</span>
                                  )}
                                </>
                            )}
                         </button>
                    </div>

                    {/* Step 3: Input */}
                    <div className={`transition-all duration-500 ${keyInput ? 'opacity-100' : 'opacity-50'}`}>
                        <p className="text-sm text-gray-600 mb-2 font-medium">Step 3: Enter Key</p>
                        <input 
                            type="text" 
                            value={keyInput}
                            onChange={(e) => setKeyInput(e.target.value)}
                            placeholder="Waiting for generated key..."
                            readOnly={true}
                            className="w-full bg-gray-200 border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-orange-500 outline-none font-mono text-center tracking-widest"
                        />
                    </div>
                </div>

                {error && <p className="text-red-500 text-xs mb-4 font-bold">{error}</p>}

                <button 
                    onClick={handleFreeKeyVerify} 
                    disabled={isChecking || !keyInput}
                    className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold disabled:opacity-50 transition-all shadow-lg"
                >
                    {isChecking ? 'Validating...' : 'Activate Free Tier'}
                </button>
            </div>
        </div>
      );
  }

  if (step === 'premium_verify') {
      return (
        <div className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white border border-gray-200 p-8 rounded-2xl shadow-xl">
                <button onClick={() => setStep('tier_selection')} className="text-gray-400 hover:text-gray-800 mb-4 text-sm font-medium">&larr; Back</button>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Unlock Premium</h2>
                <p className="text-gray-500 text-sm mb-6">Complete the task below to get the Access Key.</p>

                {/* Task UI */}
                <div className="bg-blue-50 p-6 rounded-xl mb-6 flex flex-col items-center justify-center border border-blue-100 shadow-sm">
                     <div className="text-blue-600 mb-3">
                         <LinkIcon size={48} />
                     </div>
                     <h3 className="text-lg font-bold text-blue-900 mb-2">Complete Task</h3>
                     <p className="text-center text-xs text-blue-700 mb-4">
                        Visit the link below and complete the steps to reveal your Premium Key.
                     </p>
                     <button onClick={openUnlockLink} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md">
                        Open Unlock Link <ExternalLink size={16}/>
                     </button>
                </div>
                
                <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Enter Premium Key</label>
                    <input 
                        type="text" 
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        placeholder="Paste The Key Here"
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-orange-500 outline-none"
                    />
                    {error && <p className="text-red-500 text-xs mt-2 font-bold flex items-center gap-1"><AlertTriangle size={12}/> {error}</p>}
                </div>

                <button 
                    onClick={handlePremiumVerify}
                    disabled={isChecking || !keyInput}
                    className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-orange-500/20"
                >
                    {isChecking ? 'Verifying Key...' : 'Unlock Premium'}
                </button>
            </div>
        </div>
      );
  }

  return null;
};

export default AuthFlow;