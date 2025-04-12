// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Nav from "./Nav";
// import logo from "../src/assets/Logo.webp";
// import styles from "./Header.module.css";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faBars, faUser, faCartShopping, faSignInAlt, faHeart } from "@fortawesome/free-solid-svg-icons";
// import CartSummary from "./CartSummary";
// import { useCart } from "./CartContext";
// import { useAuth } from "../src/contexts/AuthContext";
// import useOutsideClick from '../src/hooks/useOutsideClick';
// import { useFavorites } from "../components/FavoriteContext";

// const Header = () => {
//   const navigate = useNavigate();

//   const [cartIsOpen, setCartIsOpen] = useState(false);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [userMenuOpen, setUserMenuOpen] = useState(false);
//   const [userData, setUserData] = useState({ name: '', email: '' });
//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

//   const { cartItems } = useCart();
//   const { user, isAuthenticated, logout } = useAuth();
//   const { favorites } = useFavorites();

//   const navRef = useOutsideClick(() => setMenuOpen(false));
//   const userMenuRef = useOutsideClick(() => setUserMenuOpen(false));

//   useEffect(() => {
//     if (user) {
//       setUserData({
//         name: user.name || 'User',
//         email: user.email || 'No email',
//       });
//     }
//   }, [user]);

//   useEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth <= 768);
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   const toggleCart = () => setCartIsOpen(!cartIsOpen);
//   const toggleMenu = () => setMenuOpen(!menuOpen);
//   const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);

//   const handleLogout = async () => {
//     await logout();
//     setUserMenuOpen(false);
//     navigate('/login');
//   };

//   const navLinks = [
//     { path: "/ourservice", label: "OUR SERVICE" },
//     { path: "/reviews", label: "REVIEWS" },
//     { path: "/press", label: "PRESS", external: true, href: "https://thefashionvox.wordpress.com/2018/07/27/varona/" },
//     { path: "/collaboration", label: "COLLABORATION" },
//     { path: "/shop", label: "SHOP" },
//     { path: "/contacts", label: "CONTACTS" }
//   ];

//   return (
//     <Nav>
//       {/* ===== TOP NAV BAR ===== */}
//       <div className={`${styles.navigation} ${menuOpen ? styles.blackBackground : ''}`}>
//         {/* Logo */}
//         <div onClick={() => navigate("/")} className={styles.logo}>
//           <img
//             className={`${styles.logotype} ${menuOpen ? styles.whiteLogo : ''}`}
//             src={logo}
//             alt="Logo"
//           />
//         </div>

//         {/* CENTER LINKS (desktop only) */}
//         <div className={styles.navbar}>
//           <ul className={styles.navLinks}>
//             {navLinks.map(({ path, label, external, href }, index) => (
//               <li key={index}>
//                 {external ? (
//                   <a href={href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#555' }}>{label}</a>
//                 ) : (
//                   <p onClick={() => navigate(path)}>{label}</p>
//                 )}
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* ICONS GROUP (desktop only) */}
//         {!isMobile && (
//           <div className={styles.icons}>
//             <div className={styles.iconContainer} onClick={() => navigate('/favorites')}>
//               <FontAwesomeIcon icon={faHeart} />
//               {favorites.length > 0 && <span className={styles.badge}>{favorites.length}</span>}
//             </div>

//             <div className={styles.iconContainer} onClick={toggleCart}>
//               <FontAwesomeIcon icon={faCartShopping} />
//               {cartItems.length > 0 && <span className={styles.badge}>{cartItems.length}</span>}
//             </div>

//             <div className={styles.iconContainer} onClick={toggleUserMenu}>
//               <FontAwesomeIcon icon={isAuthenticated ? faUser : faSignInAlt} />
//             </div>
//           </div>
//         )}

//         {/* BURGER ICON ONLY (mobile) */}
//         {isMobile && (
//           <FontAwesomeIcon
//             className={`${styles.burgerIcon} ${menuOpen ? styles.whiteIcon : ''}`}
//             onClick={toggleMenu}
//             icon={faBars}
//           />
//         )}
//       </div>

//       {/* ===== OVERLAY NAV MENU ===== */}
//       {menuOpen && (
//         <div className={styles.modalOverlay} onClick={() => setMenuOpen(false)}>
//           <div className={styles.modalContent} ref={navRef}>
//             <ul>
//               {navLinks.map(({ path, label, external, href }, index) => (
//                 <li key={index}>
//                   {external ? (
//                     <a href={href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'white' }}>{label}</a>
//                   ) : (
//                     <p onClick={() => { navigate(path); setMenuOpen(false); }}>{label}</p>
//                   )}
//                 </li>
//               ))}
//             </ul>
//             <button onClick={() => setMenuOpen(false)} className={styles.closeButton}>Close</button>
//           </div>
//         </div>
//       )}

