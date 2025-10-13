import { useContext } from "react";
import Header from "./Header";
import { UserContext } from "../userContext";
import { Navigate, Link } from "react-router-dom";
import { Dumbbell, HeartPulse, Flame,BicepsFlexed, EllipsisVertical, Target,Activity, Plus } from "lucide-react";
import '../styles/Add_Workout.css'

function Categories() {
    const [user] = useContext(UserContext);

       const categories = [  
    { name: "Chest", icon: <Dumbbell /> },
    { name: "Back", icon: <Activity />},
    {name: 'Triceps', icon: <BicepsFlexed />},
    { name: "Shoulders", icon: <Target /> },
    { name: "Legs", icon: <Flame /> },
    {name: 'Biceps', icon: <BicepsFlexed />},
    { name: "Abs", icon: <Target /> },
    {name: 'Cardio', icon: <HeartPulse/> },
    {name: <Plus />, },
]


    if (!user?.accessToken) {
        return <Navigate to='/login' replace/>
    }
return <div>
    <Header/>
    <div className="categories">
         {categories.map((category, index) =>
         <Link to={`/exercises/${category.name}`} key={index} className="category">
            <span>{category.icon}</span> <p>{category.name}</p> <div><EllipsisVertical /></div>
         </Link>)}
    </div>
</div>
}

export default Categories;