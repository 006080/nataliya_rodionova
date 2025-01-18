
import Form from "../../components/Form";
import styles from "./Contacts.module.css";

const Contacts = ({ backgroundImage }) => {
  return (
    <div className={styles.background}>
      <div className={styles.contactContainer}>
        <Form />
      </div>
    </div>
  );
};

export default Contacts;