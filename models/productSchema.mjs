import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    //Distinct title
    title: {type: String, required: true, unique: true},
    //
    category: {type: String, required: true, enum: ["Clothing", "Electronics", "Shoes"]},
    //Cost of products
    price: {type: Number, required: true},
    //Optional to drescribe the product
    description: {type: String},
    // Inventory Logi to indicate how many are available 
    quantity: {type: Number, required: true},
    // URL pointing the product image
    img: {type: String, required: true},
});

////Converts the schema into a usable model called " User"
// This model allows to interact with the users collection in the database.
export default mongoose.model("Product", productSchema)