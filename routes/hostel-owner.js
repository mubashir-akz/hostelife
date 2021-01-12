var express = require('express');
var router = express.Router();
const hostelHelpers = require('../helpers/hostelHelpers')
const nodemailer = require('nodemailer')

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAILPASSWORD
  }
});

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
  await hostelHelpers.hostelAddToDb(req.body)
  res.redirect('/hostel/profile')
})
router.get("/editHostelProfile", async (req, res) => {
  const data = await hostelHelpers.getData(req.session.hostelowner._id)
  res.render('hostelOwner/editProfile', { hostelowner: true, profile: true, data })
})
router.post('/addEditedHostelInformations', async (req, res) => {
  console.log(req.files);
  const image = req.files.image
  image.mv('./public/hostel-images/' + req.session.hostelowner._id + '.jpg')
  console.log(req.body);
  req.body.ownerId = req.session.hostelowner._id
  const addToDb = await hostelHelpers.addToUpdatedHostelProfile(req.body)
  res.redirect('/hostel/profile')
})
router.get('/Guests', async (req, res) => {
  const data = await hostelHelpers.dataFromDb(req.session.hostelowner._id)
  console.log(data);
  res.render('hostelOwner/guests', { guestsAdd: true, hostelowner: true, data })
})
router.get('/addGuests', (req, res) => {
  res.render('hostelOwner/addGuests', { NumberExist: req.session.hostelowner.numberExistInGuestAdd, guestsAdd: true, hostelowner: true })
  req.session.hostelowner.numberExistInGuestAdd = ''
})

router.post('/addGuest', async (req, res) => {
  console.log(req.files);
  req.body.hostel = req.session.hostelowner._id;
  console.log(req.body);
  const image = req.files.idProof;
  const ops = await hostelHelpers.addGuestToDB(req.body)
  if (ops.status == false) {
    req.session.hostelowner.numberExistInGuestAdd = true;
    res.redirect('/hostel/addGuests')
  } else {
    image.mv('./public/guest-images/' + ops + '.jpg');
    const mailOption = {
      from: process.env.EMAIL,
      to: req.body.email,
      subject: 'Your Hostel registration is completed ',
      text: 'your email :' + req.body.email + '     your mobile:' + req.body.Guestname
    }
    transporter.sendMail(mailOption, (err, data) => {
      if (err) {
        console.log('have an error' + err);
        throw err;
      } else {
        console.log('mail send success');
      }
    })
    res.redirect('/hostel/guests')
  }
})

router.get('/roomManaging',(req,res)=>{
  res.render('hostelOwner/roomManaging',{hostelowner:true,room:true})
})



router.get('/logout', (req, res) => {
  req.session.hostelowner = ''
  req.logOut()
  res.redirect('/hostel')
})

module.exports = router;
