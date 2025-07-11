import express from 'express'
import User from '../models/userSchema.mjs'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Cart from '../models/cartSchema.mjs'


const router = express.Router();

//Declare a asynchronous arrow function. 
//Async means you can use await inside the function to wait for asynchronous operations, like saving a user to a database or hashing a password
//Req contains incoming data (what users send in a form)
//Res is what you use to send data back to the client.
router.post('/register', async (req, res) => {
    //Destructure the req.body
    //Pulls 3 propperties directly from req.body, where the submitted form data lives. 
    // Req.body is like when someone submits on a website like sign up or login in form, the browser sends the data to the server, POST or PUT request. The part of the request 
    // that contains that actual data like the username, email, password is the req.body
    //req.body does not work if the middleware is not set up on your server
    const {username, email, password} = req.body;

    // Check user submitted all necessary data, if not return
    if(!username || !email || !password) {
        //Sends an HTTP  response back to the client to indicate an error
        //return = exits the current function immediately, preventing further code running
        //res is response object provide by express, used to send data back to the client
        //.status(400) sets the HTTP status code to 400 Bad Request, meaning client sent wrong info
        //.json() sends a json formatted response with a message.
        return res.status(400).json({msg: "All field are required"});
    };

    try {
        //Check if user already exist
        let user = await User.findOne({email});
        //If email exists, return with error
        if(user) {
            return res.status(400).json({msg: "Email already exist."});
        };

        //Create a new user, do not save to db yet
        user = new User({username, email, password});

        const salt = await bcrypt.genSalt(10);
        //Hashing password
        user.password = await bcrypt.hash(password, salt);

        //Save user to create unique mongoDB _id
        await user.save();

        //Initialize a new cart document in your DB for a specific user and save it so it gets a unique _id.
        //Cart with the upper C is your mongoose model (mongoose.model("Cart", cartSchema)).
        //new Cart ({...}) creates new instance of that model. Not yet saved.
        //{user: user._id associates this cart with a specific user. expects the user's MongoDB objectId usually stored as _id }
        //items: [] initializes the cart with an empty array of items, which will hold products the user adds.
        const cart = new Cart ({user: user._id, items: [] })
        //This line persist the new cart into the database
        //After saving, MongoDB generates a unique _id for the cart, making it trackeable and retrievable later.
        await cart.save()

        //Update user with cart ID reference, and save
        user.cart = cart._id;
        await user.save();

        //Const payload declares a constant named payload, which hold the data we want to include in the JWT
        //User is a key in the payload objkect often named "user" or "member" to indicate that the token belongs to a user.
            //id: user._id is the unique MongoDB onjectId for the current user. a key piece of identity that gets encoded on the token.
            // the paylaod acts like a backstage pass. it just identifies the user when the client sends the token back to the server in the future.  
        const payload = {      
            user: {
                id: user._id,
            },
        };

        jwt.sign(payload, process.env.jwtSecret, {expiresIn: 360000}, (err, token) => {
            if(err) throw err;
            res.status(201).json({token})
        });

    } catch(err) {
        console.error(err);
        res.status(500).json({msg: "Server Error"})
    }

    
})

router.post('/login', async (req, res) => {
    //Destructure the req.body
    //Pulls 3 propperties directly from req.body, where the submitted form data lives. 
    // Req.body is like when someone submits on a website like sign up or login in form, the browser sends the data to the server, POST or PUT request. The part of the request 
    // that contains that actual data like the username, email, password is the req.body
    //req.body does not work if the middleware is not set up on your server
    const {email, password} = req.body;

    //Make sure req.body has email and password
    if(!email || !password) {
        return res.status(400).json({msg: "All fields are required"});
    };

    try {
        //Check if user exists in DB
        let user = await User.findOne({email})
        //if they do not exist, return with error
        if (!user) {
            return res.status(400).json({msg: "Invalid credentials"})
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        //Check if password matches, if not return error
        if (!isMatch) {
            return res.status(400).json({msg: "Invaliud credntials"})
        };

        const payload = {      
            user: {
                id: user._id,
            },
        };

        jwt.sign(payload, process.env.jwtSecret, {expiresIn: 360000}, (err, token) => {
            if(err) throw err;
            res.status(201).json({token})
        });


    } catch(err) {
        console.error(err);
        res.status(500).json({msg: "Server Error"})
    }
});

//Fetching the user profile from the Database, including their cart and products inside it. 

router.get('/', async (req, res) => {
    //Find user by Id
    //req.user comtains the authenticated user's Id (usually set by JWT middleware)
    //User.findbyId(...) fteches the users full record from MongoDB.
    //.select excludes all sensitive info
    let user = await User.findById(req.user)
    .select("-password")

    //cart is from the userSchema and it loads the cart linked to the user
    //items is inside the cart and it loads the array of cart items.
    //product is inside each item and it loads full product data for each cart item.
    .populate({
        path: "cart",
        populate: {path: "items", populate: "product"},
    });
    // Send the fully populated user object back to the client as a JSON response.
    // The frontend can now display user info along with everything inside their cart, ready for chekout or browsing.
    res.json(user)
});

export default router