const services = [
  { name: "User Service", status: "UP", latencyMs: 82, errorRate: 0.2, requestsPerMinute: 120, description: "User profiles and identity" },
  { name: "Order Service", status: "UP", latencyMs: 145, errorRate: 0.5, requestsPerMinute: 86, description: "Order creation and tracking" },
  { name: "Payment Service", status: "UP", latencyMs: 210, errorRate: 0.1, requestsPerMinute: 42, description: "Payment processing (simulated)" },
  { name: "Notification Service", status: "UP", latencyMs: 64, errorRate: 0.0, requestsPerMinute: 53, description: "Email and notification delivery (simulated)" }
];

module.exports = services;
