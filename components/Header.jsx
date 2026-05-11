import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "./Nav";
import logo from "../src/assets/Logo.webp";
import styles from "./Header.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import CartSummary from "./CartSummary";
import { useCart } from "./CartContext";
import { useAuth } from "../src/contexts/AuthContext";
import useOutsideClick from '../src/hooks/useOutsideClick';
import { useFavorites } from "../components/FavoriteContext";

const Header = () => {
  const navigate = useNavigate();

  // --- States ---
  const [cartIsOpen, setCartIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // --- Contexts ---
  const { cartItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { favorites } = useFavorites();

  // --- Outside Click Refs ---
  const searchRef = useOutsideClick(() => setIsSearchOpen(false));
  const userMenuRef = useOutsideClick(() => setUserMenuOpen(false));
  const navRef = useOutsideClick(() => setMenuOpen(false));

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Handlers ---
  const toggleCart = () => setCartIsOpen(!cartIsOpen);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    setMenuOpen(false);
    navigate('/login');
  };

  // --- Icons (Updated to match your screenshots: bag-style cart and heart) ---
  const HeartIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={favorites?.length > 0 ? "black" : "none"} stroke="black" strokeWidth="1.5">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );

  const CartIcon = (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );

  const UserIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={isAuthenticated ? "black" : "none"} stroke="black" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  const SearchIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  const navLinks = [
    { path: "/ourservice", label: "OUR SERVICE" },
    { path: "/collaboration", label: "COLLABORATION" },
    { path: "/about", label: "ABOUT" },
    { path: "/press", label: "PRESS", external: true, href: "https://thefashionvox.wordpress.com/2018/07/27/varona/" },
  ];

  return (
    <Nav>
      <header className={styles.navigation}>
        {/* Logo */}
        <div onClick={() => navigate("/")} className={styles.logo}>
          <img className={styles.logotype} src={logo} alt="VARONA" />
        </div>

        {/* Desktop Navigation */}
        {!isMobile && (
          <div className={styles.navbar}>
            <ul className={styles.navLinks}>
              {navLinks.map(({ path, label, external, href }, index) => (
                <li key={index}>
                  {external ? (
                    <a style={{textDecoration:'none', color: '#555'}} href={href} target="_blank" rel="noreferrer" className={styles.externalLink}>{label}</a>
                  ) : (
                    <p onClick={() => navigate(path)}>{label}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

    
        <div className={styles.icons}>
          {/* <div className={styles.searchWrapper} ref={searchRef}> */}
            {/* <form className={`${styles.searchForm} ${isSearchOpen ? styles.searchFormVisible : styles.searchFormHidden}`} onSubmit={handleSearchSubmit}>
              <input autoFocus type="text" placeholder="SEARCH..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={styles.searchInput} />
            </form> */}
            {/* <div className={styles.iconContainer} onClick={() => setIsSearchOpen(!isSearchOpen)}>
              {isSearchOpen ? <FontAwesomeIcon icon={faTimes} size="xs" /> : SearchIcon}
            </div> */}
          {/* </div> */}

          {!isMobile && (
            <>
              <div className={styles.iconContainer} onClick={() => navigate('/favorites')}>
                {HeartIcon}
                {favorites?.length > 0 && <span className={styles.badge}>{favorites.length}</span>}
              </div>
              <div className={styles.iconContainer} onClick={toggleCart}>
                {CartIcon}
                {cartItems?.length > 0 && <span className={styles.badge}>{cartItems.length}</span>}
              </div>
              <div className={styles.iconContainer} onClick={() => setUserMenuOpen(!userMenuOpen)}>
                {UserIcon}
              </div>
            </>
          )}

          {isMobile && (
            <div className={styles.iconContainer} onClick={toggleMenu}>
              <FontAwesomeIcon icon={faBars} className={styles.burgerIcon} />
            </div>
          )}
        </div>
      </header>

      {/* MOBILE BOTTOM STICKY BAR */}
      {/* {isMobile && (
        <div className={styles.bottomStickyBar}>
          <div className={styles.bottomTab} onClick={() => navigate('/favorites')}>
            <div className={styles.iconWrapper}>
              {HeartIcon}
              {favorites?.length > 0 && <span className={styles.badge}>{favorites.length}</span>}
            </div>
            <span className={styles.tabLabel}>Wishlist</span>
          </div>

          <div className={styles.bottomTab} onClick={toggleCart}>
            <div className={styles.iconWrapper}>
              {CartIcon}
              {cartItems?.length > 0 && <span className={styles.badge}>{cartItems.length}</span>}
            </div>
            <span className={styles.tabLabel}>Cart</span>
          </div>

          <div className={styles.bottomTab} onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}>
            <div className={styles.iconWrapper}>
              {UserIcon}
            </div>
            <span className={styles.tabLabel}>{isAuthenticated ? 'Account' : 'Login'}</span>
          </div>
        </div>
      )} */}

      {/* MOBILE MENU OVERLAY */}
      {isMobile && menuOpen && (
        <div className={styles.modalOverlay} onClick={() => setMenuOpen(false)}>
          <div className={styles.modalContent} ref={navRef} onClick={(e) => e.stopPropagation()}>
            <ul className={styles.mobileNavLinks}>
              {navLinks.map((l, i) => (
                <li key={i} onClick={() => { navigate(l.path); setMenuOpen(false); }}>
                  {l.label}
                </li>
              ))}
              {isAuthenticated && <li onClick={handleLogout}>LOGOUT</li>}
            </ul>
            <button className={styles.closeButton} onClick={() => setMenuOpen(false)}>CLOSE</button>
          </div>
        </div>
      )}

      {/* DESKTOP USER DROPDOWN */}
      {userMenuOpen && !isMobile && (
        <div className={styles.userMenu} ref={userMenuRef}>
          {isAuthenticated ? (
            <>
              <div className={styles.userInfo}>
                <p>HELLO, {user.name?.toUpperCase() || 'USER'}</p>
                <span>{user.email}</span>
              </div>
              <ul className={styles.userMenuList}>
                <li onClick={() => { navigate('/profile'); setUserMenuOpen(false); }}>MY PROFILE</li>
                <li onClick={handleLogout}>LOGOUT</li>
              </ul>
            </>
          ) : (
            <ul className={styles.userMenuList}>
              <li onClick={() => { navigate('/login'); setUserMenuOpen(false); }}>LOGIN</li>
              <li onClick={() => { navigate('/register'); setUserMenuOpen(false); }}>REGISTER</li>
            </ul>
          )}
        </div>
      )}

      {/* CART SUMMARY */}
      {cartIsOpen && (
        <CartSummary cartItems={cartItems} onClose={() => setCartIsOpen(false)} />
      )}
    </Nav>
  );
};

export default Header;