//       {/* ===== MOBILE BOTTOM NAVBAR ===== */}
//       {isMobile && (
//         <div className={styles.mobileNav}>
//           <div className={styles.mobileNavIcon} onClick={() => navigate('/favorites')}>
//             <div className={styles.iconContainer}>
//               <FontAwesomeIcon icon={faHeart} />
//               {favorites.length > 0 && <span className={styles.badge}>{favorites.length}</span>}
//             </div>
//             <span>Wishlist</span>
//           </div>

//           <div className={styles.mobileNavIcon} onClick={toggleCart}>
//             <div className={styles.iconContainer}>
//               <FontAwesomeIcon icon={faCartShopping} />
//               {cartItems.length > 0 && <span className={styles.badge}>{cartItems.length}</span>}
//             </div>
//             <span>Cart</span>
//           </div>

//           <div className={styles.mobileNavIcon} onClick={toggleUserMenu}>
//             <div className={styles.iconContainer}>
//               <FontAwesomeIcon icon={isAuthenticated ? faUser : faSignInAlt} />
//             </div>
//             <span>{isAuthenticated ? 'Account' : 'Login'}</span>
//           </div>
//         </div>
//       )}

//       {/* User Dropdown */}
//       {userMenuOpen && (
//         <div className={styles.userMenu} ref={userMenuRef}>
//           {isAuthenticated ? (
//             <>
//               <div className={styles.userInfo}>
//                 <p>Hello, {userData.name}</p>
//                 <span>{userData.email}</span>
//               </div>
//               <ul>
//                 <li onClick={() => { navigate('/profile'); setUserMenuOpen(false); }}>My Profile</li>
//                 <li onClick={() => { navigate('/orders'); setUserMenuOpen(false); }}>My Orders</li>
//                 <li onClick={handleLogout}>Logout</li>
//               </ul>
//             </>
//           ) : (
//             <ul>
//               <li onClick={() => { navigate('/login'); setUserMenuOpen(false); }}>Login</li>
//               <li onClick={() => { navigate('/register'); setUserMenuOpen(false); }}>Register</li>
//             </ul>
//           )}
//         </div>
//       )}

//       {/* Cart Summary */}
//       {cartIsOpen && (
//         <CartSummary cartItems={cartItems} onClose={() => setCartIsOpen(false)} />
//       )}
//     </Nav>
//   );
// };

// export default Header;




import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "./Nav";
import logo from "../src/assets/Logo.webp";
import styles from "./Header.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faUser, faCartShopping, faSignInAlt, faHeart } from "@fortawesome/free-solid-svg-icons";
import CartSummary from "./CartSummary";
import { useCart } from "./CartContext";
import { useAuth } from "../src/contexts/AuthContext";
import useOutsideClick from '../src/hooks/useOutsideClick';
import { useFavorites } from "../components/FavoriteContext";

