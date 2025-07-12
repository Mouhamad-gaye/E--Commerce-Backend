import express from 'express'
import auth from '../middleware/auth.mjs'
import User from '../models/userSchema.mjs'
import Cart from '../models/cartSchema.mjs'

const router = express.Router();

//Route meant to update user's cart when adding or removing a product by ID
//Post route protected by auth.
router.post('/:id', auth, async (req, res) => {
    try {
        //userID from the authenticated user object (usually decoded from JWT)
        const userId = req.user
        //productId from the URL
        const productId = req.params.id

        //Looks up the user in the user model and gets only the cart field.
        const user = await User.findById({_id: userId}).select('cart');
        if(!user) return res.status(400).json({msg: "User not found"});


        //Retrieves the user's cart based on the ID stored in user.cart
        const cart = await Cart.findById({_id: user.cart});
        //This code defines if the cart is empty
        if(cart.items.length == 0 && req.body.quantity > 0) {
            cart.items.push({product: productId, quantity: req.body.quantity})
        } else if (cart.items.length == 0 && req.body.quantity < 0) {
            return res.status(400).json({msg: "Cannot substract past 0"})
        };

        //Update cart if product already exists
        //Find the index of the product in the car(if it exists)
        let indexOf = cart.items.findIndex((obj) => obj.product == productId)

        // if the product isn't in the cart, add it
        if(indexOf == -1) {
            cart.items.push({product: productId, quantity: req.body.quantity})
        //if it already exist, update the quantity, remove from cart if quantity drops to 0 or less.
        } else {
            cart.items[indexOf].quantity += req.body.quantity;
            if(cart.items[indexOf].quantity <= 0) {
                cart.items.splice(indexOf, 1);
            }
        }
        //Save the cart and respond with the updated data
        await cart.save();
        res.json(cart)
    } catch(err) {
        console.error(err);
        res.status(500).json({msg: "Server Error"})
    }
});

//Get items in cart

router.get('/', auth, async (req, res) => {
try {
    //Gets the authenticated user's ID, likely set by the auth middleware after validating the token
const userId = req.user;

//Looks up the user in the database using the ID and use .select to retrieve on ly the cart field from the user document
const user = await User.findById({_id: userId}).select("cart");
//if no user is found, respond with a 400
if(!user) return res.status(400).json({msg: "User not found"});



//Finds the user's cart using the cart ID stored in their user document
//.populate replaces each product ID inside cart.items with a real product object
//Limits populated fields to only tile, price, description.
const cart = await Cart.findById({_id: user.cart}).populate("items.product", "title price description");
res.json(cart)

} catch(err) {
    console.error(err)
    res.status(500).json({msg: 'Server Error'})
}
})

export default router