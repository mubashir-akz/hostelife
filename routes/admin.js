const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.render('admin/index', {
        admin: true
    });
});



module.exports = router;