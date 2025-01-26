import { useNavigate } from 'react-router-dom';
import styles from './ButtonHome.module.css';

export const ButtonHome = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/');
    };

    return (
        <button className={styles.buttonHome} onClick={handleClick}>Go to Home</button>
    );
}
