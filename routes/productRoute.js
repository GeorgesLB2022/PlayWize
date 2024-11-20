const express = require('express')
const router = express.Router()
const {createProduct,getAllProducts,getProduct,updateProduct,deleteProduct} = require('../controllers/productController')


router.get('/:id', getProduct)
router.get('/',getAllProducts )
router.put('/:id',updateProduct )
router.delete('/:id',deleteProduct )
router.post('/', createProduct)



module.exports = router