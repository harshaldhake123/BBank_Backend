const express = require("express");
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const checkAuth = require('../middleware/check-auth');

router.get("/",function(req,res){
    res.send("In Admin Section");
});

router.get("/validateBloodBanks",checkAuth, adminController.invalidBankDetails);
router.put("/setvalidebank/:id",checkAuth,adminController.setValidBloodbank);

module.exports = router;