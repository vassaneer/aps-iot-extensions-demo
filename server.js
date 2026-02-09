const express = require("express");
const { getPublicToken } = require("./services/aps.js");
const {
  getSensors,
  getChannels,
  getChannelsGraph,
  getSamples,
  getConstants,
  setConstants,
} = require("./services/iot.mocked.js");
const { PORT } = require("./config.js");

let app = express();
app.use(express.static("public"));

app.get("/auth/token", async function (req, res, next) {
  try {
    res.json(await getPublicToken());
  } catch (err) {
    next(err);
  }
});

app.get("/iot/sensors", async function (req, res, next) {
  try {
    res.json(await getSensors());
  } catch (err) {
    next(err);
  }
});

app.get("/iot/channels", async function (req, res, next) {
  try {
    res.json(await getChannels());
  } catch (err) {
    next(err);
  }
});

app.get("/iot/channels/graph", async function (req, res, next) {
  try {
    res.json(await getChannelsGraph());
  } catch (err) {
    next(err);
  }
});

app.get("/iot/samples", async function (req, res, next) {
  try {
    res.json(
      await getSamples(
        { start: new Date(req.query.start), end: new Date(req.query.end) },
        req.query.resolution,
      ),
    );
  } catch (err) {
    next(err);
  }
});

app.get("/iot/constants", (req, res) => {
  res.json(getConstants());
});

app.use(express.json());

app.post("/iot/constants", (req, res) => {
  const { L, S, E, C } = req.body;

  const updated = setConstants({ L, S, E, C });

  res.json({
    success: true,
    constants: updated,
  });
});
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err.message);
});

app.listen(PORT, function () {
  console.log(`Server listening on port ${PORT}...`);
});
