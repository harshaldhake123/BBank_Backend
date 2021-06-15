const express = require("express");
const router = express.Router();
const bankController = require('../controllers/bank.controller');
const campController = require('../controllers/camp.controller');
const functionController = require('../controllers/bbAndStock.controller');
const checkAuth = require('../middleware/check-auth');

router.get("/",checkAuth,function(req,res){
    res.send("In Blood Bank");
});


router.get("/profile",checkAuth,bankController.profile);
router.put("/updateProfile",checkAuth,bankController.updateProfile);
router.get("/count",functionController.getCounts);

router.put("/updateStock",checkAuth,bankController.updateStock);
router.get("/getStockOfBank/:id",checkAuth,bankController.getStockOfBank);
router.get("/getRequestsFromUser",checkAuth,bankController.bloodRequestFromUser);
router.post("/validateBloodRequest",checkAuth,bankController.validateBloodRequest);
router.get("/getBloodBanks",checkAuth,functionController.allBankDetails);

router.get("/getCamp",checkAuth,campController.showCampByBank);
router.post("/showRegistrationForCamp",checkAuth,campController.showRegistrationForCamp);
router.post("/organizeCamp",checkAuth,campController.organizeCamp);

router.get("/getPlasmaDonors",checkAuth,functionController.getPlasmaDonors);


module.exports = router;
