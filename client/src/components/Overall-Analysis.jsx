import { useContext, useEffect, useState } from "react";
import { UserContext } from "../userContext.js";
import { Navigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

function OverallAnalysis() {
  const [user] = useContext(UserContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.accessToken) return;

    const getData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/data", {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });

        // Convert to weekly data
        const groupedByWeek = {};

        response.data.forEach((item) => {
          const date = new Date(item.created_at);
          const year = date.getFullYear();
          const week = getWeekNumber(date); // custom function below
          const key = `${year}-W${week}`;

          if (!groupedByWeek[key]) {
            groupedByWeek[key] = {
              week: key,
              totalReps: 0,
              totalWeight: 0,
              count: 0,
            };
          }

          groupedByWeek[key].totalReps += item.reps;
          groupedByWeek[key].totalWeight += item.weight;
          groupedByWeek[key].count += 1;
        });

        // Convert back to array format
        const weeklyData = Object.values(groupedByWeek).map((w) => ({
          week: w.week,
          avgReps: w.totalReps / w.count,
          avgWeight: w.totalWeight / w.count,
        }));

        setData(weeklyData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [user?.accessToken]);

  if (!user?.accessToken) return <Navigate to="/login" replace />;
  if (loading) return <p>Loading chart...</p>;

  return (
    <div
      style={{
        width: "100%",
        height: 400,
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
      }}
    >
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="avgWeight" stroke="#8884d8" name="Avg Weight" />
          <Line type="monotone" dataKey="avgReps" stroke="#82ca9d" name="Avg Reps" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Utility: Get ISO week number
function getWeekNumber(date) {
  const tempDate = new Date(date.getTime());
  tempDate.setHours(0, 0, 0, 0);
  tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7));
  const yearStart = new Date(tempDate.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((tempDate - yearStart) / 86400000 + 1) / 7);
  return weekNo;
}

export default OverallAnalysis;
