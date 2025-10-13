import Header from "./Header";
import '../styles/Home.css'
import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../userContext";
import { Plus } from "lucide-react";

function Home() {
  const [user] = useContext(UserContext)
  const currentDate = new Date().toDateString();
  const [date] = useState(currentDate)
  const [todaysWorkout, setTodaysWorkout] = useState([])
 
  useEffect(() => {
    async function getCurrentDayWorkout() {
      const response = await axios.get('http://localhost:5000/current/day/workout', {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`
        }
      })

      const grouped = response.data.reduce((acc, exercise) => {
        const name = exercise.name;
        if (!acc[name]) acc[name] = [];
        acc[name].push(exercise)
          return acc;
        }, {})
       setTodaysWorkout(grouped)
    }
    getCurrentDayWorkout()
  },[user?.accessToken])

return (
  <div>
    <Header />
    <div className="log-date">
      <p className="current-date">{date}   {todaysWorkout &&  Object.keys(todaysWorkout).length > 0 ? <span><Link to="/categories" className="alt-add-btn"> <Plus size={20}/> </Link></span> : ''}</p>
    </div>
  <div className="home-container">
    {todaysWorkout && Object.keys(todaysWorkout).length > 0 ? (
      Object.entries(todaysWorkout).map(([name, exercises]) => (
        <div key={name} className="history-group">
          <h3>{name}</h3>
          {exercises.map((ex, i) => (
            <div key={i} className="exercise-item">
              <br />
              <span>Reps: {ex.reps}</span>{" "}
              <span>Weight: {ex.weight} lbs</span>
            </div>
          ))}
        </div>
      ))
    ) : (
      <div className="add-workout">
        <h2>No Workout Logs</h2>
        <div className="add-workout-btn">
          <Link to="/categories" className="add-btn">
           <Plus size={40}/>
          </Link>
          <p>Start New Workout</p>
        </div>
      </div>
    )}
    </div>
  </div>
);
}

export default Home;