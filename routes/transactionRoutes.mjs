import express from 'express'
import Stripe from 'stripe'
import auth from '../middleware/auth.mjs'
import Cart from '../models/cartSchema.mjs'
import Product from '../models/productSchema.mjs'
import Transaction from '../models/transactionSchema.mjs'
import dotenv from 'dotenv'

dotenv.config();
const router = express.Router();

const stripe = process.env.stripeKey;

//Checkout & create transaction
//Define post route/endpoint named checkout
router.post('/checkout', auth, async (req, res) => {
    try {
        //Get user's ID from the auth middleware(decoded from JWT)
        const userId = req.user;

        //Load the user's cart
        //Look to the user cart and populate item data, including referenced product
        const cart = await Cart.findOne({username: userId}).populate('items.product');
        //Validate that the cart exists and isn't empty. Return an error if no items are found
        if(!cart || cart.items.length === 0) {
            return res.status(400).json({msg: "Cart is empty"});
        };


        //Calculate total Amount
        //Iterates through each item and computes the full total by multiplying price x quantity.
        const totalAmount = cart.items.reduce((acc, item) => {
            return acc + item.product.price * item.quantity;
        }, 0);

        //Create Stripe Payment intent
        //Send payment request to Stripe with the calculated amount(in cents)
        //Use payment method sent from the frontend(paymentMehtodId)
        //Confirm submits the payment immidiately
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100),
            currency: 'usd',
            payment_method: req.body.paymentMethodId,
            confirm: true
        });

        //Build itemsPurchased snapshot
        //Converts cart items into a record for transaction history
        //Svaes the quantity and price at purchase time to preserve historical accuaracy
        const itemsPurchased = cart.items.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
            priceAtPurchase: item.product.price
        }));

        //Save transaction to DB 
        //Trasnaction document includes: user info, cart reference, stripe transaction ID, payment and shipping details, all puchased items.
        const transaction = new Transaction({
            user: userId,
            cart: cart._id,
            totalAmount, 
            transactionId: paymentIntent.id,
            paymentMethod: req.body.method || "card",
            status: "completed",
            shippingAddress: req.body.shippingAddress,
            billingAddress: req.body.billingAddress,
            itemsPurchased

        });
        //Persist the transaction into the database
        await transaction.save();

        //Clear cart
        //Empties the user cart now that the purchase is complete
        cart.items = [];
        await cart.save();

        res.status(201).json({msg: "Payment successfully & transaction recorded"})


    } catch(err) {
        console.error(err);
        res.status(500).json({msg: "Payment failed"})
    }
})

export default router


//Secure payment handling via Stripe
//Accurante transaction records with item snapshots
//Cart cleanup after successfull checkout
//Easy expansion for refunds or status updates