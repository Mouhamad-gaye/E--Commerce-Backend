
//import jsonwebtoken library whcih allows verification, sign and decode jwt 
import jwt from 'jsonwebtoken'
//import dotenv module to read values from a .env file like jwtsecret
import dotenv from 'dotenv'


//Initialize dotenv to use process.env.jwtsecret
dotenv.config();

export default function (req, res, next) {
    //Pull token from request headers
    let token = req.header("token");

    //check if token exists, if not respond error
    if(!token) {
        res.status(401).json({msg: "No token, Auth denied"});
    };

    try {
        //verifies the token using the secret stored in your .env file
        //if token is invalid, this throws an error and jumps to the catch block
    const decoded = jwt.verify(token, process.env.jwtSecret);

    //extracts the user's ID from the decoded token payload and attaches it to req object
    // this assusmes the token has a payload like {user: {id: user._id}}
    req.user = decoded.user.id;

    next(); //go to route if everything chekcs out. the middleware calls next() so the request can move on to the actual route.
    
    } catch(err) {
        console.error(err)
        res.status(401).json({msg: "Invalid token"})
    }
}