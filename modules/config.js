// Made by Georgia Rachel. Persistent preferences, ephemeral browsing telemetry.
export const DEFAULTS = Object.freeze({blocking:true, phishing:true, monitoring:true, downloads:true, scanning:true, deniedHosts:[]});
export const LIMITS = Object.freeze({events:200, alerts:50, scans:30, downloads:50, buckets:60});
export function emptyState() { return {started:Date.now(), total:0, blocked:0, thirdParty:0, events:[], alerts:[], scans:[], downloads:[], buckets:[]}; }
