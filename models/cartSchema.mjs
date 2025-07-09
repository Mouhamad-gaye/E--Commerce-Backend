
//Import mongoose library so I can use it to define and interact with my mongoDB schema

import mongoose from 'mongoose'


//Single line item in the cart
const cartItemSchema = new mongoose.Schema(
    {
        //reference the prodcut in the database
    product: {type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true},
    //how many of that product are in the cart defaltu 1
    quantity: {type: Number, default: 1},
},
// each cartItem will not get its own mongoDB ID
{_id: false}
);

//The whole cart
const cartSchema = new mongoose.Schema({
    //Links this cart to a specific user 
    username: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    //holds the actual product and quatities
    items: [cartItemSchema],
});

//This line turns the schema into a Mongoose model so you can:
//Create new carts //Find carts by user //Add/remove items //Update quantities, etc.

export default mongoose.model("Cart", cartSchema)



// What You Can Do With This
// Add an item to a user’s cart

// Increase/decrease product quantity

// Fetch a cart and populate product details using .populate("items.product")

// Delete a cart when an order is placed