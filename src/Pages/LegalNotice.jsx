import {ButtonHome} from "../../components/ButtonHome";
import styles from "./LegalNotice.module.css";

export const LegalNotice = () => {
    return (
        <div className={styles.termsBody} id="termsEng">
            <div className={styles.termsContainer}>

                <div>
                    <div className={styles.termsBox}>
                        <div className={styles.termsBoxButtonWrapper}>
                            <div className={styles.termsBoxButton}>
                                <button><a href='#termsDe'>DE</a></button>
                            </div>
                            <div className={styles.termsBoxButton}>
                                <button><a href='#termsEng'>ENG</a></button>
                            </div>
                        </div>
                        <h1 className={styles.termsTitle}>Legal Notice</h1>
                        <ButtonHome/>
                    </div>
                </div>


                <p>
                    Your name<br/>
                    Street<br/>
                    11111 City
                </p>

                <p>
                    <strong>Contact:</strong><br/>
                    Phone: +49 (0) 162 11 11 111<br/>
                    Email:
                    <a href='mailto:your.email@gmail.com'>
                    your.email@gmail.com
                </a>
                </p>

                <p>
                    <strong>Responsible for the content of the website:</strong><br/>
                    Your name
                </p>

                <br/>
                <br/>

                <h2>Website Status</h2>
                <p>This website is currently under development. Features, content, and functionalities are being created and may change without notice.
                </p>

                <h2>Important Notices</h2>
                <ul>
                  <li>No commercial transactions are currently possible</li>
                  <li>Website is in experimental/prototype stage</li>
                  <li>No payment processing is implemented</li>
                </ul>

                <h2>Liability</h2>
                <ul>
                  <li>Content is provided &quot;as-is&quot; without guarantees</li>
                  <li>Website may contain incomplete or test information</li>
                  <li> No legal obligations are created by this prototype</li>
                </ul>

                <h2>Copyright</h2>
                <p>All original content is protected and intended for demonstration purposes only.
                </p>

                <h5><strong>This legal notice also applies to the following social media profiles:</strong></h5>

                <h5>GitHub:</h5>
                <a href='https://github.com/your-github-username' target="_blank"
                   rel="noopener noreferrer">https://github.com/your-github-username</a>

                <h5>LinkedIn:</h5>
                <a href='https://www.linkedin.com/in/your-linkedin-username'
                   target="_blank" rel="noopener noreferrer">https://www.linkedin.com/in/your-linkedin-username</a>
                
                <h5>Facebook:</h5>
                <a href='https://www.facebook.com/your-facebook-username'
                   target="_blank" rel="noopener noreferrer">https://www.facebook.com/your-facebook-username</a>

                <br id="termsDe" /><br /><br /><br />


                <div>
                    <div className={styles.termsBox}>
                        <div className={styles.termsBoxButtonWrapper}>
                            <div className={styles.termsBoxButton}>
                                <button><a href='#termsEng'>ENG</a></button>
                            </div>
                            <div className={styles.termsBoxButton}>
                                <button><a href='#termsDe'>DE</a></button>
                            </div>
                        </div>
                        <h1 className={styles.termsTitle}>Impressum</h1>
                        <ButtonHome/>
                    </div>
                </div>

                <p>
                    Your name<br/>
                    Street<br/>
                    11111 City
                </p>

                <p>
                    <strong>Kontakt:</strong><br/>
                    Telefon: +49 (0) 162 11 11 111<br/>
                    E-Mail:
                    <a href='mailto:your.email@gmail.com'>
                    your.email@gmail.com
                </a>
                </p>

                <p>
                    <strong>Verantwortlich für den Inhalt der Website:</strong><br/>
                    Your name
                </p>

                <br/>
                <br/>

                <h2>Entwicklungsstatus der Website</h2>
                <p>Diese Website befindet sich derzeit in der Entwicklungsphase. Funktionen, Inhalte und Funktionalitäten können sich ohne Vorankündigung ändern.
                </p>


                <h2>Wichtige Hinweise</h2>
                <ul>
                  <li>Aktuell sind keine kommerziellen Transaktionen möglich</li>
                  <li>Website befindet sich in experimenteller/Prototyp-Phase</li>
                  <li>Keine Zahlungsabwicklung implementiert</li>
                </ul>


                <h2>Haftungsausschluss</h2>
                <ul>
                  <li>Inhalte werden &quot;wie besehen&quot; ohne Garantien bereitgestellt</li>
                  <li>Website kann unvollständige oder Test-Informationen enthalten</li>
                  <li>Durch diesen Prototyp werden keine rechtlichen Verpflichtungen begründet</li>
                </ul>


                <h2>Urheberrecht</h2>
                <p>Alle Originalinhalte sind geschützt und dienen ausschließlich Demonstrationszwecken.
                </p>

                <h5><strong>Dieses Impressum gilt auch für folgende Social Media Profile:</strong></h5>

                <h5>GitHub:</h5>
                <a href='https://github.com/your-github-username' target="_blank"
                   rel="noopener noreferrer">https://github.com/your-github-username</a>

                <h5>Linkedin:</h5>
                <a href='https://www.linkedin.com/in/your-linkedin-username'
                   target="_blank" rel="noopener noreferrer">https://www.linkedin.com/in/your-linkedin-username</a>

                <h5>Facebook:</h5>
                <a href='https://www.facebook.com/your-facebook-username'
                   target="_blank" rel="noopener noreferrer">https://www.facebook.com/your-facebook-username</a>

                <br /><br />

                <ButtonHome/>

                <br /><br />

            </div>
        </div>
    );
}
