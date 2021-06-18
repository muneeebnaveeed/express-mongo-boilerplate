const router = require('express').Router();

const {
    getProducts,
    getProduct,
    editProduct,
    addProduct,
    deleteProducts,
    addProducts,
    deleteProduct,
} = require('../controllers/products');

router.route('/').get(getProducts);
router.route('/:id').get(getProduct);
router.route('/').post(addProduct);
router.route('/bulk').post(addProducts);
router.route('/:id').patch(editProduct);
router.route('/id/:id').delete(deleteProduct);
router.route('/bulk').delete(deleteProducts);

module.exports = router;
