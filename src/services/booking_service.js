const axios = require("axios");
const { StatusCodes } = require("http-status-codes");

const AppError = require("../utils/errors/app_error");
const { BookingRepository } = require("../repositories");
const { ServerConfig } = require("../config");

const db = require("../models");

async function createBooking(data) {
    return new Promise((resolve, reject) => {
        const result = db.sequelize.transaction(async function bookingIm(t) {
            const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
            const flightData = flight.data.data;
            if (data.noOfSeats > flightData.totalSeats) {
                reject(new AppError("Not enough seats available", StatusCodes.BAD_REQUEST));
            }
            resolve(true);
        });
    })
}


module.exports = {
    createBooking
}