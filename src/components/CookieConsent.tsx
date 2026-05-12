import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CookieConsent() {
 const [showBanner, setShowBanner] = useState(false);

 useEffect(() => {
 // Check if user has already consented
 const consent = localStorage.getItem('cookie-consent');
 if (!consent) {
 // Small delay so it doesn't flash on page load
 setTimeout(() => setShowBanner(true), 1000);
 }
 }, []);

 const acceptAll = () => {
 localStorage.setItem('cookie-consent', JSON.stringify({
 essential: true,
 analytics: true,
 preferences: true,
 timestamp: new Date().toISOString()
 }));
 setShowBanner(false);
 };

 const acceptEssential = () => {
 localStorage.setItem('cookie-consent', JSON.stringify({
 essential: true,
 analytics: false,
 preferences: false,
 timestamp: new Date().toISOString()
 }));
 setShowBanner(false);
 };

 if (!showBanner) return null;

 return (
 <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
 <div className="max-w-4xl mx-auto bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6">
 <div className="flex flex-col md:flex-row md:items-center gap-4">
 {/* Icon */}
 <div className="hidden md:flex w-12 h-12 rounded-xl bg-indigo-500/20 items-center justify-center flex-shrink-0">
 <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
 </svg>
 </div>

 {/* Text */}
 <div className="flex-1">
 <h3 className="text-white font-semibold mb-1">We value your privacy</h3>
 <p className="text-slate-400 text-sm">
 We use cookies to enhance your experience, analyze site traffic, and for marketing purposes. 
 By clicking "Accept All", you consent to our use of cookies. 
 Read our <Link to="/privacy" className="text-indigo-400 hover:text-indigo-300 underline">Privacy Policy</Link> for more information.
 </p>
 </div>

 {/* Buttons */}
 <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
 <button
 onClick={acceptEssential}
 className="px-4 py-2 text-sm text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-xl transition-colors"
 >
 Essential Only
 </button>
 <button
 onClick={acceptAll}
 className="px-6 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
 >
 Accept All
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}