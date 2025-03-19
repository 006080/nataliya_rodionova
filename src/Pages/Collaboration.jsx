import { useState } from 'react';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import styles from './Collaboration.module.css';

const cld = new Cloudinary({
    cloud: {
        cloudName: 'dwenvtwyx',
    },
});

function Collaboration() {
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [fullscreenImage, setFullscreenImage] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const folders = {
        "Back To The Future": ["THE-PAST-IS-THE-FUTURE12992_ALTA_ejkjx3", "THE-PAST-IS-THE-FUTURE12756_ALTA-min-min_ic9muq"],
        "FEROCE": ["79378202_832598813852464_6888376890915087349_n_hmf8ep", "75551329_786140375234529_8679094163926044803_n_s4mmt0", "73533211_122456075890821_295844323991099680_n_t8dtiw", "76797814_730777967413113_7258995987181460778_n_oqjrhk", "75412641_2494841520764078_7414590578820947416_n_gafzja"],
        "KFW": ["41269105_1863190350441944_3226760306160041984_n_w4dhrb", "41303833_1863190347108611_1995252397663846400_n_w6zaew"],
        "Lewis": ["67318501_2326624474098527_7499980138335961088_n_1_kkqico", "image_6487327-_1__tkev6i", "66751639_2315943318499976_5481315053602865152_n_ykqce1"],
        "Ellements": ["Screenshot_from_2024-02-06_15-40-47_lohu1v", "Screenshot_from_2024-02-05_16-30-14_1_kzdw21", "TEST-Steve-Muliett1381_B_ourh0n", "TEST-Steve-Muliett0867_B-1_fnxrq7", 'TEST-Steve-Muliett0413_B_vahepe', 'TEST-Steve-Muliett1832_B_jhwdyt', "TEST_Steve_Muliett0658_C_snd1qk"]
    };

    const getImage = (imageId) =>
        cld.image(imageId).format('auto').quality('auto').resize(auto().gravity(autoGravity()));

    const openImageModal = (folderName, index) => {
        setSelectedFolder(folderName);
        setCurrentImageIndex(index);
        setFullscreenImage(folders[folderName][index]);
    };

    const showNextImage = () => {
        if (folders[selectedFolder]) {
            const nextIndex = (currentImageIndex + 1) % folders[selectedFolder].length;
            setCurrentImageIndex(nextIndex);
            setFullscreenImage(folders[selectedFolder][nextIndex]);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>Photos</h2>
            <p className={styles.text}>Immerse yourself in collaborations with talented artists.</p>

            {selectedFolder ? (
                <>
                    <button onClick={() => setSelectedFolder(null)} className={styles.backButton}>← Back</button>
                    <h3 className={styles.selectedFolderTitle}>{selectedFolder}</h3>
                    <div className={styles.fullscreenModal} onClick={showNextImage}>
                        <AdvancedImage className={styles.fullscreenImage} cldImg={getImage(fullscreenImage)} alt="Fullscreen" />
                    </div>
                </>
            ) : (
                <div className={styles.folderGrid}>
                    {Object.entries(folders).map(([folderName, imageIds]) => (
                        <div key={folderName} className={styles.folderItem} onClick={() => openImageModal(folderName, 0)}>
                            <AdvancedImage className={styles.folderImage} cldImg={getImage(imageIds[0])} alt={folderName} loading="lazy" />
                            <h3 className={styles.folderTitle}>{folderName}</h3>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Collaboration;