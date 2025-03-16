import { useState, useEffect } from "react";
import axios from "axios";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import styles from "./Collaboration.module.css";

const CLOUDINARY_CLOUD_NAME = "YOUR_CLOUDINARY_CLOUD_NAME";
const CLOUDINARY_API_KEY = "YOUR_CLOUDINARY_API_KEY";

const Collaboration = () => {
  const [collaborations, setCollaborations] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image`,
          {
            headers: {
              Authorization: `Basic ${btoa(`api_key:${CLOUDINARY_API_KEY}`)}`,
            },
          }
        );

        const groupedData = response.data.resources.reduce((acc, image) => {
          const date = new Date(image.created_at).toLocaleDateString();
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
                  <img src={img.secure_url} alt={img.public_id} className={styles.collabImage} />
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