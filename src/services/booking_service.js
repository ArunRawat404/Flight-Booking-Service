const axios = require("axios");
const { StatusCodes } = require("http-status-codes");

const AppError = require("../utils/errors/app_error");
const { BookingRepository } = require("../repositories");
const { ServerConfig, Queue } = require("../config");

const db = require("../models");

const { Enums } = require("../utils/common");
const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS;

const bookingRepository = new BookingRepository();

async function createBooking(data) {
    const transaction = await db.sequelize.transaction();
    try {
        const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
        const flightData = flight.data.data;
        if (data.noOfSeats > flightData.totalSeats) {
            throw new AppError("Not enough seats available", StatusCodes.BAD_REQUEST);
        }
        const totalBillingAmount = data.noOfSeats * flightData.price;
        const bookingPayload = { ...data, totalCost: totalBillingAmount };
        const booking = await bookingRepository.create(bookingPayload, transaction);

        await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`, {
            seats: data.noOfSeats
        });

        await transaction.commit();
        return booking;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

async function makePayment(data) {
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDetails = await bookingRepository.get(data.bookingId, transaction);
        // if booking status is cancelled
        if (bookingDetails.status == CANCELLED) {
            throw new AppError("The booking has expired", StatusCodes.BAD_REQUEST);
        }
        const bookingTime = new Date(bookingDetails.createdAt);
        const currentTime = new Date();
        // time period for booking has expired
        if (currentTime - bookingTime > 300000) {
            // making the status cancelled
            await cancelBooking(data.bookingId);
            throw new AppError("The booking has expired", StatusCodes.BAD_REQUEST);
        }
        if (bookingDetails.totalCost != data.totalCost) {
            throw new AppError("The amount of payment doesn't match", StatusCodes.BAD_REQUEST);
        }
        if (bookingDetails.userId != data.userId) {
            throw new AppError("The user corresponding to booking doesn't match", StatusCodes.BAD_REQUEST);
        }
        // we assume payment was successful
        await bookingRepository.update(data.bookingId, { status: BOOKED }, transaction);

        Queue.sendData({
            recipientEmail: "arunrawatjuly@gmail.com",
            subject: "Flight Booked",
            text: `Booking successfully done for the booking ${data.bookingId}`
        });

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

async function cancelBooking(bookingId) {
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDetails = await bookingRepository.get(bookingId, transaction);
        if (bookingDetails.status == CANCELLED) {
            transaction.commit();
            return true;
        }
        await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingDetails.flightId}/seats`, {
            seats: bookingDetails.noOfSeats,
            dec: 0
        });
        await bookingRepository.update(bookingId, { status: CANCELLED }, transaction);
        transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

async function cancelOldBooking() {
    try {
        // 5 min before currentTime
        const time = new Date(Date.now() - (1000 * 300));
        const response = await bookingRepository.cancelOldBooking(time);
        return response;
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    createBooking,
    makePayment,
    cancelOldBooking
}