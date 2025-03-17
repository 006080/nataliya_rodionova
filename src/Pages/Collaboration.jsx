import { useEffect, useState } from 'react';
import styles from './Collaboration.module.css';

function Loader() {
    return <div className={styles.loader}></div>;
}

function Collaboration() {
    const [folders, setFolders] = useState({});
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fullscreenImage, setFullscreenImage] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        async function fetchFolders() {
            try {
                setLoading(true);
                const res = await fetch('http://localhost:4000/api/cloudinary-folders');
                const data = await res.json();
                if (data.error) {
                    console.error(data.error);
                } else {
                    setFolders(data);
                }
            } catch (err) {
                console.error('Error fetching folders:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchFolders();
    }, []);

    // Modify Cloudinary URL to optimize images without resizing or blur effect
    const optimizeImage = (url) => {
        return url.replace('/upload/', `/upload/f_auto,q_90/`);
    };

    // Handle folder selection
    const handleFolderClick = async (folderName) => {
        setLoading(true);
        setSelectedFolder(folderName);

        if (folders[folderName] && folders[folderName].length > 0) {
            const optimizedImages = folders[folderName].map(url => optimizeImage(url));
            setImages(optimizedImages);
            setFullscreenImage(optimizedImages[0]); // Show the first image in fullscreen
            setCurrentImageIndex(0);
        } else {
            setImages([]);
        }

        setLoading(false);
    };

    // Show next image in fullscreen mode
    const showNextImage = () => {
        if (images.length > 0) {
            const nextIndex = (currentImageIndex + 1) % images.length;
            setCurrentImageIndex(nextIndex);
            setFullscreenImage(images[nextIndex]);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>Photos</h2>
            <p className={styles.text}>
                Immerse yourself in enchanting collaborations with visionary stylists, talented photographers, captivating models, and renowned magazines, where artistry and passion come together to create timeless beauty.
            </p>

            {selectedFolder ? (
                <>
                    <button onClick={() => setSelectedFolder(null)} className={styles.backButton}>
                        ← Back
                    </button>
                    <h3 className={styles.selectedFolderTitle}>{selectedFolder}</h3>

                    {loading ? (
                        <Loader />
                    ) : fullscreenImage ? (
                        <div className={styles.fullscreenModal} onClick={showNextImage}>
                            <div></div>
                            <img src={fullscreenImage} alt="Fullscreen" className={styles.fullscreenImage} />
                        </div>
                    ) : (
                        <p>No images found in this folder.</p>
                    )}
                </>
            ) : (
                <div className={styles.folderGrid}>
                    {loading ? (
                        <Loader />
                    ) : (
                        Object.entries(folders).map(([folderName, images]) =>
                            folderName !== 'reviews' && (
                                <div key={folderName} className={styles.folderItem} onClick={() => handleFolderClick(folderName)}>
                                    {images.length > 0 && (
                                        <img
                                            src={optimizeImage(images[0])} // No resizing here, just optimization
                                            alt={folderName}
                                            className={styles.folderImage}
                                            loading="lazy"
                                        />
                                    )}
                                    <h3 className={styles.folderTitle}>{folderName}</h3>
                                </div>
                            )
                        )
                    )}
                </div>
            )}
        </div>
    );
}

export default Collaboration;
