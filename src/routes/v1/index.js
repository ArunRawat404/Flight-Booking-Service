const express = require("express");

const { InfoController } = require("../../controllers")
const bookingRoutes = require("./booking_routes");

const router = express.Router();

// /api/v1/info
router.get("/info", InfoController.info);

router.use("/bookings", bookingRoutes);

module.exports = router;
