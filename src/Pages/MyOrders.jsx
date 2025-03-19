// // src/Pages/MyOrders.js
// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import { authFetch } from '../services/authService';

// const MyOrders = () => {
//   const { user } = useAuth();
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [filter, setFilter] = useState('all');
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         setLoading(true);
//         setError('');
        
//         const response = await authFetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/api/orders`);
        
//         if (!response.ok) {
//           throw new Error('Failed to fetch orders');
//         }
        
//         const data = await response.json();
//         setOrders(data);
//       } catch (error) {
//         console.error('Error fetching orders:', error);
//         setError('Unable to fetch your orders. Please try again later.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (user?.id) {
//       fetchOrders();
//     }
//   }, [user]);

//   // Filter orders based on selected filter
//   const filteredOrders = () => {
//     if (filter === 'all') return orders;
    
//     return orders.filter(order => {
//       switch (filter) {
//         case 'processing':
//           return order.status === 'Processing' || order.status === 'Confirmed';
//         case 'shipped':
//           return order.status === 'Shipped';
//         case 'delivered':
//           return order.status === 'Delivered';
//         case 'cancelled':
//           return order.status === 'Cancelled';
//         default:
//           return true;
//       }
//     });
//   };

//   // Get color based on order status
//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'Delivered':
//         return '#28a745'; // Green
//       case 'Shipped':
//         return '#17a2b8'; // Teal
//       case 'Processing':
//         return '#ffc107'; // Yellow
//       case 'Confirmed':
//         return '#007bff'; // Blue
//       case 'Cancelled':
//         return '#dc3545'; // Red
//       default:
//         return '#6c757d'; // Gray
//     }
//   };

//   const getStatusTextColor = (status) => {
//     return ['Delivered', 'Shipped', 'Confirmed'].includes(status) ? 'white' : 'black';
//   };

//   if (!user) {
//     return <div className="loading-container">Please log in to view your orders</div>;
//   }

//   return (
//     <div className="my-orders-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
//       <h1>My Orders</h1>
      
//       <div className="filter-section" style={{ 
//         display: 'flex', 
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: '1.5rem',
//         flexWrap: 'wrap',
//         gap: '1rem'
//       }}>
//         <div>
//           <label htmlFor="filter-status" style={{ marginRight: '0.5rem' }}>Filter by Status:</label>
//           <select 
//             id="filter-status"
//             value={filter}
//             onChange={(e) => setFilter(e.target.value)}
//             style={{ 
//               padding: '0.5rem',
//               borderRadius: '4px',
//               border: '1px solid #ddd'
//             }}
//           >
//             <option value="all">All Orders</option>
//             <option value="processing">Processing & Confirmed</option>
//             <option value="shipped">Shipped</option>
//             <option value="delivered">Delivered</option>
//             <option value="cancelled">Cancelled</option>
//           </select>
//         </div>
        
//         <button 
//           onClick={() => navigate('/shop')}
//           style={{ 
//             backgroundColor: '#28a745', 
//             color: 'white', 
//             border: 'none', 
//             borderRadius: '4px', 
//             padding: '0.5rem 1rem',
//             cursor: 'pointer' 
//           }}
//         >
//           Continue Shopping
//         </button>
//       </div>
      
//       {error && (
//         <div style={{ 
//           backgroundColor: '#f8d7da', 
//           color: '#721c24', 
//           padding: '0.75rem', 
//           borderRadius: '4px', 
//           marginBottom: '1.5rem' 
//         }}>
//           {error}
//         </div>
//       )}
      
//       <div className="orders-list" style={{ 
//         backgroundColor: '#f9f9f9',
//         borderRadius: '8px',
//         boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
//       }}>
//         {loading ? (
//           <div style={{ textAlign: 'center', padding: '3rem' }}>
//             <p>Loading your orders...</p>
//           </div>
//         ) : filteredOrders().length > 0 ? (
//           <div style={{ overflowX: 'auto' }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//               <thead>
//                 <tr style={{ 
//                   backgroundColor: '#f2f2f2',
//                   borderBottom: '2px solid #ddd'
//                 }}>
//                   <th style={{ textAlign: 'left', padding: '1rem', borderTopLeftRadius: '8px' }}>Order ID</th>
//                   <th style={{ textAlign: 'left', padding: '1rem' }}>Date</th>
//                   <th style={{ textAlign: 'left', padding: '1rem' }}>Status</th>
//                   <th style={{ textAlign: 'right', padding: '1rem' }}>Total</th>
//                   <th style={{ textAlign: 'center', padding: '1rem', borderTopRightRadius: '8px' }}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredOrders().map(order => (
//                   <tr key={order.id} style={{ borderBottom: '1px solid #ddd' }}>
//                     <td style={{ padding: '1rem' }}>{order.id.substring(0, 8)}...</td>
//                     <td style={{ padding: '1rem' }}>{order.date}</td>
//                     <td style={{ padding: '1rem' }}>
//                       <span style={{ 
//                         backgroundColor: getStatusColor(order.status),
//                         color: getStatusTextColor(order.status),
//                         padding: '0.25rem 0.5rem',
//                         borderRadius: '4px',
//                         fontSize: '0.875rem'
//                       }}>
//                         {order.status}
//                       </span>
//                     </td>
//                     <td style={{ textAlign: 'right', padding: '1rem' }}>${order.total.toFixed(2)}</td>
//                     <td style={{ textAlign: 'center', padding: '1rem' }}>
//                       <button 
//                         onClick={() => navigate(`/orders/${order.id}`)}
//                         style={{ 
//                           backgroundColor: '#007bff', 
//                           color: 'white', 
//                           border: 'none', 
//                           borderRadius: '4px', 
//                           padding: '0.5rem 1rem',
//                           cursor: 'pointer'
//                         }}
//                       >
//                         View Details
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <div style={{ textAlign: 'center', padding: '3rem' }}>
//             <p>No orders found matching the selected filter.</p>
//             {filter !== 'all' && (
//               <button 
//                 onClick={() => setFilter('all')}
//                 style={{ 
//                   backgroundColor: '#6c757d', 
//                   color: 'white', 
//                   border: 'none', 
//                   borderRadius: '4px', 
//                   padding: '0.5rem 1rem', 
//                   marginTop: '1rem',
//                   cursor: 'pointer' 
//                 }}
//               >
//                 Show All Orders
//               </button>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MyOrders;



