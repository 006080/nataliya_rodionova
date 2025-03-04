export const validatePaymentRequest = (req, res, next) => {
  // Validate total amount to prevent tampering
  if (req.body.cart && Array.isArray(req.body.cart)) {
    const calculatedTotal = req.body.cart.reduce(
      (sum, item) => sum + (Number(item.price) * Number(item.quantity)), 
      0
    );
    
    // If client sends a total, verify it
    if (req.body.total && Math.abs(calculatedTotal - Number(req.body.total)) > 0.01) {
      return res.status(400).json({ 
        error: "Total amount verification failed" 
      });
    }
    
    // Add calculated total to request for use in controllers
    req.calculatedTotal = calculatedTotal;
  }
  
  // Validate payment method
  if (req.body.paymentMethod) {
    const validMethods = ['paypal', 'stripe', 'mollie'];
    if (!validMethods.includes(req.body.paymentMethod)) {
      return res.status(400).json({ 
        error: "Invalid payment method" 
      });
    }
  }
  
  next();
};