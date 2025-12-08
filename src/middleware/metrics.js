let totalRequests = 0;
let totalBytes = 0;
const startTime = Date.now();

export function metricsMiddleware(req, res, next) {
  totalRequests++;
  
  const originalSend = res.send;
  res.send = function(data) {
    if (data) {
      totalBytes += Buffer.byteLength(typeof data === 'string' ? data : JSON.stringify(data));
    }
    originalSend.call(this, data);
  };
  
  next();
}

export function getMetrics() {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const bandwidthMB = (totalBytes / 1024 / 1024).toFixed(2);
  const bandwidthGB = (totalBytes / 1024 / 1024 / 1024).toFixed(3);
  
  return {
    requests: totalRequests,
    bandwidth: `${bandwidthMB} MB`,
    bandwidth_gb: parseFloat(bandwidthGB),
    uptime: uptimeSeconds,
    estimated_cost: parseFloat(bandwidthGB) > 10 ? '$5+' : '$0',
    free_tier_remaining: `${Math.max(0, 10 - parseFloat(bandwidthGB)).toFixed(2)} GB`
  };
}
