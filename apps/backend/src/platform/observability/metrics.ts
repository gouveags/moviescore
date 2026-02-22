type RequestMetricSample = {
  durationMs: number;
  method: string;
  path: string;
  status: number;
};

type CounterKey = string;

const durationBuckets = [10, 25, 50, 100, 250, 500, 1000, 2500];
const requestCounts = new Map<CounterKey, number>();
const requestDurationCounts = new Map<CounterKey, number>();
const requestDurationSums = new Map<CounterKey, number>();
const requestDurationBuckets = new Map<string, number>();

const makeCounterKey = (sample: Omit<RequestMetricSample, "durationMs">): CounterKey =>
  `${sample.method}|${sample.path}|${sample.status}`;

const parseCounterKey = (value: CounterKey): Omit<RequestMetricSample, "durationMs"> => {
  const [method = "UNKNOWN", path = "unknown", status = "0"] = value.split("|");
  return { method, path, status: Number(status) };
};

const metricLabels = (sample: Omit<RequestMetricSample, "durationMs">): string =>
  `method="${sample.method}",path="${sample.path}",status="${sample.status}"`;

const bucketLabel = (
  sample: Omit<RequestMetricSample, "durationMs">,
  bucketUpperBound: number,
): string => `${metricLabels(sample)},le="${bucketUpperBound}"`;

const increment = (store: Map<string, number>, key: string, by = 1): void => {
  store.set(key, (store.get(key) ?? 0) + by);
};

export const recordHttpRequestMetrics = (sample: RequestMetricSample): void => {
  const key = makeCounterKey(sample);

  increment(requestCounts, key);
  increment(requestDurationCounts, key);
  increment(requestDurationSums, key, sample.durationMs);

  for (const bucket of durationBuckets) {
    if (sample.durationMs <= bucket) {
      increment(requestDurationBuckets, bucketLabel(sample, bucket));
    }
  }
  increment(requestDurationBuckets, `${metricLabels(sample)},le="+Inf"`);
};

export const renderPrometheusMetrics = (): string => {
  const lines: string[] = [
    "# HELP moviescore_http_requests_total Total HTTP requests served.",
    "# TYPE moviescore_http_requests_total counter",
  ];

  for (const [key, value] of requestCounts.entries()) {
    lines.push(`moviescore_http_requests_total{${metricLabels(parseCounterKey(key))}} ${value}`);
  }

  lines.push(
    "# HELP moviescore_http_request_duration_ms Request duration histogram in milliseconds.",
    "# TYPE moviescore_http_request_duration_ms histogram",
  );

  for (const [bucketKey, value] of requestDurationBuckets.entries()) {
    lines.push(`moviescore_http_request_duration_ms_bucket{${bucketKey}} ${value}`);
  }

  for (const [key, value] of requestDurationCounts.entries()) {
    lines.push(
      `moviescore_http_request_duration_ms_count{${metricLabels(parseCounterKey(key))}} ${value}`,
    );
  }

  for (const [key, value] of requestDurationSums.entries()) {
    lines.push(
      `moviescore_http_request_duration_ms_sum{${metricLabels(parseCounterKey(key))}} ${value}`,
    );
  }

  lines.push("");
  return lines.join("\n");
};
