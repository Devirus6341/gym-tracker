import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { UserContext } from '../userContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function WorkoutGraph() {
  const [user] = useContext(UserContext);
  const { name } = useParams(); // exercise name
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchWorkoutData() {
      try {
        const res = await axios.get(`http://localhost:5000/workout-history/${name}`, {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        });
        setData(res.data); // expected to be an array of {date, weight, reps}
      } catch (error) {
        console.log(error.message);
      }
    }

    fetchWorkoutData();
  }, [name, user.accessToken]);

  return (
    <div style={{ width: '100%', height: 400 }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {name} Progress
      </h2>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis label={{ value: 'Weight (lbs)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="weight" stroke="#8884d8" strokeWidth={3} dot={{ r: 5 }} />
          <Line type="monotone" dataKey="reps" stroke="#82ca9d" strokeWidth={3} dot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WorkoutGraph;
