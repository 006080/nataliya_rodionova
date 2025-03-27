import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "./Nav";
import logo from "../src/assets/Logo.webp";
import styles from "./Header.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faUser, faCartShopping } from "@fortawesome/free-solid-svg-icons";
import CartSummary from "./CartSummary";
import { useCart } from "./CartContext";
import useOutsideClick from '../src/hooks/useOutsideClick';

const Header = () => {
  const navigate = useNavigate();
  const [cartIsOpen, setCartIsOpen] = useState(false);
  const [menu, openMenu] = useState(false);
  const { cartItems } = useCart();

  const navRef = useOutsideClick(() => openMenu(false))

  const handleCartClick = () => {
    setCartIsOpen(!cartIsOpen);
  };

  const toggleMenu = () => {
    openMenu(!menu);
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
