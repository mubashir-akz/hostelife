const express = require('express')
const router = express.Router()
const adminHelpers = require('../helpers/admin-helpers')
const bcrypt = require('bcrypt')
function adminValidate(req, res, next) {
    if (req.session.admin) {
        res.redirect('/admin/home')
    } else {
        next()
    }
}

function adminLogin(req, res, next) {
    if (req.session.admin) {
        next()
    } else {
        res.redirect('/admin')
    }
}
router.get('/', adminValidate, (req, res) => {
    res.render('admin/admin-login')
});

router.post('/', adminValidate, async (req, res) => {
    const re = await adminHelpers.adminValidation(req.body)
    if (re.status) {
        req.session.admin = re
    }
    console.log(re);
    res.json(re)
})

router.get('/home', adminLogin, (req, res) => {
    res.render('admin/index', { admin: true })
})

router.get('/add-hostels', adminLogin, (req, res) => {
    res.render('admin/add-hostel', { admin: true, addHostel: true })
})

router.post('/addHostel', async (req, res) => {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    console.log(req.body);
    const addToDb = await adminHelpers.addHostel(req.body)
    res.json(addToDb)
})





module.exports = router;