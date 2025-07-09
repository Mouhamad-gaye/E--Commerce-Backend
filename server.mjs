import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000

//Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));



//Routes

//Error handling middleware

//Listener
app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`)
})