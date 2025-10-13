import Home from './components/Home';
import Categories from './components/Categories';
import Exercises from './components/Exercises';
import Login from './components/Login';
import OverallAnalysis from './components/Overall-Analysis';
import Signup from './components/Signup';
import AddWorkout from './components/AddWorkout';
import { UserContext } from './userContext.js';
import {Routes ,Route} from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';


axios.defaults.withCredentials = true;
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   async function refreshUser() {
    try {
       const response = await axios.get('http://localhost:5000/refresh_token')
      if (response.data.accessToken) {
        setUser({accessToken: response.data.accessToken})
      } else {
        setUser(null)
      }
    } catch (error) {
      console.log(error.response.data || error.message)
      setUser(null)
    } finally {
      setLoading(false)
    }
    }
    refreshUser();
  },[])


  if (loading) return <div>...Loading</div>
 return (
 <>
 <UserContext.Provider value={[user, setUser]}>
   <Routes>
    <Route path='/' element={<Home/>}/>
    <Route path='/login' element={<Login/>}/>
    <Route path='/categories' element={<Categories/>}/>
    <Route path='/exercises/:category' element={<Exercises/>}/>
    <Route path='/overall-analysis' element={<OverallAnalysis/>}/>
    <Route path='/signup' element={<Signup/>}/>
    <Route path='/add/:name' element={<AddWorkout/>}/>
    </Routes> 
     </UserContext.Provider>
  </>
  )
}

export default App
