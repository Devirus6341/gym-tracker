import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import pg from 'pg';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createAccessToken, createRefreshToken, sendRefreshToken } from './tokens.js';
import isAuth from './isAuth.js';

const app = express();

dotenv.config();
const port = process.env.PORT;
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.urlencoded({extended: true}));
app.use(express.json())
app.use(cookieParser())

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

const saltRounds = 10;

app.post('/signup', async(req, res) => {
try {
    const {username, password} = req.body;

   const existingUsers = await db.query('SELECT * FROM users WHERE username = $1', [username])
   if (existingUsers.rows.length > 0) throw Error ('User Already Exists');
   const hashedPassword = await bcrypt.hash(password, saltRounds);

   await db.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword])
   res.status(200).json({message: 'User Created'})
} catch (error) {
    res.status(500).json({error: error.message})
    console.log(error.message)
}
});

app.post('/login', async(req, res)=> {
try {
    const {username, password} = req.body;
    const existingUsers = await db.query('SELECT * FROM users WHERE username = LOWER($1)', [username.toLowerCase()]);
    if (existingUsers.rows.length ===0) throw Error('User Not Found');
    const verify = await bcrypt.compare(password, existingUsers.rows[0].password);
    if (!verify) throw Error('Incorrect Password')
        const accessToken =  createAccessToken(existingUsers.rows[0].id);
        const refreshToken =  createRefreshToken(existingUsers.rows[0].id);
         await db.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, existingUsers.rows[0].id])
        sendRefreshToken(res, refreshToken);

        res.json({accessToken})
} catch (error) {
    res.status(500).json({error: error.message});
    console.log(error);
}
})

app.get('/data', async(req, res) => {
    const userId = isAuth(req);
    try {
        const results = await db.query('SELECT reps, weight, created_at FROM workout_logs WHERE user_id = $1',[userId]);
        res.json(results.rows)
    } catch (error) {
        console.log(error.message)
    }
})

app.get('/current/day/workout', async(req, res) => {
      const currentDate = new Date().toDateString();
try {
       const userId = isAuth(req);
     const todays_workout = await db.query(`SELECT name, reps, weight FROM workout_logs JOIN exercises 
    ON workout_logs.exercise_id = exercises.id 
	WHERE workout_logs.user_id = $1 AND workout_logs.created_at = $2 
    ORDER BY workout_logs.id ASC`, [userId, currentDate])
        res.json(todays_workout.rows)
} catch (error) {
    console.log(error.message)
}
});

app.get('/exercises/:category', async(req, res) => {
    const {category} = req.params;
    try {
        const user = isAuth(req);
    if (!user)  throw Error ('Please Log In')
      const response = await db.query('SELECT name FROM exercises WHERE LOWER(muscle_group) = $1', [category.toLowerCase()])

    res.status(200).json(response.rows)
 }catch (error) {
        res.status(500).json({error: error.message})
    }
});

app.get('/history', async(req, res) => {
      const userId = isAuth(req);
try {
     const workout_History = await db.query(`
            SELECT name, reps, weight, created_at FROM workout_logs JOIN exercises 
            ON workout_logs.exercise_id = exercises.id
             WHERE workout_logs.user_id = $1 ORDER BY workout_logs.id DESC`, [userId])
             res.json(workout_History.rows)
} catch (error) {
    console.log(error.message)
}
});

app.post('/add', async(req, res) => {
    const userId = isAuth(req);
    const {name, reps, weight} = req.body
    try {
        const exercise_id = await db.query('SELECT * FROM exercises WHERE name = $1', [name])
        if (!exercise_id) throw Error('An Error occured')
      const workout =  await db.query('INSERT INTO workout_logs (user_id, exercise_id, reps, weight) VALUES ($1, $2, $3, $4) RETURNING *', [userId, exercise_id.rows[0].id, reps, weight,])
        res.status(200).json({currentWorkout: workout.rows})
    } catch (error) {
        console.log(error.message)
    }
});

app.post('/logout', async(req, res) => {
    try {
        res.clearCookie('refreshtoken', {path: '/refresh_token'});
        res.status(200).json({message:'Logout Successfull'})
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

app.get('/refresh_token', async(req, res) => {
try {
    const token = req.cookies.refreshtoken
if (!token) 
    return res.json({accessToken: ''})
    let payload;
       try {
         payload = jwt.verify(token, process.env.REFRESH_TOKEN_KEY);
       } catch (err) {
         console.error("Refresh token verification failed:", err.message);
         return res.json({ accessToken: "" });
       }

    const user = await db.query('SELECT * FROM users WHERE id = $1', [payload.userId])
if (user.rows.length === 0) return res.json({ accessToken: '' });
    if (token !== user.rows[0].refresh_token) return res.json({accessToken: ''});
    const accessToken = createAccessToken(user.rows[0].id)
    res.json({accessToken})
} catch (error) {
    res.status(500).json(error.message)
}
})

app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
})
