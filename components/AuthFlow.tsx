
import React, { useState, useEffect, useRef } from 'react';
import { UserTier } from '../types';
import { ShieldAlert, Calculator, CheckCircle2, Lock, Youtube, Key, Link as LinkIcon, UserPlus, LogIn, ShieldCheck, Globe } from 'lucide-react';

interface AuthFlowProps {
  onAuthenticated: (tier: UserTier) => void;
}

const PREMIUM_KEYS = ['aiiscoked', 'baddreamasriel', 'kingasgore'];
const USERS_DB_KEY = 'fredbear_users_db';
const STORAGE_KEY_USER_TOKEN = 'fredbear_user_token';

const parseJwt = (token: string) => {
  try {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export default function AuthFlow({ onAuthenticated }: AuthFlowProps) {
  const [step, setStep] = useState<'login' | 'antibot' | 'tier_selection' | 'premium_verify' | 'free_verify'>('login');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [mathProblem, setMathProblem] = useState({ q: '', a: 0 });
  const [mathInput, setMathInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');
  const [hasClickedSubscribe, setHasClickedSubscribe] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  const googleButtonRef = useRef<HTMLDivElement>(null);

  // Check persistence on mount
  useEffect(() => {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER_TOKEN);
      if (savedUser) {
          try {
            const user = JSON.parse(savedUser);
            setUsername(user.email);
            setUserAvatar(user.avatar);
            // If user already solved antibot before, maybe skip? 
            // For security, we usually ask antibot again, or skip to tier.
            // Let's skip to antibot to be safe, or tier if very trusted.
            // User asked "Jangan Disuruh Login lagi". So we skip login step.
            setStep('antibot');
          } catch (e) {
              localStorage.removeItem(STORAGE_KEY_USER_TOKEN);
          }
      }
      
      generateMathProblem();
      
      const checkGsi = () => {
        if ((window as any).google?.accounts?.id) {
          setIsGsiLoaded(true);
        } else {
          setTimeout(checkGsi, 200);
        }
      };
      checkGsi();
  }, []);

  useEffect(() => {
    if (step === 'login' && isGsiLoaded && googleButtonRef.current && !localStorage.getItem(STORAGE_KEY_USER_TOKEN)) {
      try {
        const google = (window as any).google;
        google.accounts.id.initialize({
          client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com", 
          callback: handleGoogleCredentialResponse,
          auto_select: true, // Try to auto select real account
          cancel_on_tap_outside: true
        });
        google.accounts.id.renderButton(
          googleButtonRef.current,
          { theme: "outline", size: "large", width: "100%", shape: "rectangular" }
        );
      } catch (e) {
        console.error("GSI Init Error", e);
      }
    }
  }, [step, isGsiLoaded]);

  useEffect(() => { setError(''); setKeyInput(''); }, [step]);

  const generateMathProblem = () => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    const op = Math.random() > 0.5 ? '+' : '*';
    setMathProblem({ q: `${n1} ${op} ${n2}`, a: op === '+' ? n1 + n2 : n1 * n2 });
  };

  const handleGoogleCredentialResponse = (response: any) => {
      const responsePayload = parseJwt(response.credential);
      if (responsePayload) {
          completeLogin(responsePayload.email, responsePayload.picture);
      } else {
          setError("Failed to verify Google Account.");
      }
  };

  const completeLogin = (email: string, picture: string | null) => {
      setUsername(email);
      setUserAvatar(picture);
      localStorage.setItem(STORAGE_KEY_USER_TOKEN, JSON.stringify({ email, avatar: picture }));
      setStep('antibot');
  };

  const handleSimulatedGoogleLogin = () => {
      completeLogin("demo_user@gmail.com", null);
  };

  const handleAuthAction = () => {
    if (!username || !password) { setError("Please enter credentials."); return; }
    const usersStr = localStorage.getItem(USERS_DB_KEY);
    const users = usersStr ? JSON.parse(usersStr) : {};

    if (isSignUp) {
        if (users[username]) { setError("Username exists."); return; }
        users[username] = password;
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
        completeLogin(username, null);
    } else {
        if (!users[username] || users[username] !== password) { setError("Invalid credentials."); return; }
        completeLogin(username, null);
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
      setIsGeneratingKey(true);
      setTimeout(() => {
          setKeyInput('FREDBEAR-FREE-V2.1-ACCESS');
          setIsGeneratingKey(false);
      }, 2000);
  };

  const handleFreeKeyVerify = () => {
    setIsChecking(true);
    setTimeout(() => {
        if (keyInput.includes('FREDBEAR') || keyInput.length > 5) {
             onAuthenticated('free');
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
             onAuthenticated('premium');
        } else {
            setIsChecking(false);
            setError("Invalid Key.");
        }
    }, 2000);
  };

  const openUnlockLink = () => window.open("https://sub4unlock.com/SL/1723051", "_blank");

  if (step === 'login') {
    return (
      <div className="fixed inset-0 z-50 bg-[#f0f2f5] flex items-center justify-center p-4 font-['Roboto']">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md border border-gray-200">
           <div className="text-center mb-6">
             <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-4">
                <Lock className="text-blue-600" size={24} />
             </div>
             <h1 className="text-2xl font-bold text-gray-800">Fredbear555Ai</h1>
             <p className="text-gray-600 text-sm mt-1">Sign in with your real account</p>
           </div>
           
           <div className="min-h-[40px] mb-6 relative">
               <div ref={googleButtonRef} className="w-full flex justify-center min-h-[40px]"></div>
               <div className="text-center mt-3">
                   <button onClick={handleSimulatedGoogleLogin} className="text-[10px] text-gray-400 underline hover:text-gray-600">
                       (Skip / Developer Bypass)
                   </button>
               </div>
           </div>

           <div className="relative flex py-2 items-center mb-6">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">or</span>
                <div className="flex-grow border-t border-gray-200"></div>
           </div>
           
           <div className="space-y-3 mb-6">
             <div className="flex border-b border-gray-200 mb-3">
               <button className={`flex-1 pb-2 text-sm font-medium ${!isSignUp ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`} onClick={() => { setIsSignUp(false); setError(''); }}>Log In</button>
               <button className={`flex-1 pb-2 text-sm font-medium ${isSignUp ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`} onClick={() => { setIsSignUp(true); setError(''); }}>Create Account</button>
             </div>
             <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-3 bg-white border border-gray-300 rounded text-sm outline-none focus:border-blue-500" placeholder="Username/Email" />
             <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-3 bg-white border border-gray-300 rounded text-sm outline-none focus:border-blue-500" placeholder="Password" />
             {error && <p className="text-red-600 text-xs">{error}</p>}
           </div>

           <button onClick={handleAuthAction} className="w-full py-2.5 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 transition-colors">
                {isSignUp ? 'Sign Up' : 'Next'}
           </button>
        </div>
      </div>
    );
  }

  if (step === 'antibot') {
    return (
        <div className="fixed inset-0 z-50 bg-[#f0f2f5] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-lg border border-gray-200 text-center">
           <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <Calculator className="w-8 h-8 text-blue-600" />
           </div>
           <h2 className="text-xl font-bold text-gray-800 mb-2">Security Check</h2>
           {userAvatar && <img src={userAvatar} alt="User" className="w-10 h-10 rounded-full mx-auto mb-4 border border-gray-200" />}
           <p className="text-gray-500 text-sm mb-4">Solve: {mathProblem.q} = ?</p>
           <input type="number" value={mathInput} onChange={(e) => setMathInput(e.target.value)} className="w-full border border-gray-300 rounded p-2 text-center mb-4" />
           {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
           <button onClick={handleMathSubmit} className="w-full py-2.5 bg-blue-600 text-white rounded font-medium">Verify</button>
        </div>
      </div>
    );
  }

  if (step === 'tier_selection') {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
             <div className="border rounded-xl p-6 hover:shadow-lg transition-all">
                 <h3 className="text-xl font-bold mb-2">Free License</h3>
                 <p className="text-gray-500 text-sm mb-4">Standard AI v2.1 + Web Search</p>
                 <button onClick={() => setStep('free_verify')} className="w-full py-3 bg-gray-100 font-bold rounded-lg">Select Free</button>
             </div>
             <div className="border border-orange-200 bg-orange-50/50 rounded-xl p-6 hover:shadow-lg transition-all relative overflow-hidden">
                 <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-3 py-1">BEST</div>
                 <h3 className="text-xl font-bold mb-2 text-orange-900">Premium License</h3>
                 <p className="text-orange-800 text-sm mb-4">Hybrid v2.7 + 150 IQ + Deep Research + Image/Video Gen</p>
                 <button onClick={() => setStep('premium_verify')} className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-lg">Select Premium</button>
             </div>
        </div>
      </div>
    );
  }

  if (step === 'free_verify') {
      return (
        <div className="fixed inset-0 z-50 bg-white flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-xl border border-gray-100">
                <button onClick={() => setStep('tier_selection')} className="text-sm text-gray-500 mb-4">&larr; Back</button>
                <h2 className="text-xl font-bold mb-4">Free Verification</h2>
                <button onClick={handleSubscribeClick} className={`w-full p-3 mb-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 ${hasClickedSubscribe ? 'bg-green-600' : 'bg-red-600'}`}>{hasClickedSubscribe ? 'Subscribed' : '1. Subscribe Channel'}</button>
                <button onClick={handleGenerateKey} disabled={!hasClickedSubscribe} className="w-full p-3 mb-3 rounded-lg border font-bold flex items-center justify-center gap-2">{keyInput ? 'Key Generated' : '2. Generate Key'}</button>
                <input value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder="Key..." className="w-full p-3 border rounded-lg text-center mb-3" />
                <button onClick={handleFreeKeyVerify} className="w-full p-3 bg-blue-600 text-white rounded-lg font-bold">3. Launch</button>
                {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
            </div>
        </div>
      );
  }

  if (step === 'premium_verify') {
      return (
        <div className="fixed inset-0 z-50 bg-white flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-xl border border-gray-100">
                <button onClick={() => setStep('tier_selection')} className="text-sm text-gray-500 mb-4">&larr; Back</button>
                <h2 className="text-xl font-bold mb-4 text-orange-600">Premium Activation</h2>
                <div onClick={openUnlockLink} className="p-4 bg-blue-50 text-blue-700 rounded-lg mb-4 cursor-pointer font-medium text-sm text-center">Click to Get Key</div>
                <input value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder="Enter Premium Key" className="w-full p-3 border rounded-lg mb-4" />
                <button onClick={handlePremiumVerify} className="w-full p-3 bg-black text-white rounded-lg font-bold">Activate</button>
                {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
            </div>
        </div>
      );
  }

  return null;
}
