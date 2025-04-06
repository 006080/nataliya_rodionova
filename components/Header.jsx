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
import { useFavorites } from "../components/FavoriteContext"; // ✅ make sure this path is correct!

const Header = () => {
  const navigate = useNavigate();
  const [cartIsOpen, setCartIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { cartItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { favorites } = useFavorites(); // ✅ Added this line

  const [userData, setUserData] = useState({ name: '', email: '' });

  const navRef = useOutsideClick(() => setMenuOpen(false));
  const userMenuRef = useOutsideClick(() => setUserMenuOpen(false));

  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name || 'User',
        email: user.email || 'No email',
      });
    }
  }, [user]);

  const toggleCart = () => setCartIsOpen(!cartIsOpen);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
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
      <div className={`${styles.navigation} ${menuOpen ? styles.blackBackground : ''}`}>
        <div onClick={() => navigate("/")} className={styles.logo}>
          <img
            className={`${styles.logotype} ${menuOpen ? styles.whiteLogo : ''}`}
            src={logo}
            alt="Logo"
          />
        </div>

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

        <div className={styles.icons}>
          {/* Favorites Icon */}
          <div
            className={styles.cartIconContainer}
            onClick={() => navigate('/favorites')}
            style={{ cursor: 'pointer' }}
          >
            <FontAwesomeIcon className={styles.icon} icon={faHeart} />
            {favorites?.length > 0 && (
              <span className={styles.cartCount}>{favorites.length}</span>
            )}
          </div>

          {/* Cart Icon */}
          <div className={styles.cartIconContainer} onClick={toggleCart}>
            <FontAwesomeIcon className={styles.icon} icon={faCartShopping} />
            {cartItems.length > 0 && (
              <span className={styles.cartCount}>{cartItems.length}</span>
            )}
            {cartIsOpen && <CartSummary cartItems={cartItems} onClose={() => setCartIsOpen(false)} />}
          </div>

          {/* User Icon */}
          <div className={styles.userIconContainer}>
            <FontAwesomeIcon
              icon={isAuthenticated ? faUser : faSignInAlt}
              className={`${styles.icon} ${menuOpen ? styles.whiteIcon : ''}`}
              onClick={toggleUserMenu}
            />

            {/* User Dropdown */}
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

          {/* Burger Menu Icon */}
          <FontAwesomeIcon
            className={`${styles.burgerIcon} ${menuOpen ? styles.whiteIcon : ''}`}
            onClick={toggleMenu}
            icon={faBars}
          />
        </div>

        {/* Desktop Dropdown Menu */}
        {menuOpen && (
          <div className={styles.dropdownMenu}>
            <ul className={styles.dropdownLinks}>
              {navLinks.map(({ path, label, external, href }, index) => (
                <li key={index}>
                  {external ? (
                    <a href={href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'white' }}>{label}</a>
                  ) : (
                    <p onClick={() => navigate(path)}>{label}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Mobile Overlay Menu */}
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
    </Nav>
  );
};

export default Header;
