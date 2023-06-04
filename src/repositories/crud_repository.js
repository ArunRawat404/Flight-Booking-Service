// Controllers don't directly talk to models. Services have business logic, so they don't directly talk to models. Repository talks to models.

const { StatusCodes } = require("http-status-codes");

const AppError = require("../utils/errors/app_error");

class CrudRepository {
    constructor(model) {
        this.model = model;
    }

    // Insert queries
    async create(data) {
        const response = await this.model.create(data);
        return response;
    }

    // Delete queries
    async destroy(data) {
        const response = await this.model.destroy({
            where: {
                id: data
            }
        });
        // We will throw an error if we are unable to find a response
        console.log(response);
        if (!response) {
            throw new AppError("Not able to find the resource", StatusCodes.NOT_FOUND);
        }
        return response;
    }

    // Find query based on Primary Key
    async get(data) {
        const response = await this.model.findByPk(data);
        if (!response) {
            throw new AppError("Not able to find the resource", StatusCodes.NOT_FOUND);
        }
        return response;
    }


    // Find all queries 
    async getAll() {
        const response = await this.model.findAll();
        return response;
    }


    // Update queries, data -> {col: val, ....}
    async update(id, data) {
        const response = await this.model.update(data, {
            where: {
                id: id
            }
        });
        if (response[0] == 0) {
            throw new AppError("Not able to update the resource", StatusCodes.NOT_FOUND);
        }
        return response;
    }
}

module.exports = CrudRepository;