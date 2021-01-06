var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/home', function(req, res, next) {
  res.render('hostelOwner/home',{hostelowner:true});
});
router.get('',(req,res)=>{
  res.render('hostelOwner/login')
})
router.post('/register',(req,res)=>{
  console.log(req.body);
})

module.exports = router;
