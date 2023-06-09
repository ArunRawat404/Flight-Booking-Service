const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");

const CrudRepository = require("./crud_repository");
const { Booking } = require("../models");

const { Enums } = require("../utils/common");
const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS;

class BookingRepository extends CrudRepository {
    constructor() {
        super(Booking);
    }

    async createBooking(data, transaction) {
        const response = await Booking.create(data, { transaction: transaction });
        return response;
    }

    async get(data, transaction) {
        const response = await Booking.findByPk(data, { transaction: transaction });
        if (!response) {
            throw new AppError("Not able to find the resource", StatusCodes.NOT_FOUND);
        }
        return response;
    }

    async update(id, data, transaction) {
        const response = await Booking.update(data, {
            where: {
                id: id
            }
        }, { transaction: transaction });
        if (response[0] == 0) {
            throw new AppError("Not able to update the resource", StatusCodes.NOT_FOUND);
        }
        return response;
    }

    async cancelOldBooking(timeStamp) {
        const response = Booking.update({ status: CANCELLED }, {
            where: {
                [Op.and]: [
                    {
                        createdAt: {
                            [Op.lt]: timeStamp
                        }
                    },
                    {
                        status: {
                            [Op.ne]: BOOKED
                        }
                    },
                    {
                        status: {
                            [Op.ne]: CANCELLED
                        }
                    }
                ]

            }
        });
        return response;
    }
}

module.exports = BookingRepository;