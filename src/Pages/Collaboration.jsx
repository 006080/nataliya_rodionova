import { useEffect, useState } from 'react';
import styles from './Collaboration.module.css';

function Collaboration() {
    const [folders, setFolders] = useState({});
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fullscreenImage, setFullscreenImage] = useState(null);

    const CLOUDINARY_CDN = "https://cdn.nataliyarodionova.com";

    useEffect(() => {
        async function fetchFolders() {
            try {
                const res = await fetch('http://localhost:4000/api/cloudinary-folders');
                const data = await res.json();
                if (data.error) {
                    console.error(data.error);
                } else {
                    setFolders(data);
                }
            } catch (err) {
                console.error('Error fetching folders:', err);
            }
        }
        fetchFolders();
    }, []);

    // Modify Cloudinary URL to use CDN and optimize images
    const optimizeImage = (url, width = 600, height = 400) => {
        return url
            .replace('/upload/', `/upload/w_${width},h_${height},c_fill,f_auto,q_auto,dpr_auto/`)
            .replace('res.cloudinary.com', 'cdn.nataliyarodionova.com'); // Corrected replacement
    };

    // Handle folder selection
    const handleFolderClick = async (folderName) => {
        setLoading(true);
        setSelectedFolder(folderName);

        if (folders[folderName] && folders[folderName].length > 0) {
            const optimizedImages = folders[folderName].map(url => optimizeImage(url));
            setImages(optimizedImages);
        } else {
            setImages([]);
        }

        setLoading(false);
    };

    // Open full-screen image
    const openFullScreen = (url) => {
        setFullscreenImage(optimizeImage(url, 1200, 800)); // Load larger image
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>Photos</h2>
            <p className={styles.text}>
                Explore collaborations with stylists, photographers, models, and magazines.
            </p>

            {selectedFolder ? (
                <>
                    <button onClick={() => setSelectedFolder(null)} className={styles.backButton}>
                        ← Back
                    </button>
                    <h3 className={styles.selectedFolderTitle}>{selectedFolder}</h3>

                    {loading ? (
                        <p>Loading images...</p>
                    ) : (
                        <div className={styles.imageGrid}>
                            {images.length > 0 ? (
                                images.map((url, index) => (
                                    <img
                                        key={index}
                                        src={url}
                                        alt={`img-${index}`}
                                        className={styles.thumbnail}
                                        loading="lazy"
                                        onClick={() => openFullScreen(url)}
                                    />
                                ))
                            ) : (
                                <p>No images found in this folder.</p>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div className={styles.folderGrid}>
                    {Object.entries(folders).map(([folderName, images]) => (
                        folderName !== 'review' && (
                            <div key={folderName} className={styles.folderItem} onClick={() => handleFolderClick(folderName)}>
                                {images.length > 0 && (
                                    <img
                                        src={optimizeImage(images[0], 200, 200)}
                                        alt={folderName}
                                        className={styles.folderImage}
                                        loading="lazy"
                                    />
                                )}
                                <h3 className={styles.folderTitle}>{folderName}</h3>
                            </div>
                        )
                    ))}
                </div>
            )}

            {fullscreenImage && (
                <div className={styles.fullscreenModal} onClick={() => setFullscreenImage(null)}>
                    <img src={fullscreenImage} alt="Fullscreen" className={styles.fullscreenImage} />
                </div>
            )}
        </div>
    );
}

export default Collaboration;
