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

const folders = {
    "Back To The Future": {
        images: ["THE-PAST-IS-THE-FUTURE12992_ALTA_ejkjx3", "THE-PAST-IS-THE-FUTURE12756_ALTA-min-min_ic9muq"],
        photographer: "Sabrina Falduto",
        model: "Thatiana Fanucchi",
        makeupArtist: "Mara Bottoni",
        designer: "Nataliya Rodionova",
        data: "October 5, 2019"
    },
    "FEROCE": {
        images: ["79378202_832598813852464_6888376890915087349_n_hmf8ep", "75551329_786140375234529_8679094163926044803_n_s4mmt0", "73533211_122456075890821_295844323991099680_n_t8dtiw", "76797814_730777967413113_7258995987181460778_n_oqjrhk", "75412641_2494841520764078_7414590578820947416_n_gafzja"],
        photographer: "Luisa Mazzanti",
        model: "Kelsey Hopps",
        stylist: "Salvatore Pezzella",
        makeupArtist: "Martina Iaquinta",
        designer: "Nataliya Rodionova",
        data: "December 23, 2019"
    },
    "KFW19": {
        images: ["41269105_1863190350441944_3226760306160041984_n_w4dhrb", "41303833_1863190347108611_1995252397663846400_n_w6zaew"],
        model: "Yulia Chamuk",
        stylist: "Nataliya Rodionova",
        designer: "Nataliya Rodionova",
        data: "September 16, 2018"
    },

    "Lewis": {
        images: ["67092771_2326639410763700_4773721287530905600_n_1_z4bds2", "66751639_2315943318499976_5481315053602865152_n_ykqce1", "67318501_2326624474098527_7499980138335961088_n_1_kkqico", "image_6487327-_1__tkev6i"],
        photographer: "Sabrina Falduto",
        model: "Matteo Paglierani",
        makeupArtist: "Mara Bottoni",
        designer: "Nataliya Rodionova",
        data: "October 27, 2019"
    },

    "Ellements": {
        images: ["Screenshot_from_2024-02-06_15-40-47_lohu1v", "revista-YBLx2HXM_ji0z8f", "TEST-Steve-Muliett0867_B-1_fnxrq7", "TEST-Steve-Muliett1832_B_jhwdyt", "TEST-Steve-Muliett0413_B_vahepe", "TEST_Steve_Muliett0658_C_snd1qk", "TEST-Steve-Muliett1381_B_ourh0n", "Screenshot_from_2024-02-05_16-30-14_1_kzdw21"],
        photographer: "Steve Muliett",
        model: "Karina Korr, Karen Iba",
        makeupArtist: "Daria Eden",
        designer: "Nataliya Rodionova",
        data: "November 8, 2017"
    }


};

function Collaboration() {
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [fullscreenImage, setFullscreenImage] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const getImage = (imageId) =>
        cld.image(imageId).format('auto').quality('auto').resize(auto().gravity(autoGravity()));

    const openImageModal = (folderName, index) => {
        setSelectedFolder(folderName);
        setCurrentImageIndex(index);
        setFullscreenImage(folders[folderName].images[index]);
    };

    const showNextImage = () => {
        if (folders[selectedFolder]) {
            const nextIndex = (currentImageIndex + 1) % folders[selectedFolder].images.length;
            setCurrentImageIndex(nextIndex);
            setFullscreenImage(folders[selectedFolder].images[nextIndex]);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>Photos</h2>
            <p style={{marginTop:'50px', marginBottom:'100px'}} className={styles.text}>Experience the magic of collaboration with internationally renowned talents—visionary photographers, avant-garde stylists, striking models, prestigious agencies, esteemed magazines, innovative designers, and masterful makeup artists. Together, they craft captivating narratives that transcend borders, blending creativity, culture, and style into timeless artistry.</p>

            {selectedFolder ? (
                <>
                    <button onClick={() => setSelectedFolder(null)} className={styles.backButton}>← Back</button>
                    <h3 className={styles.selectedFolderTitle}>{selectedFolder}</h3>
                    <div className={styles.fullscreenModal} onClick={showNextImage}>
                        <AdvancedImage className={styles.fullscreenImage} cldImg={getImage(fullscreenImage)} alt="Fullscreen" />
                    </div>
                    <div className={styles.artistInfo}>
                        {folders[selectedFolder].photographer && <h4><strong>Photographer: </strong>{folders[selectedFolder].photographer}</h4>}
                        {folders[selectedFolder].model && <h4><strong>Model: </strong>{folders[selectedFolder].model}</h4>}
                        {folders[selectedFolder].stylist && <h4><strong>Stylist: </strong>{folders[selectedFolder].stylist}</h4>}
                        {folders[selectedFolder].makeupArtist && <h4><strong>Makeup Artist: </strong>{folders[selectedFolder].makeupArtist}</h4>}
                        {folders[selectedFolder].designer && <h4><strong>Fashion Designer: </strong>{folders[selectedFolder].designer}</h4>}
                        {folders[selectedFolder].data && <h5>{folders[selectedFolder].data}</h5>}
                    </div>
                </>
            ) : (
                <div className={styles.folderGrid}>
                    {Object.entries(folders).map(([folderName, data]) => (
                        <div key={folderName} className={styles.folderItem} onClick={() => openImageModal(folderName, 0)}>
                                    <h3 style={{fontSize:'24px'}} className={styles.folderTitle}>{folderName}</h3>
                            <AdvancedImage className={styles.folderImage} cldImg={getImage(data.images[0])} alt={folderName} />
                            <div className={styles.artistInfo}>
                                {data.photographer && <h4 className={styles.info}><strong>Photographer: </strong>{data.photographer}</h4>}
                                {data.model && <h4 className={styles.info}><strong>Model: </strong>{data.model}</h4>}
                                {data.stylist && <h4 className={styles.info}><strong>Stylist: </strong>{data.stylist}</h4>}
                                {data.makeupArtist && <h4 className={styles.info}><strong>Makeup Artist: </strong>{data.makeupArtist}</h4>}
                                {data.designer && <h4 className={styles.info}><strong>Fashion Designer: </strong>{data.designer}</h4>}
                                {data.data && <h5 className={styles.dataInfo}>{data.data}</h5>}
                            </div>
                    
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Collaboration;
