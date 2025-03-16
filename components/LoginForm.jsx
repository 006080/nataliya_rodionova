// // src/components/LoginForm.js
// import React, { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../src/contexts/AuthContext';

// const LoginForm = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [remember, setRemember] = useState(false);
//   const [formError, setFormError] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
  
//   const { login, authError } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
  
//   // Get redirect path from location state, or default to homepage
//   const from = location.state?.from || '/';
  
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Form validation
//     if (!email.trim()) {
//       setFormError('Email is required');
//       return;
//     }
    
//     if (!password) {
//       setFormError('Password is required');
//       return;
//     }
    
//     try {
//       setIsSubmitting(true);
//       setFormError('');
      
//       // Attempt login
//       const success = await login(email, password);
      
//       if (success) {
//         // If remember me is checked, store email in localStorage
//         if (remember) {
//           localStorage.setItem('rememberedEmail', email);
//         } else {
//           localStorage.removeItem('rememberedEmail');
//         }
        
//         // Redirect to the page user was trying to access, or home
//         navigate(from, { replace: true });
//       }
//     } catch (error) {
//       console.error('Login submission error:', error);
//       setFormError('An unexpected error occurred.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
  
//   // Load remembered email on component mount
//   React.useEffect(() => {
//     const rememberedEmail = localStorage.getItem('rememberedEmail');
//     if (rememberedEmail) {
//       setEmail(rememberedEmail);
//       setRemember(true);
//     }
//   }, []);
  
//   return (
//     <div className="login-container">
//       <h2>Login to Your Account</h2>
      
//       {(formError || authError) && (
//         <div className="error-message">
//           {formError || authError}
//         </div>
//       )}
      
//       <form onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label htmlFor="email">Email</label>
//           <input
//             type="email"
//             id="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             disabled={isSubmitting}
//             placeholder="your@email.com"
//             autoComplete="email"
//           />
//         </div>
        
//         <div className="form-group">
//           <label htmlFor="password">Password</label>
//           <input
//             type="password"
//             id="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             disabled={isSubmitting}
//             autoComplete="current-password"
//           />
//         </div>
        
//         <div className="form-options">
//           <div className="remember-me">
//             <input
//               type="checkbox"
//               id="remember"
//               checked={remember}
//               onChange={(e) => setRemember(e.target.checked)}
//               disabled={isSubmitting}
//             />
//             <label htmlFor="remember">Remember me</label>
//           </div>
          
//           <a href="/forgot-password" className="forgot-password">
//             Forgot Password?
//           </a>
//         </div>
        
//         <button
//           type="submit"
//           className="login-button"
//           disabled={isSubmitting}
//         >
//           {isSubmitting ? 'Logging in...' : 'Login'}
//         </button>
//       </form>
      
//       <div className="register-link">
//         Don't have an account? <a href="/register">Register here</a>
//       </div>
//     </div>
//   );
// };

// export default LoginForm;



// src/components/LoginForm.js
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from location state, or default to homepage
  const from = location.state?.from || '/';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!email.trim()) {
      setFormError('Email is required');
      return;
    }
    
    if (!password) {
      setFormError('Password is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormError('');
      
      // Attempt login
      const success = await login(email, password);
      
      if (success) {
        // If remember me is checked, store email in localStorage
        if (remember) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        // Redirect to the page user was trying to access, or home
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Login submission error:', error);
      setFormError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRemember(true);
    }
  }, []);
  
  return (
    <div className="login-container">
      <h2>Login to Your Account</h2>
      
      {(formError || authError) && (
        <div className="error-message">
          {formError || authError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            placeholder="your@email.com"
            autoComplete="email"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            autoComplete="current-password"
          />
        </div>
        
        <div className="form-options">
          <div className="remember-me">
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              disabled={isSubmitting}
            />
            <label htmlFor="remember">Remember me</label>
          </div>
          
          <a href="/forgot-password" className="forgot-password">
            Forgot Password?
          </a>
        </div>
        
        <button
          type="submit"
          className="login-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="register-link">
        Don't have an account? <a href="/register">Register here</a>
      </div>
    </div>
  );
};

export default LoginForm;