import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toAppPath } from '../lib/navigationUrl';
import { FiCheckCircle } from 'react-icons/fi';

export interface SuccessToastProps {
  title: string;
  body?: string;
  url?: string;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export default function SuccessToast({
  title,
  body,
  url,
  onDismiss,
  autoDismissMs = 5000,
}: SuccessToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Slight delay before animating in
    const inTimer = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(inTimer);
  }, []);

  useEffect(() => {
    if (autoDismissMs <= 0) return;
    const outTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300); // Wait for exit animation
    }, autoDismissMs);
    return () => clearTimeout(outTimer);
  }, [autoDismissMs, onDismiss]);

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const path = toAppPath(url);

  const content = (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-400">
        <FiCheckCircle className="w-5 h-5" />
      </div>
      <div className="flex flex-col min-w-0 pr-4">
        <span className="font-semibold text-sm text-white tracking-tight drop-shadow-sm truncate">{title}</span>
        {body && (
          <span className="text-xs text-indigo-100/90 tracking-wide outline-none">{body}</span>
        )}
      </div>
    </div>
  );

  return (
    <div
      role="alert"
      className={`
        relative overflow-hidden
        flex items-stretch shadow-2xl rounded-xl max-w-sm
        transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}
        bg-gradient-to-br from-indigo-600/95 to-purple-700/95
        backdrop-blur-xl border border-white/10
      `}
      style={{
        boxShadow: '0 20px 40px -10px rgba(79, 70, 229, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
      }}
    >
      <div className="flex-1 p-3 min-w-0">
        {path ? (
          <Link
            to={path}
            onClick={() => {
              setIsVisible(false);
              setTimeout(onDismiss, 300);
            }}
            className="block group"
          >
            <div className="transition-transform duration-200 group-hover:scale-[1.02]">
              {content}
            </div>
            {/* Glossy overlay effect for link hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:animate-[shimmer_1.5s_infinite]" />
          </Link>
        ) : (
          content
        )}
      </div>
      <button
        type="button"
        onClick={handleClose}
        aria-label="Dismiss"
        className="flex items-center justify-center px-4 border-l border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress bar effect at the bottom */}
      <div 
        className="absolute bottom-0 left-0 h-1 bg-white/20 origin-left"
        style={{
          width: '100%',
          animation: isVisible ? `shrink ${autoDismissMs}ms linear forwards` : 'none'
        }}
      />
      <style>{`
        @keyframes shrink {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
        @keyframes shimmer {
          100% { transform: translateX(150%) skewX(-20deg); }
        }
      `}</style>
    </div>
  );
}
