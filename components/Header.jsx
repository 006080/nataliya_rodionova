import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "./Nav";
import logo from "../src/assets/Logo.webp";
import styles from "./Header.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faUser, faCartShopping, faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import CartSummary from "./CartSummary";
import { useCart } from "./CartContext";
import { useAuth } from "../src/contexts/AuthContext";
import useOutsideClick from '../src/hooks/useOutsideClick';

const Header = () => {
  const navigate = useNavigate();
  const [cartIsOpen, setCartIsOpen] = useState(false);
  const [menu, openMenu] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { cartItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  const [userData, setUserData] = useState({ name: '', email: '' });

  const navRef = useOutsideClick(() => openMenu(false))
  const userMenuRef = useOutsideClick(() => setUserMenuOpen(false));

  // useEffect(() => {
  //   if (user && user.name && user.email) {
  //     setUserData({ name: user.name, email: user.email });
  //   } else if (isAuthenticated) {
  //     // Try to get user data from localStorage if not in context
  //     try {
  //       const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  //       if (storedUser && storedUser.name && storedUser.email) {
  //         setUserData({ name: storedUser.name, email: storedUser.email });
  //       }
  //     } catch (e) {
  //       console.error('Error parsing user data from localStorage:', e);
  //     }
  //   }
  // }, [user, isAuthenticated]);

  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name || 'User', 
        email: user.email || 'No email'
      });
    }
  }, [user, isAuthenticated]);
  

  const handleCartClick = () => {
    setCartIsOpen(!cartIsOpen);
  };

  const toggleMenu = () => {
    openMenu(!menu);
  };

  const handleUserIconClick = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  return (
    <Nav>
      <div className={`${styles.navigation} ${menu ? styles.blackBackground : ''}`}>
        <div onClick={() => navigate("/")} className={styles.logo}>
          <img 
            className={`${styles.logotype} ${menu ? styles.whiteLogo : ''}`} 
            src={logo} 
            alt="Logo" 
          />
        </div>
        
        <div className={styles.navbar}>
          <ul className={styles.navLinks}>
            {["/ourservice", "/reviews", "/press", "/collaboration", "/shop", "/contacts"].map((path, index) => {
              const label = path.slice(1).toUpperCase().replace(/_/g, ' ');
              return (
                <li key={index}>
                  {path === "/press" ? (
                    <p><a href="https://thefashionvox.wordpress.com/2018/07/27/varona/" target="_blank" style={{textDecoration:'none', color: '#555'}}>{label}</a></p>
                  ) : (
                    <p 
                  
                      onClick={() => navigate(path)}
                    >
                      {label}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className={styles.icons}>
          <div className={styles.cartIconContainer}>
            <FontAwesomeIcon 
              onClick={handleCartClick} 
              className={`${styles.cartIcon} ${menu ? styles.whiteIcon : ''}`} 
              icon={faCartShopping} 
            />
            {cartItems.length > 0 && (
              <span className={styles.cartCount} onClick={handleCartClick}>
                {cartItems.reduce((total, item) => total + item.quantity, 0)}
              </span>
            )}
            {cartIsOpen && <CartSummary cartItems={cartItems} onClose={() => setCartIsOpen(false)} />}
          </div>

            {/* User Icon - Conditionally render based on authentication */}
          <div className={styles.userIconContainer}>
            <FontAwesomeIcon 
              icon={isAuthenticated ? faUser : faSignInAlt} 
              className={`${styles.userIcon} ${menu ? styles.whiteIcon : ''}`}
              onClick={handleUserIconClick}
            />
            
            {/* User dropdown menu */}
            {userMenuOpen && (
              <div className={styles.userMenu} ref={userMenuRef}>
                {isAuthenticated ? (
                  <>
                    <div className={styles.userInfo}>
                      <p>Hello, {userData.name}</p>
                      <span>{userData.email}</span>
                    </div>
                    <ul>
                      <li onClick={() => { navigate('/profile'); setUserMenuOpen(false); }}>My Profile</li>
                      <li onClick={() => { navigate('/orders'); setUserMenuOpen(false); }}>My Orders</li>
                      <li onClick={handleLogout}>Logout</li>
                    </ul>
                  </>
                ) : (
                  <ul>
                    <li onClick={() => { navigate('/login'); setUserMenuOpen(false); }}>Login</li>
                    <li onClick={() => { navigate('/register'); setUserMenuOpen(false); }}>Register</li>
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* <FontAwesomeIcon 
            icon={faUser} 
            className={`${styles.userIcon} ${isContactPage ? styles.whiteIcon : ''}`} 
          /> */}
          <FontAwesomeIcon 
            className={`${styles.burgerIcon} ${menu ? styles.whiteIcon : ''}`} 
            onClick={toggleMenu} 
            icon={faBars} 
          />
        </div>

        {menu && (
          <div className={styles.dropdownMenu}>
            <ul className={styles.dropdownLinks}>
              {["/ourservice", "/reviews", "/press", "/collaboration", "/shop", "/contacts"].map((path, index) => {
                const label = path.slice(1).toUpperCase().replace(/_/g, ' ');
                return (
                  <li key={index}>
                    {path === "/press" ? (
                      <p><a href="https://thefashionvox.wordpress.com/2018/07/27/varona/" target="_blank" style={{textDecoration:'none', color:'white',}}>{label}</a></p>
                    ) : (
                      <p onClick={() => navigate(path)}>{label}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {menu && (
        <div className={styles.modalOverlay} onClick={() => openMenu(false)}>
          <div className={styles.modalContent} ref={navRef}>
            <ul>
              {["/ourservice", "/reviews", "/press", "/collaboration", "/shop", "/contacts"].map((path, index) => {
                const label = path.slice(1).toUpperCase().replace(/_/g, ' ');
                return (
                  <li key={index}>
                    {path === "/press" ? (
                      <p><a href="https://thefashionvox.wordpress.com/2018/07/27/varona/" target="_blank" style={{textDecoration:'none', color:'white',}}>{label}</a></p>
                    ) : (
                      <p onClick={() => { navigate(path); openMenu(false); }}>{label}</p>
                    )}
                  </li>
                );
              })}
            </ul>
            <button onClick={() => openMenu(false)} className={styles.closeButton}>Close</button>
          </div>
        </div>
      )}
    </Nav>
  );
};

export default Header;
