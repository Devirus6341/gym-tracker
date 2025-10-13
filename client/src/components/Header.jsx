import { useContext, useState } from "react";
import { UserContext } from "../userContext";
import styles from '../styles/Header.module.css'
import Calendar from 'react-calendar';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

function Header() {
    const [user, setUser] = useContext(UserContext);
    const [date, setDate] = useState(new Date());
    const [isClicked, setIsClicked] = useState(false)
    const navigate = useNavigate()

    const handleLogout = async () => {
    try {
     const response = await axios.post("http://localhost:5000/logout");
        if (response.data.message) {
            console.log(response.data.message);
        }
        navigate('/login')
    } catch (err) {
      console.log("Logout failed:", err);
    } finally {
      setUser(null);
    }
  };

  const handleClicked = async() => {
    !isClicked ? setIsClicked(true) : setIsClicked (false)
  }

  


return <header className={styles.header}>
        <div>
            <img src="/Images/gym-weight-svgrepo-com.svg" alt="gym-logo" />
        </div>
        <div className={styles.navigation}>
            {user ? (
            <>
            <div className={styles.calender_div}>
               <img onClick={handleClicked} src="/Images/icons8-calendar-50.png" alt="calender" className={styles.calender_img}/>
             <Calendar className={`${styles.calender} ${isClicked ? styles.calender_show : ''}`}
               onChange={setDate} 
               value={date}      
                  />
            </div>
  
             <Link to='/overall-analysis' className={styles.header_link}>< p>Analysis</p></Link>
            <button onClick={() => handleLogout()}>Logout</button>
            </>):(
             <>
             <Link to='/login' className={styles.header_link}><p>Login</p></Link>
            <Link to='/signup'> <button>Signup</button></Link>
            </>)
            }
           
        </div>
    </header>
}

export default Header;