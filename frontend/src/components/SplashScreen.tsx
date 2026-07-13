import React from "react";

interface SplashScreenProps {
  status: "connecting" | "error" | "offline";
  message?: string;
  onRetry?: () => void;
  onContinueOffline?: () => void;
}

export default function SplashScreen({ status, message, onRetry, onContinueOffline }: SplashScreenProps) {
  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-[9999]">
      {/* Brand */}
      <div className="text-center mb-12">
        <img 
          src="/logo.png" 
          alt="Amirable Hotel & Hospitality" 
          className="w-64 h-auto mx-auto mb-6 object-contain"
        />
      </div>

      {/* Spinner */}
      {status === "connecting" && (
        <div className="mb-8">
          <svg className="animate-spin h-10 w-10 text-amber-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}

      {status === "error" && (
        <div className="mb-8">
          <svg className="h-10 w-10 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
      )}

      {status === "offline" && (
        <div className="mb-8">
          <svg className="h-10 w-10 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0119 12.55" />
            <path d="M5 12.55a10.94 10.94 0 015.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0122.56 9" />
            <path d="M1.42 9a15.91 15.91 0 014.7-2.88" />
            <path d="M8.53 16.11a6 6 0 016.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
        </div>
      )}

      {/* Status Text */}
      <div className="text-center max-w-md px-6">
        {status === "connecting" && (
          <>
            <p className="text-lg text-amber-400 font-mono mb-2">Connecting to local server</p>
            <p className="text-sm text-slate-500 font-mono animate-pulse">Please wait................</p>
            <div className="mt-8 h-1 w-64 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full w-full bg-amber-500/30 rounded-full animate-pulse" />
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <p className="text-lg text-rose-400 font-mono mb-3">Connection Error</p>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              {message || "Could not reach the backend server."}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed mb-8">
              If you are logging in from a different terminal or device, ensure you are on the same shared network and the server is running on the host machine.
            </p>
            <p className="text-xs text-slate-600 italic mb-6">Have a productive work day.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={onRetry}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-semibold transition-all border border-slate-700"
              >
                Retry Connection
              </button>
              <button
                onClick={onContinueOffline}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition-all"
              >
                Continue Offline
              </button>
            </div>
          </>
        )}

        {status === "offline" && (
          <>
            <p className="text-lg text-slate-300 font-mono mb-3">Offline Mode</p>
            <p className="text-sm text-slate-500 leading-relaxed mb-8">
              Using local browser storage. Data won't persist across devices.
            </p>
            <button
              onClick={onContinueOffline}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-semibold transition-all border border-slate-700"
            >
              Continue Anyway
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-center">
        <p className="text-[10px] text-slate-700 font-mono tracking-wider">
          Amirable Hotel & Hospitality Manager &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
