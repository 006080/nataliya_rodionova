
import Form from "../../components/Form";
import styles from "./Contacts.module.css";

const Contacts = ({}) => {
  return (
    <div className={styles.background}>
      <div className={styles.contactContainer}>
        <Form />
      </div>
    </div>
  );
};

export default Contacts;