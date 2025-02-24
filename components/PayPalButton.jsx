import { useEffect } from 'react';

const PayPalButton = ({ amount, onSuccess }) => {
  useEffect(() => {
    // Make sure the PayPal script is loaded
    if (window.paypal) {
      window.paypal.Buttons({
        createOrder(data, actions) {
          // This function is called when the PayPal button is clicked
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount, // Set the payment amount
                },
              },
            ],
          });
        },

        onApprove(data, actions) {
          // This function is called after the payment is approved by the user
          return actions.order.capture().then((details) => {
            console.log('Payment Success:', details);
            onSuccess(details); // You can handle the success here
          });
        },

        onError(err) {
          console.error('PayPal Error:', err);
        },
      }).render('#paypal-button-container'); // Render the PayPal button into the container
    }
  }, [amount, onSuccess]);

  return <div id="paypal-button-container"></div>;
};

export default PayPalButton;
