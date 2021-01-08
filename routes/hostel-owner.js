var express = require('express');
var router = express.Router();
const hostelHelpers = require('../helpers/hostelHelpers')


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
  console.log(val);
  if (val.status != false) {
    req.session.hostelowner = val
  }
  console.log(req.session.hostelowner);
  res.json(val)
})
router.get('/profile', loginValidation, async (req, res) => {
  const data = await hostelHelpers.getData(req.session.hostelowner._id)
  console.log(data);
  if (data) {
    res.render('hostelOwner/profile2', { hostelowner: true, profile: true, data })
  } else {
    res.render('hostelOwner/profile', { hostelowner: true, profile: true })
  }
})
router.post('/addHostel', async (req, res) => {
  const image = req.files.image;
  image.mv('./public/hostel-images/' + req.session.hostelowner._id + '.jpg')
  req.body.ownerId = req.session.hostelowner._id
  const dataStore = await hostelHelpers.hostelAddToDb(req.body)
  res.redirect('/hostel/profile')
})
router.get("/editHostelProfile", async (req, res) => {
  const data = await hostelHelpers.getData(req.session.hostelowner._id)
  res.render('hostelOwner/editProfile', { hostelowner: true, profile: true, data })
})
router.post('/addEditedHostelInformations', async (req, res) => {
  console.log(req.body);
  req.body.ownerId = req.session.hostelowner._id
  const addToDb = hostelHelpers.addToUpdatedHostelProfile(req.body)
})






router.get('/logout', (req, res) => {
  req.session.hostelowner = ''
  req.logOut()
  res.redirect('/hostel')
})
module.exports = router;
