import { useNavigate } from "react-router-dom";
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage } from "@cloudinary/react";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import styles from "./Footer.module.css";

const cld = new Cloudinary({
  cloud: {
    cloudName: "dwenvtwyx",
  },
});

const Footer = () => {
  const navigate = useNavigate();

  const getImage = (imageId) =>
    cld
      .image(imageId)
      .format("auto")
      .quality("auto")
      .resize(auto().gravity(autoGravity()));

  const handleOpenCookieSettings = () => {
    window.dispatchEvent(new CustomEvent('openCookieSettings'));
  };

  return (
    <div className={styles.footer}>
      <div className={styles.footerLinks}>
        <h4 className={styles.foot} onClick={() => navigate("/terms")}>
          Terms and Conditions
        </h4>
        <h4 className={styles.foot} onClick={() => navigate("/return")}>
          Return Policy
        </h4>
        <h4 className={styles.foot} onClick={() => navigate("/legal-notice")}>
          Legal Notice
        </h4>
        <h4 className={styles.foot} onClick={() => navigate("/privacy-policy")}>
          Privacy Policy
        </h4>
        <h4 className={styles.foot} onClick={handleOpenCookieSettings}>
          Cookie Settings
        </h4>
      </div>

      <div className={styles.iconsLine}>
        <div className={styles.paymentIcons}>
          <div className={styles.iconWrapper}>
            <AdvancedImage
              className={styles.paymentIcon}
              cldImg={getImage("card_zoasyf")}
            />
          </div>
          <div className={styles.iconWrapper}>
            <AdvancedImage
              className={styles.paymentIcon}
              cldImg={getImage("visa_vqehyp")}
            />
          </div>
          {/* <div className={styles.iconWrapper}>
            <AdvancedImage
              style={{ filter: "invert(1)", marginTop: "10px", width: "75px" }}
              className={styles.paymentIcon}
              cldImg={getImage("png-transparent-mollie-logo-tech-companies_u6ibbl")}
            />
          </div> */}
          {/* <div className={styles.iconWrapper}>
            <AdvancedImage
              className={styles.paymentIcon}
              cldImg={getImage("stripe_pl0sbg")}
            />
          </div> */}
          <div className={styles.iconWrapper}>
            <AdvancedImage
              className={styles.paymentIcon}
              style={{ width: "82px", marginTop: "-16px" }}
              cldImg={getImage("paypal_ww2gpn")}
            />
          </div>
        </div>

        <div className={styles.paymentIcons}>
          <div className={styles.iconWrapper}>
            <a
              href="https://www.youtube.com/watch?app=desktop&v=YhKtUzEA-jU"
              target="_blank"
              rel="noopener noreferrer"
            >
              <AdvancedImage
                className={styles.socialIcons}
                cldImg={getImage(
                  "5282548_play_player_video_youtube_youtuble_logo_icon_tayhki"
                )}
              />
            </a>
          </div>
          <div className={styles.iconWrapper}>
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <AdvancedImage
                className={styles.socialIcons}
                style={{
                  filter: "invert(1)",
                  width: "22px",
                  margin: "5px",
                  opacity: 0.9,
                }}
                cldImg={getImage(
                  "5282541_fb_social_media_facebook_facebook_logo_social_network_icon_e8ixwq"
                )}
              />
            </a>
          </div>
          <div className={styles.iconWrapper}>
            <a
              href="https://www.instagram.com/varona_nataliyarodionova/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <AdvancedImage
                className={styles.socialIcons}
                style={{
                  filter: "invert(1)",
                  width: "22px",
                  margin: "5px",
                  opacity: 0.9,
                }}
                cldImg={getImage(
                  "5282544_camera_instagram_social_media_social_network_instagram_logo_icon_jycw7z"
                )}
              />
            </a>
          </div>
        </div>
      </div>

      <p>
        Seite – verwaltet von The Level S.r.l. - copyright © VARONA S.R.L. 2024
        - Alle Rechte vorbehalten - Jegliche Reproduktion der Inhalte ist
        strengstens verboten.
      </p>
    </div>
  );
};

export default Footer;