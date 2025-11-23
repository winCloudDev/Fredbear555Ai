
import React, { useState, useEffect } from 'react';
import { UserTier } from '../types';
import { ShieldAlert, Calculator, Lock, Key, UserPlus, ShieldCheck, Eye, EyeOff, RefreshCw } from 'lucide-react';

interface AuthFlowProps {
  onAuthenticated: (tier: UserTier, username: string) => void;
}

const PREMIUM_KEYS = ['aiiscoked', 'baddreamasriel', 'kingasgore'];
const USERS_DB_KEY = 'fredbear_users_v2_db'; // Updated DB Key for object storage
const STORAGE_KEY_USER_TOKEN = 'fredbear_active_user';

export default function AuthFlow({ onAuthenticated }: AuthFlowProps) {
  const [step, setStep] = useState<'login' | 'antibot' | 'tier_selection' | 'premium_verify' | 'free_verify'>('login');
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mathProblem, setMathProblem] = useState({ q: '', a: 0 });
  const [mathInput, setMathInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');
  const [hasClickedSubscribe, setHasClickedSubscribe] = useState(false);

  // Check persistence on mount
  useEffect(() => {
      const activeUser = localStorage.getItem(STORAGE_KEY_USER_TOKEN);
      
      if (activeUser) {
          try {
            const { username, tier } = JSON.parse(activeUser);
            // If we have a valid active session with a tier, auto-login
            if (username && tier) {
                onAuthenticated(tier, username);
            } else if (username) {
                // Partial session, needs tier verification
                setUsername(username);
                setStep('antibot');
            }
          } catch (e) {
              localStorage.removeItem(STORAGE_KEY_USER_TOKEN);
          }
      }
      
      generateMathProblem();
  }, []);

  useEffect(() => { setError(''); setKeyInput(''); }, [step]);

  const generateMathProblem = () => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    const op = Math.random() > 0.5 ? '+' : '*';
    setMathProblem({ q: `${n1} ${op} ${n2}`, a: op === '+' ? n1 + n2 : n1 * n2 });
  };

  // Helper to get/save users
  const getUsersDB = () => {
      const db = localStorage.getItem(USERS_DB_KEY);
      return db ? JSON.parse(db) : {};
  };

  const saveUserDB = (newDB: any) => {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(newDB));
  };

  const generateSafePassword = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
      let pass = "";
      const length = 16;
      for(let i=0; i<length; i++) {
          pass += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setPassword(pass);
      setShowPassword(true);
      setError("Safe password generated!");
  };

  const handleAuthAction = () => {
    if (!username || !password) { setError("Please enter credentials."); return; }
    
    const db = getUsersDB();
    const trimmedUser = username.trim();

    if (isSignUp) {
        if (db[trimmedUser]) { 
            setError("Username already exists! Please use another username."); 
            return; 
        }
        // Create new user object
        db[trimmedUser] = { password: password, tier: null };
        saveUserDB(db);
        
        // Proceed to security check
        setStep('antibot');
    } else {
        // Login
        const userData = db[trimmedUser];
        if (!userData) { 
             setError("User not found. Please Sign Up first."); 
             return;
        }

        // Handle legacy string passwords vs object passwords
        const savedPass = typeof userData === 'string' ? userData : userData.password;
        
        if (savedPass !== password) { 
            setError("Invalid password."); 
            return; 
        }

        // If user is already Premium/Free in DB, skip verification
        if (typeof userData === 'object' && userData.tier) {
             // Save active session
             localStorage.setItem(STORAGE_KEY_USER_TOKEN, JSON.stringify({ username: trimmedUser, tier: userData.tier }));
             onAuthenticated(userData.tier, trimmedUser);
             return;
        }

        setStep('antibot');
    }
  };

  const handleMathSubmit = () => {
    if (parseInt(mathInput) === mathProblem.a) {
      setStep('tier_selection');
    } else {
      setError('Incorrect.');
      generateMathProblem();
      setMathInput('');
    }
  };

  const handleSubscribeClick = () => {
      window.open("https://youtube.com/@Fredbear555", "_blank");
      setTimeout(() => setHasClickedSubscribe(true), 1500);
  };

  const handleGenerateKey = () => {
      if (!hasClickedSubscribe) return;
      setTimeout(() => {
          setKeyInput('FREDBEAR-FREE-V2.1-ACCESS');
      }, 1000);
  };

  const updateUserTierInDB = (tier: UserTier) => {
      const db = getUsersDB();
      const trimmedUser = username.trim();
      
      if (db[trimmedUser]) {
          if (typeof db[trimmedUser] === 'string') {
              // Upgrade legacy user
              db[trimmedUser] = { password: db[trimmedUser], tier: tier };
          } else {
              db[trimmedUser].tier = tier;
          }
          saveUserDB(db);
      }
      
      localStorage.setItem(STORAGE_KEY_USER_TOKEN, JSON.stringify({ username: trimmedUser, tier: tier }));
      onAuthenticated(tier, trimmedUser);
  };

  const handleFreeKeyVerify = () => {
    setIsChecking(true);
    setTimeout(() => {
        if (keyInput.includes('FREDBEAR') || keyInput.length > 5) {
             updateUserTierInDB('free');
        } else {
            setIsChecking(false);
            setError('Invalid Key.');
        }
    }, 1500);
  };

  const handlePremiumVerify = () => {
    const normalizedInput = keyInput.trim().toLowerCase();
    setIsChecking(true);
    setTimeout(() => {
        if (PREMIUM_KEYS.includes(normalizedInput)) {
             updateUserTierInDB('premium');
        } else {
            setIsChecking(false);
            setError("Invalid Key.");
        }
    }, 2000);
  };

  const openUnlockLink = () => window.open("https://sub4unlock.com/SL/1723051", "_blank");

  if (step === 'login') {
    return (
      <div className="fixed inset-0 z-50 bg-neutral-950 flex items-center justify-center p-4 font-['Inter']">
        <div className="w-full max-w-md bg-neutral-900 p-8 rounded-2xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.7)] border border-yellow-500/20">
           <div className="text-center mb-8">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-600 mb-4 shadow-lg shadow-yellow-500/20 ring-1 ring-yellow-300/50">
                <Lock className="text-black" size={32} />
             </div>
             <h1 className="text-3xl font-extrabold text-yellow-400 tracking-tight">Fredbear555Ai</h1>
             <p className="text-neutral-400 text-sm mt-2 font-medium">Secure System Login</p>
           </div>
           
           <div className="space-y-4 mb-6">
             <div className="flex border-b border-neutral-800 mb-4">
               <button className={`flex-1 pb-3 text-sm font-bold transition-all ${!isSignUp ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-neutral-500 hover:text-neutral-300'}`} onClick={() => { setIsSignUp(false); setError(''); }}>Log In</button>
               <button className={`flex-1 pb-3 text-sm font-bold transition-all ${isSignUp ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-neutral-500 hover:text-neutral-300'}`} onClick={() => { setIsSignUp(true); setError(''); }}>Create Account</button>
             </div>
             
             <div className="space-y-3">
                <div className="relative group">
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-yellow-100 outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 placeholder-neutral-600 transition-all" 
                        placeholder="Username" 
                    />
                </div>
                
                <div className="relative group">
                    <input 
                        type={showPassword ? "text" : "password"} 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-yellow-100 outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 pr-10 placeholder-neutral-600 transition-all" 
                        placeholder="Password" 
                    />
                    <button 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-yellow-400 transition-colors p-1"
                        tabIndex={-1}
                        type="button"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {isSignUp && (
                    <button 
                        onClick={generateSafePassword}
                        className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-yellow-500/80 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border border-neutral-700 hover:border-yellow-500/30"
                    >
                        <RefreshCw size={14} /> Generate Safe Password
                    </button>
                )}
             </div>

             {error && (
                 <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${error.includes('generated') ? 'bg-green-900/20 text-green-400 border border-green-500/20' : 'bg-red-900/20 text-red-400 border border-red-500/20'}`}>
                     <ShieldAlert size={14} />
                     {error}
                 </div>
             )}
           </div>

           <button 
                onClick={handleAuthAction} 
                className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-xl font-bold text-sm hover:from-yellow-400 hover:to-orange-400 transition-all shadow-lg shadow-yellow-500/20 transform active:scale-[0.98]"
           >
                {isSignUp ? 'Register & Continue' : 'Access System'}
           </button>
        </div>
      </div>
    );
  }

  if (step === 'antibot') {
    return (
        <div className="fixed inset-0 z-50 bg-neutral-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-neutral-900 p-8 rounded-2xl shadow-2xl border border-yellow-500/20 text-center">
           <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/30">
             <Calculator className="w-8 h-8 text-yellow-500" />
           </div>
           <h2 className="text-xl font-bold text-yellow-100 mb-2">Security Check</h2>
           <p className="text-neutral-400 text-sm mb-6">Please solve: <span className="text-yellow-400 font-mono text-lg">{mathProblem.q}</span></p>
           <input type="number" value={mathInput} onChange={(e) => setMathInput(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-center mb-4 text-yellow-100 focus:border-yellow-500/50 outline-none" autoFocus />
           {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
           <button onClick={handleMathSubmit} className="w-full py-3 bg-yellow-500 text-black rounded-lg font-bold shadow-lg shadow-yellow-500/10 hover:bg-yellow-400 transition-all">Verify</button>
        </div>
      </div>
    );
  }

  if (step === 'tier_selection') {
    return (
      <div className="fixed inset-0 z-50 bg-neutral-950 flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
             <div className="border border-neutral-800 bg-neutral-900 rounded-2xl p-8 hover:border-neutral-600 transition-all group">
                 <h3 className="text-2xl font-bold mb-2 text-neutral-200 group-hover:text-white">Free License</h3>
                 <p className="text-neutral-500 text-sm mb-6">Standard AI v2.1 + Web Search</p>
                 <button onClick={() => setStep('free_verify')} className="w-full py-3 bg-neutral-800 text-neutral-300 font-bold rounded-lg hover:bg-neutral-700 transition-colors">Select Free</button>
             </div>
             <div className="border border-yellow-500/40 bg-gradient-to-br from-neutral-900 to-yellow-900/20 rounded-2xl p-8 hover:shadow-[0_0_30px_-5px_rgba(234,179,8,0.2)] transition-all relative overflow-hidden">
                 <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-black px-3 py-1 uppercase tracking-widest">Recommended</div>
                 <h3 className="text-2xl font-bold mb-2 text-yellow-400">Premium License</h3>
                 <p className="text-yellow-100/70 text-sm mb-6">Hybrid v2.7 + 150 IQ + Deep Research + Image/Video Gen</p>
                 <button onClick={() => setStep('premium_verify')} className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-black font-bold rounded-lg shadow-lg shadow-orange-900/20 transition-all">Select Premium</button>
             </div>
        </div>
      </div>
    );
  }

  if (step === 'free_verify') {
      return (
        <div className="fixed inset-0 z-50 bg-neutral-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-neutral-900 p-6 rounded-2xl shadow-2xl border border-neutral-800">
                <button onClick={() => setStep('tier_selection')} className="text-sm text-neutral-500 mb-4 hover:text-white transition-colors">&larr; Back</button>
                <h2 className="text-xl font-bold mb-6 text-white">Free Verification</h2>
                <button onClick={handleSubscribeClick} className={`w-full p-3 mb-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all ${hasClickedSubscribe ? 'bg-green-600 shadow-lg shadow-green-900/20' : 'bg-red-600 shadow-lg shadow-red-900/20 hover:bg-red-500'}`}>{hasClickedSubscribe ? 'Subscribed' : '1. Subscribe Channel'}</button>
                <button onClick={handleGenerateKey} disabled={!hasClickedSubscribe} className="w-full p-3 mb-3 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-300 font-bold flex items-center justify-center gap-2 hover:bg-neutral-700 disabled:opacity-50">{keyInput ? 'Key Generated' : '2. Generate Key'}</button>
                <input value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder="Key..." className="w-full p-3 border border-neutral-700 bg-neutral-950 rounded-lg text-center mb-4 text-yellow-100 placeholder-neutral-600" />
                <button onClick={handleFreeKeyVerify} className="w-full p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all">3. Launch</button>
                {error && <p className="text-red-400 text-xs text-center mt-2">{error}</p>}
            </div>
        </div>
      );
  }

  if (step === 'premium_verify') {
      return (
        <div className="fixed inset-0 z-50 bg-neutral-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-neutral-900 p-6 rounded-2xl shadow-[0_0_40px_-10px_rgba(234,179,8,0.15)] border border-yellow-500/30">
                <button onClick={() => setStep('tier_selection')} className="text-sm text-neutral-500 mb-4 hover:text-white transition-colors">&larr; Back</button>
                <h2 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Premium Activation</h2>
                <div onClick={openUnlockLink} className="p-4 bg-blue-900/20 border border-blue-500/30 text-blue-400 rounded-lg mb-4 cursor-pointer font-medium text-sm text-center hover:bg-blue-900/30 transition-colors">Click to Get Key</div>
                <input value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder="Enter Premium Key" className="w-full p-3 border border-neutral-800 bg-neutral-950 text-yellow-100 rounded-lg mb-4 focus:border-yellow-500/50 outline-none" />
                <button onClick={handlePremiumVerify} className="w-full p-3 bg-yellow-500 text-black rounded-lg font-bold hover:bg-yellow-400 shadow-lg shadow-yellow-500/20 transition-all">Activate</button>
                {error && <p className="text-red-400 text-xs text-center mt-2">{error}</p>}
            </div>
        </div>
      );
  }

  return null;
}
