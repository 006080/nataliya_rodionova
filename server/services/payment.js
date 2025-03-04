import { createPayPalOrder, capturePayPalOrder } from './paypal.js';
// import { createStripePayment, captureStripePayment } from './stripe.js';
// import { createMolliePayment, captureMolliePayment } from './mollie.js';
import Order from '../Models/Order.js';
import Product from '../Models/Product.js'; 


export const createPayment = async (cart, paymentProvider) => {
  try {
    await validateAndReserveProducts(cart);
    
    let paymentData;
    let paymentId;

    switch (paymentProvider) {
      case 'paypal':
        paymentData = await createPayPalOrder(cart);
        paymentId = paymentData.id;
        break;
      case 'stripe':
        // paymentData = await createStripePayment(cart);
        // paymentId = paymentData.id;
        throw new Error('Stripe payment not yet implemented');
      case 'mollie':
        // paymentData = await createMolliePayment(cart);
        // paymentId = paymentData.id;
        throw new Error('Mollie payment not yet implemented');
      default:
        throw new Error(`Unsupported payment provider: ${paymentProvider}`);
    }
    
    const orderItems = cart.map(item => ({
      productId: item.id,
      name: item.name,
      description: item.description || '',
      quantity: item.quantity,
      price: Number(item.price)
    }));
    
    const totalAmount = cart.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );
    
    const newOrder = new Order({
      paymentProvider,
      paymentId,
      status: 'PENDING',
      items: orderItems,
      totalAmount,
      currency: 'EUR',
      paymentDetails: paymentData,
      createdAt: new Date()
    });
    
    await newOrder.save();
    
    return {
      id: paymentId,
      orderId: newOrder._id,
      status: 'PENDING',
      provider: paymentProvider
    };
    
  } catch (error) {
    if (cart && Array.isArray(cart)) {
      await releaseProductHolds(cart);
    }
    throw error;
  }
};


export const capturePayment = async (paymentId, paymentProvider) => {
  try {
    const order = await Order.findOne({ 
      paymentId, 
      paymentProvider,
      status: { $in: ['PENDING', 'CREATED', 'APPROVED'] }
    });
    
    if (!order) {
      throw new Error(`No pending order found for payment ${paymentId}`);
    }
    
    let captureData;
    
    switch (paymentProvider) {
      case 'paypal':
        captureData = await capturePayPalOrder(paymentId);
        break;
      case 'stripe':
        // captureData = await captureStripePayment(paymentId);
        throw new Error('Stripe payment not yet implemented');
      case 'mollie':
        // captureData = await captureMolliePayment(paymentId);
        throw new Error('Mollie payment not yet implemented');
      default:
        throw new Error(`Unsupported payment provider: ${paymentProvider}`);
    }
    
    const isSuccessful = 
      (paymentProvider === 'paypal' && captureData.status === 'COMPLETED') ||
      (paymentProvider === 'stripe' && captureData.status === 'succeeded') ||
      (paymentProvider === 'mollie' && captureData.status === 'paid');
    
    if (isSuccessful) {
      // Permanently mark products as sold
      await finalizeProductSale(order.items);
      
      order.status = 'COMPLETED';
      order.paymentDetails = captureData;
      order.updatedAt = new Date();
      
      // Add customer info (structure varies by provider)
      if (paymentProvider === 'paypal' && captureData.payer) {
        order.customer = {
          name: `${captureData.payer.name.given_name} ${captureData.payer.name.surname}`,
          email: captureData.payer.email_address,
          paymentProviderId: captureData.payer.payer_id
        };
      }
      
      await order.save();
    } else {
      order.status = 'FAILED';
      order.paymentDetails = captureData;
      order.updatedAt = new Date();
      await order.save();
      
      await releaseProductHolds(order.items.map(item => ({
        id: item.productId,
        quantity: item.quantity
      })));
    }
    
    return {
      ...captureData,
      orderId: order._id
    };
    
  } catch (error) {
    const order = await Order.findOne({ paymentId, paymentProvider });
    if (order) {
      await releaseProductHolds(order.items.map(item => ({
        id: item.productId,
        quantity: item.quantity
      })));
      
      order.status = 'FAILED';
      order.errorMessage = error.message;
      order.updatedAt = new Date();
      await order.save();
    }
    throw error;
  }
};


// Check inventory and reserve products

async function validateAndReserveProducts(cart) {
  for (const item of cart) {
    const product = await Product.findById(item.id);
    
    if (!product) {
      throw new Error(`Product not found: ${item.id}`);
    }
    
    if (product.status === 'SOLD') {
      throw new Error(`Product already sold: ${item.id}`);
    }
    
    if (product.status === 'RESERVED') {
      // Check if reservation is expired 
      const reservationTime = new Date(product.reservedAt).getTime();
      const currentTime = new Date().getTime();
      const reservationExpiryMs = 30 * 60 * 1000; // 30 minutes
      
      if (currentTime - reservationTime < reservationExpiryMs) {
        throw new Error(`Product is currently reserved: ${item.id}`);
      } else {
        console.log(`Overriding expired reservation for product: ${item.id}`);
      }
    }
    
    product.status = 'RESERVED';
    product.reservedAt = new Date();
    await product.save();
  }
}

async function releaseProductHolds(cart) {
  for (const item of cart) {
    const product = await Product.findById(item.id);
    
    if (product && product.status === 'RESERVED') {
      product.status = 'AVAILABLE';
      product.reservedAt = null;
      await product.save();
    }
  }
}


async function finalizeProductSale(items) {
  for (const item of items) {
    const product = await Product.findById(item.productId);
    
    if (product) {
      product.status = 'SOLD';
      product.soldAt = new Date();
      await product.save();
    }
  }
}