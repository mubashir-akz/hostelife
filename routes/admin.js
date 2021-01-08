const express = require('express')
const router = express.Router()
const adminHelpers = require('../helpers/admin-helpers')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')


let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAILPASSWORD
    }
});

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
    const data = { ...req.body }
    const mailOption = {
        from: process.env.EMAIL,
        to: req.body.email,
        subject: 'Your Hostelife registration is completed ',
        text: 'your password :' + req.body.password + 'your email:' + req.body.email
    }
    req.body.password = await bcrypt.hash(req.body.password, 10);
    console.log(req.body);
    const addToDb = await adminHelpers.addHostel(req.body)
    console.log(data);
    transporter.sendMail(mailOption, (err, data) => {
        if (err) {
            console.log('have an error' + err);
        } else {
            console.log('mail send success');
        }
    })
    res.json(addToDb)
})
router.get('/hostels', async (req, res) => {
    const hostels = await adminHelpers.getHostels()
    console.log(hostels);
    res.render('admin/hostels', { admin: true, hostel: true, hostels })
})


router.get('/logout', (req, res) => {
    req.session.admin = ''
    req.logOut()
    res.redirect('/admin')
})

module.exports = router;