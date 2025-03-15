import { useState, useEffect } from "react";
import axios from "axios";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import styles from "./Collaboration.module.css";

const CLOUDINARY_CLOUD_NAME = "dwenvtwyx";
const UPLOAD_FOLDER = "YOUR_UPLOAD_FOLDER";

const Collaboration = () => {
  const [collaborations, setCollaborations] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(
          `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/list/${UPLOAD_FOLDER}.json`
        );
        
        const groupedData = response.data.resources.reduce((acc, image) => {
          const date = image.folder || "Unknown Date";
          if (!acc[date]) acc[date] = [];
          acc[date].push(image);
          return acc;
        }, {});

        setCollaborations(Object.entries(groupedData));
      } catch (error) {
        console.error("Error fetching images: ", error);
      }
    };

    fetchImages();
  }, []);

  return (
    <div className={styles.collaborationPage}>
      <h1>Collaborations</h1>
      {collaborations.length === 0 ? (
        <p>Loading...</p>
      ) : (
        collaborations.map(([date, images]) => (
          <div key={date} className={styles.collabSection}>
            <h2>{date}</h2>
            <p className={styles.artistName}><em>{images[0].context?.custom?.artist || "Unknown Artist"}</em></p>
            <Carousel showThumbs={false} autoPlay infiniteLoop>
              {images.map((img) => (
                <div key={img.public_id}>
                  <img src={img.url} alt={img.public_id} className={styles.collabImage} />
                </div>
              ))}
            </Carousel>
          </div>
        ))
      )}
    </div>
  );
};

export default Collaboration;
