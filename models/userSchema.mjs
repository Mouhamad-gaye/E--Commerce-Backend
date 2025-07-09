
//Import mongoose library so I can use it to define and interact with my mongoDB schema
import mongoose from 'mongoose'

//Create the user schema. This is how the structure of the user document is defined.
const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    email: {
        type: String, 
        required: true, 
        unique: true, 
        //Must match a regex pattern (valid=looking email)
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Email address must be valid !",],},
    // Requires a min of 6 characters
    password: {type: String, required: true, minlength: 6},
    // Optional defautl to false. Good for role-based admin control
    admin: {type: Boolean, default: false},
    cart: {type: mongoose.Schema.Types.ObjectId, ref: "Cart"},
});

//Converts the schema into a usable model called " User"
// This model allows to interact with the users collection in the database.

export default mongoose.model("User", userSchema)