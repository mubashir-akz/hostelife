const express = require('express');
const router = express.Router();
const guestHelpers = require('../helpers/guestHelpers')
const passport = require('passport');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { Strategy } = require('passport');
const expressSession = require('express-session')
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
    res.render('Guest/login2', {})
});
router.get('/Register', loginValidating, (req, res) => {
    res.render('Guest/register')
});
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
    async function(req, res) {
        // Successful authentication, redirect home.
        // add to DataBase
        const data = await guestHelpers.addGoogle(req.user._json);
        console.log(data);
        req.session.users = data
        res.redirect('/home');
    }
);
router.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

router.get('/home', userValidating, async(req, res) => {
    let hostels = await guestHelpers.getHostelList()
    res.render('Guest/home', { title: 'Express', guest: true, hostels, name: req.session.users[0].name });
})
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }),
    async function(req, res) {
        console.log(req.user, '...............');
        const data = await guestHelpers.addFb(req.user._json)
        console.log(data);
        req.session.users = data
        res.redirect('/home')
    }
);

router.post('/guest-register', async(req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedPassword
    console.log(req.body);
    const val = await guestHelpers.addToDb(req.body);
    console.log(val);
    // if(val == false){
    res.json({ var: val })
        // } else {
        // res.json({var:true})
        // }
})
router.post('/guest-login', async(req, res) => {
    const add = await guestHelpers.verifyLogin(req.body)
    if (add.status != false) {
        req.session.users = add
    }
    res.json(add)
})
router.get('/logout', (req, res) => {
    req.session.users = ''
    req.logOut()
    res.redirect('/')
})


module.exports = router;