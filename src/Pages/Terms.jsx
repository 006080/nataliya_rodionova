
import './Terms.css'; // You can create a separate CSS file for styling

const Terms = () => {
  return (
    <div className="terms-container">
      <h3 className="terms-heading">Terms and Conditions with Shipping Time and Price:</h3> 

      <section className="terms-section">
        <h4 className="section-heading">Production Time</h4>
        <p className="section-text">
          All items are hand-knitted with great care, and production times will vary based on the complexity of the item. Please allow <strong>X to Y</strong> days for us to knit and prepare your order. Some items may take longer during high-demand periods.
        </p>
      </section>

      <section className="terms-section">
        <h4 className="section-heading">Shipping</h4>
        <p className="section-text">
          We ship worldwide using trusted couriers (DHL, FedEx, USPS, etc.). Once your order is complete, it will be shipped within <strong>1-3 business days</strong> for domestic orders or <strong>3-5 business days</strong> for international orders. Delivery times will vary depending on your location, but typical shipping times are as follows:
        </p>
        <ul className="shipping-list">
          <li><strong>Domestic:</strong> 3-7 business days</li>
          <li><strong>North America:</strong> 7-14 business days</li>
          <li><strong>Europe:</strong> 5-10 business days</li>
          <li><strong>Asia/Australia:</strong> 10-20 business days</li>
        </ul>
        <p className="section-text">
          Shipping costs are calculated at checkout based on your order's weight and destination.
        </p>
      </section>

      <section className="terms-section">
        <h4 className="section-heading">Shipping Costs</h4>
        <p className="section-text">
          Shipping costs are based on the size, weight, and destination of your order. Customers will be notified of the shipping price before completing checkout. We offer various shipping methods, including standard and express options. Estimated shipping prices range from <strong>$X</strong> for standard shipping to <strong>$Y</strong> for express shipping.
        </p>
      </section>
    </div>
  );
};

export default Terms;
