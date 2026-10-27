const express = require("express");
const cors = require("cors");
const client = require("prom-client");
const services = require("./services");
const ServiceEvent = require("./models/ServiceEvent");
const { sendFailureAlert } = require("./alerts");

const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true }));
app.use(express.json());

const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: "api_monitor_" });

const httpRequests = new client.Counter({
  name: "api_http_requests_total",
  help: "Total HTTP requests handled by this API",
  labelNames: ["method", "route", "status_code"],
  registers: [register]
});
const requestDuration = new client.Histogram({
  name: "api_http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route"],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register]
});
const serviceUp = new client.Gauge({
  name: "monitored_service_up",
  help: "Demo service status: 1 means UP, 0 means DOWN",
  labelNames: ["service"],
  registers: [register]
});
const serviceLatency = new client.Gauge({
  name: "monitored_service_latency_ms",
  help: "Simulated service latency in milliseconds",
  labelNames: ["service"],
  registers: [register]
});

function updateMetrics() {
  services.forEach((s) => {
    serviceUp.set({ service: s.name }, s.status === "UP" ? 1 : 0);
    serviceLatency.set({ service: s.name }, s.latencyMs);
  });
}
updateMetrics();

app.use((req, res, next) => {
  const end = requestDuration.startTimer();
  res.on("finish", () => {
    const route = req.route?.path || req.path || "unknown";
    httpRequests.inc({ method: req.method, route, status_code: String(res.statusCode) });
    end({ method: req.method, route });
  });
  next();
});

app.get("/", (req, res) => res.json({ name: "API Monitoring API", status: "healthy", docs: "/api/services" }));
app.get("/health", (req, res) => res.status(200).json({ status: "UP", timestamp: new Date().toISOString() }));

app.get("/api/services", (req, res) => {
  res.json({
    services: services.map(({ name, status, latencyMs, errorRate, requestsPerMinute, description }) =>
      ({ name, status, latencyMs, errorRate, requestsPerMinute, description })),
    summary: {
      total: services.length,
      up: services.filter((s) => s.status === "UP").length,
      down: services.filter((s) => s.status === "DOWN").length,
      averageLatencyMs: Math.round(services.reduce((sum, s) => sum + s.latencyMs, 0) / services.length)
    },
    updatedAt: new Date().toISOString()
  });
});

app.get("/api/history", async (req, res) => {
  try {
    if (ServiceEvent.db?.readyState === 1) {
      const events = await ServiceEvent.find().sort({ createdAt: -1 }).limit(50).lean();
      return res.json({ source: "mongodb", events });
    }
  } catch (err) {
    console.error("History query failed:", err.message);
  }
  res.json({ source: "demo", events: [] });
});

// Demo-only endpoints to test failure and recovery. Do not expose these publicly.
app.post("/api/demo/failure", async (req, res) => {
  const service = services.find((s) => s.name === req.body.service);
  if (!service) return res.status(404).json({ error: "Unknown service. Use an exact service name from /api/services." });
  const changed = service.status !== "DOWN";
  service.status = "DOWN";
  updateMetrics();
  try {
    if (ServiceEvent.db?.readyState === 1) await ServiceEvent.create({ service: service.name, status: "DOWN", message: "Manually simulated failure" });
  } catch (err) { console.error("Could not save event:", err.message); }
  if (changed) {
    try { await sendFailureAlert(service.name); }
    catch (err) { console.error("Email alert failed:", err.message); }
  }
  res.json({ message: `${service.name} marked DOWN (demo only)`, service });
});

app.post("/api/demo/recover", async (req, res) => {
  const service = services.find((s) => s.name === req.body.service);
  if (!service) return res.status(404).json({ error: "Unknown service. Use an exact service name from /api/services." });
  service.status = "UP";
  updateMetrics();
  try {
    if (ServiceEvent.db?.readyState === 1) await ServiceEvent.create({ service: service.name, status: "UP", message: "Service recovered in demo" });
  } catch (err) { console.error("Could not save event:", err.message); }
  res.json({ message: `${service.name} marked UP (demo only)`, service });
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

module.exports = app;
