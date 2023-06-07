const express = require("express");

const v1Routes = require("./v1")

const router = express.Router();


// whenever we get a url that starts with /api/v1 will redirect all request to v1Routes
router.use("/v1", v1Routes);

module.exports = router;
