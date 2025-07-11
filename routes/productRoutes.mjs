import express from 'express'
import Product from '../models/productSchema.mjs'


const router = express.Router();

router.post('/', async (req, res) => {
    const newProduct = await Product.insertOne(req.body);
    res.status(201).json(newProduct)

});
   
router.get('/', async (req, res) => {
    const allProduct= await Product.find({});
    res.json(allProduct);
});

router.put('/:id', async (req, res) => {
    let updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body,{new: true});
        res.json(updatedProduct);
});

router.delete('/:id', async (req, res) => {
    let deleteProduct = await Product.findByIdAndDelete(req.params.id);
    res.json(deleteProduct);
});

router.get('/', async (req, res) => {
    let getOne = await Product.findById(req.params.id);
    res.json(getOne)
});


export default router;