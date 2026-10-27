import { useEffect, useState } from "react";
import {
  Activity, Bell, CheckCircle2, CircleAlert, Clock3, LayoutDashboard,
  RefreshCw, Server, ShieldCheck, Zap, ArrowUpRight, ExternalLink
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const initialServices = [
  { name: "User Service", status: "UP", latencyMs: 82, errorRate: 0.2, requestsPerMinute: 120, description: "User profiles and identity" },
  { name: "Order Service", status: "UP", latencyMs: 145, errorRate: 0.5, requestsPerMinute: 86, description: "Order creation and tracking" },
  { name: "Payment Service", status: "UP", latencyMs: 210, errorRate: 0.1, requestsPerMinute: 42, description: "Payment processing (simulated)" },
  { name: "Notification Service", status: "UP", latencyMs: 64, errorRate: 0, requestsPerMinute: 53, description: "Email and notification delivery (simulated)" }
];

function MetricCard({ icon: Icon, label, value, suffix, note, accent }) {
  return <div className="metric-card">
    <div className="metric-top"><span className={`metric-icon ${accent}`}><Icon size={18}/></span><span className="muted">{label}</span></div>
    <div className="metric-value">{value}<small>{suffix}</small></div>
    <div className="metric-note">{note}</div>
  </div>;
}

export default function App() {
  const [data, setData] = useState({ services: initialServices, summary: { total: 4, up: 4, down: 0, averageLatencyMs: 125 } });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [apiState, setApiState] = useState("connecting");

  async function refresh() {
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/services`);
      if (!response.ok) throw new Error(`API returned ${response.status}`);
      const result = await response.json();
      setData(result);
      setApiState("connected");
      setLastUpdated(new Date());
    } catch (err) {
      setApiState("offline");
      setMessage(`Cannot reach backend at ${API}. Start the Docker Compose stack and refresh.`);
    } finally { setLoading(false); }
  }

  async function simulate(service, action) {
    try {
      const response = await fetch(`${API}/api/demo/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Request failed");
      setMessage(result.message);
      await refresh();
    } catch (err) { setMessage(err.message); }
  }

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 10000);
    return () => clearInterval(timer);
  }, []);

  const summary = data.summary || { total: data.services.length, up: data.services.filter(s => s.status === "UP").length, down: data.services.filter(s => s.status === "DOWN").length, averageLatencyMs: 0 };
  const uptime = summary.total ? Math.round((summary.up / summary.total) * 100) : 0;

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Activity size={22}/></div><div><strong>Pulse<span>Watch</span></strong><small>OBSERVABILITY PLATFORM</small></div></div>
      <div className="nav-label">WORKSPACE</div>
      <div className="nav-item active"><LayoutDashboard size={18}/> Overview</div>
      <a className="nav-item" href="http://localhost:3001" target="_blank" rel="noreferrer"><Activity size={18}/> Grafana <ExternalLink size={13}/></a>
      <a className="nav-item" href="http://localhost:9090" target="_blank" rel="noreferrer"><Zap size={18}/> Prometheus <ExternalLink size={13}/></a>
      <div className="sidebar-bottom"><ShieldCheck size={18}/><div><strong>Monitoring active</strong><small>Local demo environment</small></div></div>
    </aside>
    <main className="main">
      <header className="topbar">
        <div><div className="eyebrow">OBSERVABILITY / OVERVIEW</div><h1>API Monitoring Dashboard</h1><p className="subtitle">Monitor health, performance and availability across your services.</p></div>
        <div className="top-actions"><span className={`connection ${apiState}`}><span className="dot"/> {apiState === "connected" ? "API Connected" : apiState === "offline" ? "API Offline" : "Connecting"}</span><button className="refresh" onClick={refresh} disabled={loading}><RefreshCw size={16} className={loading ? "spin" : ""}/> Refresh</button></div>
      </header>
      {message && <div className="notice"><span>{message}</span><button onClick={() => setMessage("")}>Dismiss</button></div>}
      <section className="metric-grid">
        <MetricCard icon={Server} label="TOTAL SERVICES" value={summary.total} suffix="" note="Services being monitored" accent="blue"/>
        <MetricCard icon={CheckCircle2} label="HEALTHY SERVICES" value={summary.up} suffix={` / ${summary.total}`} note="Responding normally" accent="green"/>
        <MetricCard icon={CircleAlert} label="DOWN SERVICES" value={summary.down} suffix="" note={summary.down ? "Needs attention" : "No active incidents"} accent="red"/>
        <MetricCard icon={Clock3} label="AVG. LATENCY" value={summary.averageLatencyMs} suffix=" ms" note="Simulated response time" accent="purple"/>
      </section>
      <section className="section-heading"><div><h2>Service health</h2><p>Live status refreshes every 10 seconds</p></div><span className="updated">Updated {lastUpdated.toLocaleTimeString()}</span></section>
      <section className="service-grid">
        {data.services.map(service => <article className="service-card" key={service.name}>
          <div className="service-card-head"><div className="service-symbol"><Server size={19}/></div><span className={`status ${service.status === "UP" ? "up" : "down"}`}><span className="dot"/>{service.status}</span></div>
          <h3>{service.name}</h3><p className="service-description">{service.description}</p>
          <div className="service-stats"><div><span>Latency</span><strong>{service.latencyMs} <small>ms</small></strong></div><div><span>Error rate</span><strong>{service.errorRate}%</strong></div><div><span>Requests/min</span><strong>{service.requestsPerMinute}</strong></div></div>
          <div className="health-track"><span style={{width: `${service.status === "UP" ? Math.max(10, 100 - service.errorRate * 10) : 8}%`}} className={service.status === "UP" ? "health-good" : "health-bad"}/></div>
          <div className="service-footer"><span>{service.status === "UP" ? "Operating normally" : "Incident detected"}</span><button className="text-button" onClick={() => simulate(service.name, service.status === "UP" ? "failure" : "recover")}>{service.status === "UP" ? "Simulate failure" : "Recover service"} <ArrowUpRight size={14}/></button></div>
        </article>)}
      </section>
      <section className="bottom-grid">
        <div className="panel"><div className="panel-heading"><div><h2>Availability summary</h2><p>Current service health distribution</p></div><Activity size={18}/></div>
          <div className="availability"><div className="availability-ring" style={{"--percent": `${uptime}%`}}><div><strong>{uptime}%</strong><span>UP</span></div></div><div className="legend"><div><span className="legend-dot green"/>Healthy <strong>{summary.up}</strong></div><div><span className="legend-dot red"/>Down <strong>{summary.down}</strong></div><div><span className="legend-dot gray"/>Total <strong>{summary.total}</strong></div></div></div>
        </div>
        <div className="panel"><div className="panel-heading"><div><h2>Monitoring stack</h2><p>Local observability tools</p></div><Bell size={18}/></div>
          <a className="tool-row" href="http://localhost:9090/targets" target="_blank" rel="noreferrer"><div className="tool-logo prometheus">P</div><div><strong>Prometheus</strong><small>Metrics collection and targets</small></div><span className="tool-open">Open ↗</span></a>
          <a className="tool-row" href="http://localhost:3001" target="_blank" rel="noreferrer"><div className="tool-logo grafana">G</div><div><strong>Grafana</strong><small>Dashboards and visualization</small></div><span className="tool-open">Open ↗</span></a>
          <div className="panel-foot">Metrics endpoint: <code>/metrics</code></div>
        </div>
      </section>
      <footer>PulseWatch · API Monitoring & Microservices Health Dashboard <span>Built for DevOps </span></footer>
    </main>
  </div>;
}
