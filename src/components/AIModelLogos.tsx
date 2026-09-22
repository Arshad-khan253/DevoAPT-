import React from "react";

interface AIModelLogoProps {
  modelId: string;
  className?: string;
  size?: number;
}

export const AIModelLogo: React.FC<AIModelLogoProps> = ({ modelId, className = "w-6 h-6", size }) => {
  const customStyle = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  switch (modelId.toLowerCase()) {
    case "devoapt":
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={customStyle}
        >
          <defs>
            <linearGradient id="devoGrad1" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8B5CF6" />
              <stop offset="0.5" stopColor="#6366F1" />
              <stop offset="1" stopColor="#EC4899" />
            </linearGradient>
            <linearGradient id="devoGrad2" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#06B6D4" />
              <stop offset="1" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="12" fill="#181824" />
          <path
            d="M24 6L40 15.2V32.8L24 42L8 32.8V15.2L24 6Z"
            stroke="url(#devoGrad1)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M24 14L34 19.8V31.2L24 37L14 31.2V19.8L24 14Z"
            fill="url(#devoGrad1)"
            fillOpacity="0.3"
            stroke="url(#devoGrad2)"
            strokeWidth="1.8"
          />
          <circle cx="24" cy="25.5" r="5" fill="#FFFFFF" />
          <circle cx="24" cy="25.5" r="7.5" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      );

    case "gemini":
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={customStyle}
        >
          <defs>
            <linearGradient id="geminiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4285F4" />
              <stop offset="40%" stopColor="#9B72CB" />
              <stop offset="75%" stopColor="#D96570" />
              <stop offset="100%" stopColor="#1BA1E2" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="12" fill="#0C101C" />
          <path
            d="M24 4C24 15.0457 15.0457 24 4 24C15.0457 24 24 32.9543 24 44C24 32.9543 32.9543 24 44 24C32.9543 24 24 15.0457 24 4Z"
            fill="url(#geminiGrad)"
          />
          <circle cx="24" cy="24" r="3" fill="#FFFFFF" fillOpacity="0.9" />
        </svg>
      );

    case "chatgpt":
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={customStyle}
        >
          <rect width="48" height="48" rx="12" fill="#10A37F" />
          <path
            d="M37.5 21.3a7.4 7.4 0 0 0-.6-6 7.6 7.6 0 0 0-7.3-3.8 7.5 7.5 0 0 0-5.7-2.5 7.6 7.6 0 0 0-7.2 5.1 7.5 7.5 0 0 0-4.9 3.6 7.5 7.5 0 0 0 .9 8.3 7.4 7.4 0 0 0 .6 6 7.6 7.6 0 0 0 7.3 3.8 7.5 7.5 0 0 0 5.7 2.5 7.6 7.6 0 0 0 7.2-5.1 7.5 7.5 0 0 0 4.9-3.6 7.5 7.5 0 0 0-.9-8.3zm-13.6 15a5.5 5.5 0 0 1-3.3-1.1l-.2-.1 4.5-2.6a1 1 0 0 0 .5-.9v-6.3l1.9 1.1v7.6a5.5 5.5 0 0 1-3.4 2.3zm-10.4-4.8a5.5 5.5 0 0 1-.7-3.4v-.3l4.5 2.6a1 1 0 0 0 1 0l5.5-3.2v2.2l-6.6 3.8a5.5 5.5 0 0 1-3.7-1.7zm-2.4-11.4a5.5 5.5 0 0 1 2.6-2.3l.3.1v5.2a1 1 0 0 0 .5.9l5.5 3.2-1.9 1.1-6.6-3.8a5.5 5.5 0 0 1-.4-4.4zm17.9 2.5l-5.5-3.2 1.9-1.1 6.6 3.8a5.5 5.5 0 0 1 .4 4.4 5.5 5.5 0 0 1-2.6 2.3l-.3-.1v-5.2a1 1 0 0 0-.5-.9zm4.2-3.8a5.5 5.5 0 0 1 .7 3.4v.3l-4.5-2.6a1 1 0 0 0-1 0l-5.5 3.2v-2.2l6.6-3.8a5.5 5.5 0 0 1 3.7 1.7zm-11.7-5.5a5.5 5.5 0 0 1 3.3 1.1l.2.1-4.5 2.6a1 1 0 0 0-.5.9v6.3l-1.9-1.1v-7.6a5.5 5.5 0 0 1 3.4-2.3zm1.6 8.5l2.7 1.6v3.1l-2.7 1.6-2.7-1.6v-3.1l2.7-1.6z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "claude":
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={customStyle}
        >
          <rect width="48" height="48" rx="12" fill="#D97706" />
          {/* Claude Asterisk Sunburst */}
          <g fill="#FFFFFF">
            <path d="M22.5 8h3v32h-3z" />
            <path d="M8 22.5h32v3H8z" />
            <path d="M12.686 14.808l2.122-2.122 22.627 22.627-2.122 2.122z" />
            <path d="M35.314 12.686l2.122 2.122-22.628 22.627-2.121-2.121z" />
            <circle cx="24" cy="24" r="5.5" fill="#B45309" stroke="#FFFFFF" strokeWidth="2.5" />
          </g>
        </svg>
      );

    case "deepseek":
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={customStyle}
        >
          <defs>
            <linearGradient id="deepSeekGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0284C7" />
              <stop offset="0.5" stopColor="#0369A1" />
              <stop offset="1" stopColor="#075985" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="12" fill="url(#deepSeekGrad)" />
          {/* Whale Crest */}
          <path
            d="M10 26C11 20 16 14 24 14C32 14 37 19 38 24C38.6 27 37 29.5 35 31C32 33.2 27 34 22 34C16 34 12 31 10 26Z"
            fill="#FFFFFF"
          />
          <path
            d="M34 26C37 24 40 20 40 18C38 19 36 21 34 23V26Z"
            fill="#38BDF8"
          />
          <circle cx="17" cy="22" r="2.2" fill="#0369A1" />
          {/* Hydrodynamic dorsal fin */}
          <path
            d="M23 14C23 10 25 8 28 8C27 10 26 12 25 14H23Z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "copilot":
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={customStyle}
        >
          <defs>
            <linearGradient id="copilot1" x1="6" y1="10" x2="28" y2="38" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0EA5E9" />
              <stop offset="1" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="copilot2" x1="20" y1="10" x2="42" y2="38" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EC4899" />
              <stop offset="0.5" stopColor="#F59E0B" />
              <stop offset="1" stopColor="#10B981" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="12" fill="#0F172A" />
          <path
            d="M14 18C14 13.58 17.58 10 22 10C26.42 10 30 13.58 30 18V28C30 32.42 26.42 36 22 36C17.58 36 14 32.42 14 28V18Z"
            stroke="url(#copilot1)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M34 30C34 34.42 30.42 38 26 38C21.58 38 18 34.42 18 30V20C18 15.58 21.58 12 26 12C30.42 12 34 15.58 34 20V30Z"
            stroke="url(#copilot2)"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>
      );

    case "metaai":
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={customStyle}
        >
          <defs>
            <linearGradient id="metaGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0064E0" />
              <stop offset="0.5" stopColor="#0082FB" />
              <stop offset="1" stopColor="#00A9FF" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="12" fill="#0A101D" />
          {/* Meta Infinity Loop */}
          <path
            d="M24 23.5C21.8 19.5 18.5 16 14.5 16C9.5 16 6 20 6 24C6 28 9.5 32 14.5 32C18.5 32 21.8 28.5 24 24.5C26.2 28.5 29.5 32 33.5 32C38.5 32 42 28 42 24C42 20 38.5 16 33.5 16C29.5 16 26.2 19.5 24 23.5Z"
            stroke="url(#metaGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "grok":
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={customStyle}
        >
          <rect width="48" height="48" rx="12" fill="#000000" />
          {/* Grok geometric slashed slash */}
          <path
            d="M10 10L38 38M38 10L10 38"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M14 24H34"
            stroke="#38BDF8"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="24" cy="24" r="3" fill="#FFFFFF" />
        </svg>
      );

    case "siri":
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={customStyle}
        >
          <defs>
            <linearGradient id="siriOrb1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF2D55" />
              <stop offset="35%" stopColor="#AF52DE" />
              <stop offset="70%" stopColor="#5856D6" />
              <stop offset="100%" stopColor="#007AFF" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="12" fill="#1C1C1E" />
          <circle cx="24" cy="24" r="16" fill="url(#siriOrb1)" />
          <circle cx="24" cy="24" r="10" fill="#FFFFFF" fillOpacity="0.85" filter="blur(1px)" />
          <path
            d="M16 24C18 20 22 20 24 24C26 28 30 28 32 24"
            stroke="#AF52DE"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );

    case "bixby":
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={customStyle}
        >
          <defs>
            <linearGradient id="bixbyGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1E88E5" />
              <stop offset="1" stopColor="#00ACC1" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="12" fill="#0D1B2A" />
          {/* Bixby stylized B and connected nodes */}
          <path
            d="M18 12C18 12 28 12 28 18C28 22 24 23.5 24 24C28 24.5 30 27 30 30C30 36 18 36 18 36V12Z"
            stroke="url(#bixbyGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="18" cy="18" r="2.5" fill="#00E5FF" />
          <circle cx="18" cy="30" r="2.5" fill="#00E5FF" />
          <circle cx="28" cy="24" r="2" fill="#FFFFFF" />
        </svg>
      );

    default:
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={customStyle}
        >
          <rect width="48" height="48" rx="12" fill="#1F2937" />
          <circle cx="24" cy="24" r="12" stroke="#9CA3AF" strokeWidth="3" />
          <circle cx="24" cy="24" r="4" fill="#9CA3AF" />
        </svg>
      );
  }
};