const Header = () => {
  const navigate = useNavigate();

  const [cartIsOpen, setCartIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false);
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const { cartItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { favorites } = useFavorites();

  const navRef = useOutsideClick(() => setMenuOpen(false));
  const userMenuRef = useOutsideClick(() => setUserMenuOpen(false));
  const mobileUserMenuRef = useOutsideClick(() => setMobileUserMenuOpen(false));

  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name || 'User',
        email: user.email || 'No email',
      });
    }
  }, [user]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCart = () => setCartIsOpen(!cartIsOpen);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  
  const handleUserIconClick = () => {
    if (isMobile) {
      setMobileUserMenuOpen(true);
    } else {
      setUserMenuOpen(!userMenuOpen);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    setMobileUserMenuOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { path: "/ourservice", label: "OUR SERVICE" },
    { path: "/reviews", label: "REVIEWS" },
    { path: "/press", label: "PRESS", external: true, href: "https://thefashionvox.wordpress.com/2018/07/27/varona/" },
    { path: "/collaboration", label: "COLLABORATION" },
    { path: "/shop", label: "SHOP" },
    { path: "/contacts", label: "CONTACTS" }
  ];

  return (
    <Nav>
      {/* ===== TOP NAV BAR ===== */}
      <div className={`${styles.navigation} ${menuOpen || mobileUserMenuOpen ? styles.blackBackground : ''}`}>
        {/* Logo */}
        <div onClick={() => navigate("/")} className={styles.logo}>
          <img
            className={`${styles.logotype} ${menuOpen || mobileUserMenuOpen ? styles.whiteLogo : ''}`}
            src={logo}
            alt="Logo"
          />
        </div>

        {/* CENTER LINKS (desktop only) */}
        <div className={styles.navbar}>
          <ul className={styles.navLinks}>
            {navLinks.map(({ path, label, external, href }, index) => (
              <li key={index}>
                {external ? (
                  <a href={href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#555' }}>{label}</a>
                ) : (
                  <p onClick={() => navigate(path)}>{label}</p>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* ICONS GROUP (desktop only) */}
        {!isMobile && (
          <div className={styles.icons}>
            <div className={styles.iconContainer} onClick={() => navigate('/favorites')}>
              <FontAwesomeIcon icon={faHeart} />
              {favorites.length > 0 && <span className={styles.badge}>{favorites.length}</span>}
            </div>

            <div className={styles.iconContainer} onClick={toggleCart}>
              <FontAwesomeIcon icon={faCartShopping} />
              {cartItems.length > 0 && <span className={styles.badge}>{cartItems.length}</span>}
            </div>

            <div className={styles.iconContainer} onClick={handleUserIconClick}>
              <FontAwesomeIcon icon={isAuthenticated ? faUser : faSignInAlt} />
            </div>
          </div>
        )}

        {/* BURGER ICON ONLY (mobile) */}
        {isMobile && (
          <FontAwesomeIcon
            className={`${styles.burgerIcon} ${menuOpen || mobileUserMenuOpen ? styles.whiteIcon : ''}`}
            onClick={toggleMenu}
            icon={faBars}
          />
        )}
      </div>

      {/* ===== BURGER MENU OVERLAY ===== */}
      {menuOpen && (
        <div className={styles.modalOverlay} onClick={() => setMenuOpen(false)}>
          <div className={styles.modalContent} ref={navRef}>
            <ul>
              {navLinks.map(({ path, label, external, href }, index) => (
                <li key={index}>
                  {external ? (
                    <a href={href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'white' }}>{label}</a>
                  ) : (
                    <p onClick={() => { navigate(path); setMenuOpen(false); }}>{label}</p>
                  )}
                </li>
              ))}
            </ul>
            <button onClick={() => setMenuOpen(false)} className={styles.closeButton}>Close</button>
          </div>
        </div>
      )}

      {/* ===== MOBILE USER MENU OVERLAY ===== */}
      {mobileUserMenuOpen && (
        <div className={styles.modalOverlay} onClick={() => setMobileUserMenuOpen(false)}>
          <div className={styles.modalContent} ref={mobileUserMenuRef}>
            {isAuthenticated ? (
              <>
                <div className={styles.userInfoOverlay}>
                  <p>Hello, {userData.name}</p>
                  <span>{userData.email}</span>
                </div>
                <ul>
                  <li onClick={() => { navigate('/profile'); setMobileUserMenuOpen(false); }}>MY PROFILE</li>
                  <li onClick={() => { navigate('/orders'); setMobileUserMenuOpen(false); }}>MY ORDERS</li>
                  <li onClick={() => { navigate('/favorites'); setMobileUserMenuOpen(false); }}>MY WISHLIST</li>
                  <li onClick={handleLogout}>LOGOUT</li>
                </ul>
              </>
            ) : (
              <ul>
                <li onClick={() => { navigate('/login'); setMobileUserMenuOpen(false); }}>LOGIN</li>
                <li onClick={() => { navigate('/register'); setMobileUserMenuOpen(false); }}>REGISTER</li>
              </ul>
            )}
            <button onClick={() => setMobileUserMenuOpen(false)} className={styles.closeButton}>Close</button>
          </div>
        </div>
      )}

      {/* ===== MOBILE BOTTOM NAVBAR ===== */}
      {isMobile && (
        <div className={styles.mobileNav}>
          <div className={styles.mobileNavIcon} onClick={() => navigate('/favorites')}>
            <div className={styles.iconContainer}>
              <FontAwesomeIcon icon={faHeart} />
              {favorites.length > 0 && <span className={styles.badge}>{favorites.length}</span>}
            </div>
            <span>Wishlist</span>
          </div>

          <div className={styles.mobileNavIcon} onClick={toggleCart}>
            <div className={styles.iconContainer}>
              <FontAwesomeIcon icon={faCartShopping} />
              {cartItems.length > 0 && <span className={styles.badge}>{cartItems.length}</span>}
            </div>
            <span>Cart</span>
          </div>

          <div className={styles.mobileNavIcon} onClick={handleUserIconClick}>
            <div className={styles.iconContainer}>
              <FontAwesomeIcon icon={isAuthenticated ? faUser : faSignInAlt} />
            </div>
            <span>{isAuthenticated ? 'Account' : 'Login'}</span>
          </div>
        </div>
      )}

      {/* User Dropdown (desktop only) */}
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

      {/* Cart Summary */}
      {cartIsOpen && (
        <CartSummary cartItems={cartItems} onClose={() => setCartIsOpen(false)} />
      )}
    </Nav>
  );
};

export default Header;
