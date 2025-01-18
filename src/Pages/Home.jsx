import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import styles from "./Home.module.css";

// Cloudinary imports
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { auto } from '@cloudinary/url-gen/actions/resize';


// Initialize Cloudinary
const cld = new Cloudinary({
  cloud: {
    cloudName: "dwenvtwyx" // Replace with your Cloudinary cloud name
  }
});

// Replace with your public ID from Cloudinary

const backgroundImage = cld.image('MATTEO9_evbaep')
.format('auto')
.quality('auto');

const Home = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/shop");
  }

  return (
    <div className={styles.fon}>
      <AdvancedImage 
        cldImg={backgroundImage}
        className={styles.backgroundImage}
        modifiers={[auto({ aspectRatio: 'auto' })]} // Adjust the image size automatically
      />
      <div className={styles.sloganBlog}>
        <h1>Unveil Timeless Beauty</h1>
        <h2>Masterpieces in Wool Designs</h2>
        <Button className={styles.homeButton} onClick={handleClick}>
          Shop Now
        </Button>
      </div>
    </div>
  );
};

export default Home;