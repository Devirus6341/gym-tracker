import {useState, useContext,useEffect } from "react";
import {Link, useParams} from 'react-router-dom'
import{UserContext }from '../userContext.js';
import axios from 'axios';
import Header from './Header'
import { EllipsisVertical} from "lucide-react";
import '../styles/Add_Workout.css'


function Exercises() {
    const [user] = useContext(UserContext);
    const [exercises, setExercises] = useState([])
    const [loading, setLoading] = useState(true)
    const {category} = useParams();

    useEffect(() => {
    async function getExercises() {
        try {
                const respsonse = await axios.get(`http://localhost:5000/exercises/${category}`, {
            headers: {
                Authorization: `Bearer ${user.accessToken}`
            }
            })
            setExercises(respsonse.data)
        } catch (error) {
            console.log(error.message)
        } finally {
            setLoading(false)
        }
    }
    if (user?.accessToken) {
           getExercises();
    }
    },[user.accessToken, category])
    console.log(exercises)

    if (!user?.accessToken) {
        return(<div>
             <Header/>
            <div>Please Log In</div>
        </div>) 
    }

    if (loading) return <div>...Loading</div>
    return (
        <div>
            <Header/>
          <div className="muscle-group_title"> {category}</div>
          {exercises.map((exercise, index) => 
          <Link to={`/add/${exercise.name}`}  className="exercise" key={index}>
            <p className="exerise-name">{exercise.name}</p> <span><EllipsisVertical size={20} color="white"/></span>
          </Link>
        )}
        </div>
    )
}

export default Exercises;