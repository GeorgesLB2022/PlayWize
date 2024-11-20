const express = require('express')
const router = express.Router()
const {addItemToCart,
    removeItemFromCart,
    updateItemQuantity,
    applyCartDiscount,
    getCart,} = require('../controllers/cartController')


router.get('/:userId', getCart)
router.post('/apply/discount', applyCartDiscount)
router.put('/update/qty', updateItemQuantity)
router.post('/remove/item', removeItemFromCart)
router.post('/', addItemToCart)



module.exports = router