const express = require('express')
const router = express.Router()
const {addCategory,
    getAllCategories,
    getCategory,
    updateCategory,
    deleteCategory,} = require('../controllers/categoryController')


router.get('/:id',getCategory )
router.get('/', getAllCategories)
router.put('/:id',updateCategory )
router.delete('/:id', deleteCategory)
router.post('/',addCategory )



module.exports = router