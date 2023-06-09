// Cron is a work schedule hypervisor that runs assignments at prescribed times. These activities are referred to as Cron jobs, and they are typically used to optimize security management or management.

const cron = require("node-cron");

const { BookingService } = require("../../services");

function scheduleCrons() {
    // for changing the status initiated and pending to cancelled after some time (30 min)
    cron.schedule('*/30 * * * *', async () => {
        await BookingService.cancelOldBooking();
    });
}

module.exports = scheduleCrons;