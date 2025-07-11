import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import connectDB from './db/conn.mjs'
import globalError from './middleware/globalError.mjs'
import userRoutes from './routes/userRoutes.mjs'
import productRoutes from './routes/productRoutes.mjs'



dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000
connectDB();

//Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));


//Routes
app.use('/api/user', userRoutes)
app.use('/api/product', productRoutes)


//Error handling middleware. Only runs when server error occurs
app.use(globalError)

//Listener
app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`)
})