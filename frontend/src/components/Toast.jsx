import { useState, useEffect } from 'react';

function Toast({ message, type = 'info', duration = 5000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(), 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    const baseStyles = "card border-0 shadow-2xl transform transition-all duration-300 max-w-sm";
    
    switch (type) {
      case 'success':
        return `${baseStyles} border-green-400/50 bg-green-400/10`;
      case 'error':
        return `${baseStyles} border-red-400/50 bg-red-400/10`;
      case 'warning':
        return `${baseStyles} border-yellow-400/50 bg-yellow-400/10`;
      case 'match_created':
        return `${baseStyles} border-cyan-400/50 bg-cyan-400/10`;
      default:
        return `${baseStyles} border-gray-400/50 bg-gray-400/10`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'match_created':
        return '🏆';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`${getToastStyles()} p-6 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}>
      <div className="flex items-start space-x-4">
        <span className="text-2xl">{getIcon()}</span>
        <div className="flex-1">
          <p className="text-base font-semibold text-black">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(), 300);
          }}
          className="text-gray-400 hover:text-white transition-colors text-lg"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default Toast;
