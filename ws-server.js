/**
 * Simple telemetry WebSocket server.
 * ---------------------------------
 * Run with `node ws-server.js`. It emits mock sensor data every second so the
 * dashboard can be exercised without the actual ESP32 hardware.
 */

// Using CommonJS so we can invoke the file directly with `node`.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { WebSocketServer } = require("ws");

const PORT = Number(process.env.WS_PORT ?? 8080);

const randomFloat = (min, max, precision = 2) =>
  Number((min + Math.random() * (max - min)).toFixed(precision));

const createPayload = () => {
  const accel = [
    randomFloat(-2, 2),
    randomFloat(-2, 2),
    randomFloat(8, 11), // include gravity
  ];

  return {
    device: 1,
    status: "OK",
    battery: randomFloat(65, 100),
    mlxTemperature: randomFloat(35, 55),
    dsTemperature: randomFloat(40, 65),
    objectTemp: randomFloat(30, 55),
    ambientTemp: randomFloat(20, 35),
    accel,
    VB1: randomFloat(380, 410), // LVS
    VB2: randomFloat(400, 430), // Inverter
    VB3: randomFloat(360, 400), // Contacter
    orientation: [
      randomFloat(-5, 5, 1),
      randomFloat(-5, 5, 1),
      randomFloat(0, 360, 1),
    ],
    timestamp: new Date().toISOString(),
    statusMessage: "Live data from mock server",
  };
};

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (socket, request) => {
  console.log(`Client connected from ${request.socket.remoteAddress ?? "unknown"}`);

  socket.send(
    JSON.stringify({
      ...createPayload(),
      statusMessage: "Connected to ESP mock server",
    }),
  );

  const interval = setInterval(() => {
    if (socket.readyState === 1) {
      socket.send(JSON.stringify(createPayload()));
    }
  }, 1_000);

  socket.on("close", () => {
    clearInterval(interval);
    console.log("Client disconnected");
  });

  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

wss.on("listening", () => {
  console.log(`WebSocket server listening on ws://localhost:${PORT}`);
});

wss.on("error", (error) => {
  console.error("WebSocket server error:", error);
});


