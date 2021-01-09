const express = require('express');
const router = express.Router();
const guestHelpers = require('../helpers/guestHelpers')
const passport = require('passport');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { Strategy } = require('passport');
const expressSession = require('express-session')
const request = require('request')
let axios = require('axios')
let FormData = require('form-data');
var otp;
router.use(passport.initialize());
router.use(passport.session());
router.use(cookieSession({
    name: 'tuto-session',
    keys: ['key1', 'key2']
}))
router.use(expressSession({ secret: 'thisiskey' }))



function userValidating(req, res, next) {
    if (req.session.users) {
        next()
    } else {
        res.redirect('/')
    }
}

function loginValidating(req, res, next) {
    if (req.session.users) {
        res.redirect('/home')
    } else {
        next()
    }
}
require('../views/Guest/passport')
/* GET home page. */
router.get('/', loginValidating, (req, res, next) => {
    res.render('Guest/Login', {})
});
router.get('/Register', loginValidating, (req, res) => {
    res.render('Guest/register')
});
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
    async function (req, res) {
        // Successful authentication, redirect home.
        // add to DataBase
        const data = await guestHelpers.addGoogle(req.user._json);
        console.log(data);
        req.session.users = data
        res.redirect('/home');
    }
);
router.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

router.get('/home', userValidating, async (req, res) => {
    let hostels = await guestHelpers.getHostelList()
    res.render('Guest/home', { title: 'Express', guest: true, hostels, name: req.session.users[0].name });
})
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }),
    async function (req, res) {
        const data = await guestHelpers.addFb(req.user._json)
        console.log(data);
        req.session.users = data
        res.redirect('/home')
    }
);

router.post('/guest-register', async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedPassword
    const val = await guestHelpers.addToDb(req.body);
    // if(val == false){
    res.json({ var: val })
    // } else {
    // res.json({var:true})
    // }
})
router.post('/guest-login', async (req, res) => {
    const add = await guestHelpers.verifyLogin(req.body)
    if (add.status != false) {
        req.session.users = add
    }
    res.json(add)
})

router.get('/otp', (req, res) => {
    console.log(this.otp);
    const data = new FormData();
    data.append('mobile', `+917034339837`);
    data.append('sender_id', 'SMSINFO');
    data.append('message', 'Your otp code is {code}');
    data.append('expiry', '900');

    const config = {
        method: 'post',
        url: 'https://d7networks.com/api/verifier/send',
        headers: {
            Authorization: 'Token 278b0d5aec962cac55a52a07175ce33c5b6fc0db',
            ...data.getHeaders(),
        },
        data,
    };
    axios(config)
        .then((response) => {
            console.log(response);
            otp = response.data.otp_id;
            res.render('Guest/otp')
        })
        .catch(() => {
            // req.flash('error', 'No user with this number');
        });
})
router.post('/otp', (req, res) => {
    console.log(otp);
    let otp2 = req.body.otp
    const data = new FormData();
    data.append('otp_id', otp);
    data.append('otp_code', otp2);

    const config = {
        method: 'post',
        url: 'https://d7networks.com/api/verifier/verify',
        headers: {
            Authorization: 'Token 278b0d5aec962cac55a52a07175ce33c5b6fc0db',
            ...data.getHeaders(),
        },
        data: data,
    };
    axios(config)
        .then((response) => {
            console.log(response.data);
        })
        .catch(function (error) {
            // req.flash('error', 'Something went wrong');
            res.write('err')
        });
})





router.get('/logout', (req, res) => {
    req.session.users = ''
    req.logOut()
    res.redirect('/')
})


module.exports = router;