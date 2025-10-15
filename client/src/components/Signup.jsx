import {  useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import styles from '../styles/Login.module.css';

function Login() {
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate()

const handleSubmit = async (event)=> {
    event.preventDefault();
    try {
        const response = await axios.post('http://localhost:5000/signup',{username, password});
        const reply = response.data;
        if (reply.message) {
        navigate('/', {replace: true})
        }
    } catch (error) {
        console.log(error.message);
       setError(error.response.data.error)
    } finally {
              setUserName('');
                setPassword('');
    }
   
}
return( 
    <div className={styles.login_container}>
    <form className={styles.login_form} onSubmit={handleSubmit}>
           {error && <div className={styles.login_error}>{error} &#9888;</div>}
            <h2>Signup</h2>
            <input type="text" placeholder="Username" onChange={(e) => setUserName(e.target.value)} value={username}/>
            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} value={password}/>
            <button type="submit">Signup</button>
            <p>Already have an account? <Link to='/login'>Log in</Link></p>

        </form>
        </div>
)
}

export default Login;