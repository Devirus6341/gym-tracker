import { useContext, useEffect, useState } from "react";
import { UserContext } from "../userContext";
import axios from "axios";
import { useNavigate,Link } from "react-router-dom";
import styles from '../styles/Login.module.css';

function Login() {
    const [user, setUser] = useContext(UserContext);
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate()

const handleSubmit = async (event)=> {
    event.preventDefault();
    setLoading(true)

    try {
        const response = await axios.post('http://localhost:5000/login',{username, password});
        const reply = response.data;
        if (reply.accessToken) {
        setUser({accessToken: reply.accessToken});
        console.log({accessToken: reply.accessToken});
         setTimeout(() => {
        navigate('/', { replace: true });
  }, 100);
        }
    } catch (error) {
        console.log(error.message);
       setError(error.response.data.error)
    } finally {
        setLoading(false)
           setUserName('');
            setPassword('');
    }
   
}
useEffect(()=> {console.log(user)}, [user])

return( 
    <div className={styles.login_container}>
    <form className={styles.login_form} onSubmit={handleSubmit}>
           {error && <div className={styles.login_error}>{error} &#9888;</div>}
            <h2>Login</h2>
            <input type="text" placeholder="Username" onChange={(e) => setUserName(e.target.value)} value={username}/>
            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} value={password}/>
            <button type="submit"  disabled={loading}>
                  {loading ? <div className={styles.spinner}></div> : "Submit"}
                 </button>
            <p>Dont have an account? <Link to='/signup'>Sign up</Link></p>
        </form>
        </div>
)
}

export default Login;