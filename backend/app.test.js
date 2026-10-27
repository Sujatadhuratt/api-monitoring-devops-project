const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("./app");

test("GET /health returns UP", async () => {
  const response = await request(app).get("/health");
  assert.equal(response.status, 200);
  assert.equal(response.body.status, "UP");
});

test("GET /api/services returns four demo services", async () => {
  const response = await request(app).get("/api/services");
  assert.equal(response.status, 200);
  assert.equal(response.body.services.length, 4);
  assert.equal(response.body.summary.total, 4);
});

test("GET /metrics exposes Prometheus metrics", async () => {
  const response = await request(app).get("/metrics");
  assert.equal(response.status, 200);
  assert.match(response.text, /monitored_service_up/);
});
