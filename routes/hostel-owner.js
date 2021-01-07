var express = require('express');
var router = express.Router();
const hostelHelpers = require('../helpers/hostelHelpers')
const base64 = require('base64-to-image')
function loginValidation(req, res, next) {
  if (req.session.hostelowner) {
    next()
  } else {
    res.redirect('/hostel')
  }
}
function homeValidate(req, res, next) {
  if (req.session.hostelowner) {
    res.redirect('/hostel/home')
  } else {
    next()
  }
}
/* GET users listing. */
router.get('/', homeValidate, (req, res) => {
  res.render('hostelOwner/login')
})
router.get('/home', loginValidation, function (req, res, next) {
  res.render('hostelOwner/home', { hostelowner: true, dashboard: true });
});
router.post('/login', async (req, res) => {
  console.log(req.body);
  const val = await hostelHelpers.loginValidation(req.body)
  req.session.hostelowner = val
  res.json(val)
})
router.get('/profile', loginValidation, (req, res) => {
  console.log(req.session.hostelowner);
  res.render('hostelOwner/profile', { hostelowner: true, profile: true })
})
router.post('/addHostel', (req, res) => {
  console.log(req.files,'ll');
  console.log(req.body);
})







router.get('/logout', (req, res) => {
  req.session.hostelowner = ''
  req.logOut()
  res.redirect('/hostel')
})
module.exports = router;
