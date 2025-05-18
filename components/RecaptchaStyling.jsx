import { useEffect } from 'react';

const RecaptchaStyling = () => {
  useEffect(() => {
    const styleBadge = () => {
      const badge = document.querySelector('.grecaptcha-badge');
      if (badge) {
        if (window.innerWidth <= 768) {
          badge.style.bottom = '65px';
        }
      }
    };

    styleBadge();
    const timeoutId = setTimeout(styleBadge, 1000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  return null;
};

export default RecaptchaStyling;
