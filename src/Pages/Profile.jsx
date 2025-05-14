
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { authFetch } from '../services/authService'
import DeleteAccountModule from '../../components/DeleteAccountModule'
import WelcomeBackNotification from '../../components/WelcomeBackNotification'
import styles from './Profile.module.css'

const Profile = () => {
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [showRestorationNotice, setShowRestorationNotice] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const getApiUrl = () => {
    return import.meta.env.VITE_NODE_ENV === 'production'
      ? import.meta.env.VITE_API_BASE_URL_PROD
      : import.meta.env.VITE_API_BASE_URL_LOCAL
  }

  useEffect(() => {
    console.log('Profile component mounted');
    
    // 1. Check for window-level flag (new method)
    const windowFlagRestoration = !!window.accountWasJustRestored;
    
    // 2. Check for location state coming from welcome-back page
    const locationStateRestoration = location.state?.fromWelcomeBack === true;
    
    // 3. Check document referrer (existing method)
    const referrerRestoration = document.referrer && document.referrer.includes('/welcome-back');
    
    // 4. Legacy storage method (as fallback)
    const storageFlagRestoration = 
      sessionStorage.getItem('accountRestored') === 'true' || 
      localStorage.getItem('accountRestored') === 'true';
    
    // Combine all methods
    const wasRestored = windowFlagRestoration || locationStateRestoration || 
                        referrerRestoration || storageFlagRestoration;
    
    console.log('Account restoration detection:', {
      windowFlag: windowFlagRestoration,
      locationState: locationStateRestoration,
      referrer: referrerRestoration,
      storageFlag: storageFlagRestoration,
      combined: wasRestored
    });
    
    if (wasRestored) {
      console.log('Showing restoration notice');
      setShowRestorationNotice(true);
      
      // Clear all restoration flags
      window.accountWasJustRestored = false;
      sessionStorage.removeItem('accountRestored');
      localStorage.removeItem('accountRestored');
      
      // Clear location state if needed
      if (location.state?.fromWelcomeBack) {
        window.history.replaceState({}, document.title);
      }
    }
    
    // Fetch real user orders from the server
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await authFetch(`${getApiUrl()}/api/orders`)

        if (!response.ok) {
          throw new Error('Failed to fetch orders')
        }

        const data = await response.json()
        setOrders(data)
      } catch (error) {
        console.error('Error fetching orders:', error)
        setError('Unable to fetch your orders. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchOrders()
    }
  }, [user, location])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Get status badge class based on order status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered':
        return styles.badgeSuccess
      case 'Shipped':
        return styles.badgeInfo
      case 'Processing':
        return styles.badgeWarning
      case 'Confirmed':
        return styles.badgePrimary
      case 'Cancelled':
        return styles.badgeDanger
      case 'Payment Pending':
        return styles.badgeSecondary
      default:
        return styles.badgeSecondary
    }
  }

  if (!user) {
    return (
      <div className={styles.loadingContainer}>Loading user information...</div>
    )
  }

  return (
    <div className={styles.container}>
      {showRestorationNotice && (
        <WelcomeBackNotification onClose={() => setShowRestorationNotice(false)} />
      )}
      
      <h1 className={styles.pageTitle}>Your Profile</h1>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Account Information</h2>
        <div className={styles.profileGrid}>
          <div>
            <p className={styles.profileLabel}>Name:</p>
            <p className={styles.profileLabel}>Email:</p>
            <p className={styles.profileLabel}>Role:</p>
          </div>
          <div>
            <p className={styles.profileValue}>{user.name || 'Not provided'}</p>
            <p className={styles.profileValue}>
              {user.email || 'Not provided'}
            </p>
            <p className={styles.profileValue}>{user.role || 'Customer'}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className={`${styles.button} ${styles.buttonDanger} ${styles.buttonMarginTop}`}
        >
          Logout
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.cardTitle}>Recent Orders</h2>
          <button
            onClick={() => navigate('/orders')}
            className={`${styles.button} ${styles.buttonPrimary}`}
          >
            View All Orders
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {loading ? (
          <div className={styles.loadingContainer}>
            <p>Loading your orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id}>
                    <td data-label="Order ID">{order.id.substring(0, 8)}...</td>
                    <td data-label="Date">{order.date}</td>
                    <td data-label="Status">
                      <span
                        className={`${styles.badge} ${getStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td data-label="Total">${order.total.toFixed(2)}</td>
                    <td data-label="Actions">
                      <button
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>You haven&apos;t placed any orders yet.</p>
            <button
              onClick={() => navigate('/shop')}
              className={`${styles.button} ${styles.buttonSuccess} ${styles.buttonMarginTop}`}
            >
              Browse Products
            </button>
          </div>
        )}
      </div>
      
      <DeleteAccountModule />
    </div>
  )
}

export default Profile