// src/Pages/MyOrders.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authFetch } from '../services/authService';

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const getApiUrl = () => {
    return import.meta.env.VITE_NODE_ENV === "production"
      ? import.meta.env.VITE_API_BASE_URL_PROD
      : import.meta.env.VITE_API_BASE_URL_LOCAL;
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await authFetch(`${getApiUrl()}/api/orders`);
             
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Unable to fetch your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchOrders();
    }
  }, [user]);

  // Filter orders based on selected filter
  const filteredOrders = () => {
    if (filter === 'all') return orders;
    
    return orders.filter(order => {
      switch (filter) {
        case 'processing':
          return order.status === 'Processing' || order.status === 'Confirmed';
        case 'shipped':
          return order.status === 'Shipped';
        case 'delivered':
          return order.status === 'Delivered';
        case 'cancelled':
          return order.status === 'Cancelled';
        case 'pending':
          return order.status === 'Payment Pending';
        default:
          return true;
      }
    });
  };

  // Get color based on order status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return '#28a745'; // Green
      case 'Shipped':
        return '#17a2b8'; // Teal
      case 'Processing':
        return '#ffc107'; // Yellow
      case 'Confirmed':
        return '#007bff'; // Blue
      case 'Cancelled':
        return '#dc3545'; // Red
      case 'Payment Pending':
        return '#6c757d'; // Gray
      default:
        return '#6c757d'; // Gray
    }
  };

  const getStatusTextColor = (status) => {
    return ['Delivered', 'Shipped', 'Confirmed'].includes(status) ? 'white' : 'black';
  };

  if (!user) {
    return <div className="loading-container">Please log in to view your orders</div>;
  }

  return (
    <div className="my-orders-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1>My Orders</h1>
      
      <div className="filter-section" style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <label htmlFor="filter-status" style={{ marginRight: '0.5rem' }}>Filter by Status:</label>
          <select 
            id="filter-status"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ 
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            <option value="all">All Orders</option>
            <option value="pending">Payment Pending</option>
            <option value="processing">Processing & Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <button 
          onClick={() => navigate('/shop')}
          style={{ 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            padding: '0.5rem 1rem',
            cursor: 'pointer' 
          }}
        >
          Continue Shopping
        </button>
      </div>
      
      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '0.75rem', 
          borderRadius: '4px', 
          marginBottom: '1.5rem' 
        }}>
          {error}
        </div>
      )}
      
      <div className="orders-list" style={{ 
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Loading your orders...</p>
          </div>
        ) : filteredOrders().length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ 
                  backgroundColor: '#f2f2f2',
                  borderBottom: '2px solid #ddd'
                }}>
                  <th style={{ textAlign: 'left', padding: '1rem', borderTopLeftRadius: '8px' }}>Order ID</th>
                  <th style={{ textAlign: 'left', padding: '1rem' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '1rem' }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '1rem' }}>Total</th>
                  <th style={{ textAlign: 'center', padding: '1rem', borderTopRightRadius: '8px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders().map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '1rem' }}>{order.id.substring(0, 8)}...</td>
                    <td style={{ padding: '1rem' }}>{order.date}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        backgroundColor: getStatusColor(order.status),
                        color: getStatusTextColor(order.status),
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.875rem'
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', padding: '1rem' }}>${order.total.toFixed(2)}</td>
                    <td style={{ textAlign: 'center', padding: '1rem' }}>
                      <button 
                        onClick={() => navigate(`/orders/${order.id}`)}
                        style={{ 
                          backgroundColor: '#007bff', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px', 
                          padding: '0.5rem 1rem',
                          cursor: 'pointer'
                        }}
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
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>No orders found matching the selected filter.</p>
            {filter !== 'all' && (
              <button 
                onClick={() => setFilter('all')}
                style={{ 
                  backgroundColor: '#6c757d', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  padding: '0.5rem 1rem', 
                  marginTop: '1rem',
                  cursor: 'pointer' 
                }}
              >
                Show All Orders
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;