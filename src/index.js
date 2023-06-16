const express = require("express");

const { ServerConfig, Queue } = require("./config");
const apiRoutes = require("./routes");
const CRON = require("./utils/common/cron_job");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// whenever we get a url that starts with /api will redirect all request to apiRoutes
app.use("/api", apiRoutes);

app.listen(ServerConfig.PORT, async () => {
    console.log(`Server is up and running on PORT ${ServerConfig.PORT}`);
    CRON();
    await Queue.connectQueue();
    console.log("Queue connected");
});

