import { Registry, Counter, Gauge, Histogram } from "prometheus-client";

class MonitoringService {
  private static instance: MonitoringService;

  private registry: Registry;
  private activeConnections: Gauge;
  private messageCounter: Counter;
  private matchmakingLatency: Histogram;
  private messageLatency: Histogram;
  private queueDepth: Gauge;
  private errorCounter: Counter;

  private constructor() {
    this.registry = new Registry();

    // Active WebSocket connections
    this.activeConnections = new Gauge({
      name: "chattr_active_connections",
      help: "Number of active WebSocket connections",
      registers: [this.registry],
    });

    // Message counter
    this.messageCounter = new Counter({
      name: "chattr_messages_total",
      help: "Total number of messages processed",
      labelNames: ["type"],
      registers: [this.registry],
    });

    // Matchmaking latency
    this.matchmakingLatency = new Histogram({
      name: "chattr_matchmaking_duration_seconds",
      help: "Time taken to find a match",
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.registry],
    });

    // Message processing latency
    this.messageLatency = new Histogram({
      name: "chattr_message_processing_duration_seconds",
      help: "Time taken to process and deliver messages",
      buckets: [0.01, 0.05, 0.1, 0.5, 1],
      registers: [this.registry],
    });

    // Matchmaking queue depth
    this.queueDepth = new Gauge({
      name: "chattr_matchmaking_queue_depth",
      help: "Number of users waiting for matches",
      registers: [this.registry],
    });

    this.errorCounter = new Counter({
      name: "chattr_errors_total",
      help: "Total number of errors",
      labelNames: ["type"],
      registers: [this.registry],
    });
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // Connection metrics
  incrementConnections(): void {
    this.activeConnections.inc();
  }

  decrementConnections(): void {
    this.activeConnections.dec();
  }

  // Message metrics
  recordMessage(type: string): void {
    this.messageCounter.inc({ type });
  }

  // Matchmaking metrics
  startMatchmaking(): number {
    return Date.now();
  }

  endMatchmaking(startTime: number): void {
    const duration = (Date.now() - startTime) / 1000;
    this.matchmakingLatency.observe(duration);
  }

  // Message processing metrics
  startMessageProcessing(): number {
    return Date.now();
  }

  endMessageProcessing(startTime: number): void {
    const duration = (Date.now() - startTime) / 1000;
    this.messageLatency.observe(duration);
  }

  // Queue metrics
  updateQueueDepth(depth: number): void {
    this.queueDepth.set(depth);
  }

  recordError(type: string): void {
    this.errorCounter.inc({ type });
  }

  // Get metrics for Prometheus scraping
  async getMetrics(): Promise<string> {
    return await this.registry.metrics();
  }
}

// Export singleton instance
export const monitoring = MonitoringService.getInstance();
