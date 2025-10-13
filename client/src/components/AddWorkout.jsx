import { useContext, useEffect, useState } from "react";
import { UserContext } from "../userContext";
import { Navigate, useParams } from "react-router-dom";
import {motion, AnimatePresence} from 'framer-motion'
import Header from './Header'
import { Plus, Minus } from "lucide-react";
import axios from "axios";
import WorkoutGraph from "./WorkoutGraph";


function AddWorkout() {
const [user] = useContext(UserContext);
const [activeTab, setActiveTab] = useState("workout");
const [workoutHistory, setworkoutHistory] = useState({})
const [currentWorkout, setCurrentWorkout] = useState([]);
const [inputWeight, setInputWeight] = useState( parseFloat(5.00).toFixed(2))
const [inputReps, setInputReps] = useState(5.00)
  const {name}= useParams();

  useEffect(() => {
    async function getWorkoutHistory() {
      try {
          const response = await axios.get('http://localhost:5000/history', {
            headers: {
              Authorization: `Bearer ${user.accessToken}`
            }
          });
          const result = response.data
          const data = result.filter((item) => item.name === name)
         const grouped = data.reduce((acc, workout) => {
          const date = workout.created_at.split("T")[0];
          if (!acc[date]) acc[date] = [];
          acc[date].push(workout);
          return acc;
        }, {});
        setworkoutHistory(grouped);

      } catch (error) {
        console.log(error.message)
      }
    }

    getWorkoutHistory()
  },[currentWorkout, user.accessToken, name]);

 function handleWeightBlur() {
  if (inputWeight !== '') {
    setInputWeight(parseFloat(inputWeight).toFixed(2))
  }
 }

 function handleWeightIncrease() {
    setInputWeight((prevValue) => parseInt(prevValue) +5)
 }

  function handleRepIncrease() {
    setInputReps((prevValue) => prevValue +5)
 }

 function handleRepDecrease() {
      if (inputReps <= 0) return
    setInputReps((prevValue) => prevValue -5)
 }

 function handleWeightDecrease() {
        if (inputWeight <= 0) return
    setInputWeight((prevValue) => parseInt(prevValue) -5)
 }

 async function handleSubmit() {
  try {
    const response = await axios.post('http://localhost:5000/add', { name, reps: inputReps, weight: inputWeight}, {
      headers: {
        Authorization: `Bearer ${user.accessToken}`
      }
    })
    const currentWorkoutArray = [...response.data.currentWorkout]
setCurrentWorkout((prevValue) => [...prevValue, ...currentWorkoutArray])
  } catch (error) {
    console.log(error.response.data)
  }
 }

 useEffect(() => {
const workoutContainer = document.getElementById('current-workout-container');
 if (!workoutContainer) return;
workoutContainer.scrollTo({
  top: workoutContainer.scrollHeight,
  behavior: 'smooth'
})
 },[currentWorkout])

 if (!user?.accessToken)
   return <Navigate to='/login' replace />

return (<>
   <Header/>
   <div className="add-workout-tabs"><div className="add-workout-title">
    <div onClick={()=>setActiveTab('workout')} className={`tabs ${activeTab === 'workout' ? 'active' : ''}`}>{name}</div>
     <div className="tabs">|</div> 
  <div onClick={()=>setActiveTab('history')} className={`tabs ${activeTab === 'history' ? 'active' : ''}`}>History</div>
      <div className="tabs">|</div> 
   <div onClick={()=>setActiveTab('graph')} className={`tabs ${activeTab === 'graph' ? 'active' : ''}`}>Graph</div>
    </div></div>
    <AnimatePresence mode="wait">
          {activeTab === "workout" && (
            <motion.div
              key="workout"
              className="workout-div-container"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
                 <form onSubmit={(event) => event.preventDefault()} className="add-workout-form">
                <label htmlFor='weight'>WEIGHT(lbs)</label>
              <div className="add-input"    onBlur={handleWeightBlur}>
                   <button onClick={handleWeightDecrease}><Minus size={35}/></button> 
                   <input type="number" step='5.00' name="weight" 
                   onChange={(e) => setInputWeight(e.target.value)}
                   value={ inputWeight}
                /><button onClick={handleWeightIncrease}><Plus size={35}/></button> 
                </div>
                <label htmlFor='reps'>REPS</label>
              <div className="add-input" >
                    <button onClick={handleRepDecrease}><Minus size={35}/></button>
                <input type="number" step='5.00' name="reps" value={inputReps}
                onChange={(e)=> setInputReps((e.target.value))}
                /><button onClick={handleRepIncrease}><Plus size={35}/></button> 
                </div>
                <div className="add-workout-btns">
                <button className="save-btn" type="submit" onClick={handleSubmit}>Save</button>
                <button className="clear-btn" onClick={()=> {setInputReps(0), setInputWeight(0)}}>Clear</button>
                </div>
              </form>
              { currentWorkout && <div className="current-workout-container" id="current-workout-container">
                {currentWorkout.map((workout, index) =>
                <div className="current-workout-div" key={index}>
                 <span>{index+1}</span> <span>{workout.reps} lbs</span>  <span>{workout.weight} reps</span>
                </div>
              )}
              </div>}
            </motion.div>
          )}
          {/* History Tab */}
               {activeTab === "history" && (
            <motion.div
              key="history"
              className="history-tab"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
    
         {Object.entries(workoutHistory).map(([date, exercises]) => (
        <div key={date} className="history-group">
          <h2>{new Date(date).toDateString()}</h2>
          {exercises.map((ex, i) => (
            <div key={i} className="exercise-item">
               <br />
              <span>Reps: {ex.reps} </span> <span>Weight: {ex.weight} lbs</span>
            </div>
          ))}
        </div>
      ))}
            </motion.div>
          )}

          {/* Graph Tab */}
          {activeTab === "graph" && (
            <motion.div
              key="graph"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <h2>Analysis</h2>
             <WorkoutGraph/>
            </motion.div>
          )}
    </AnimatePresence>
    </>)
}

export default AddWorkout;