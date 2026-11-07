// A detection ratio is evidence, never a probability of safety.
export function verdict(attributes={}) {
  const stats=attributes.stats||attributes.last_analysis_stats||{};
  const n=key=>Number.isFinite(stats[key])&&stats[key]>0?Math.floor(stats[key]):0;
  const malicious=n('malicious'), suspicious=n('suspicious');
  const total=['malicious','suspicious','harmless','undetected'].reduce((sum,k)=>sum+n(k),0);
  const pending=attributes.status && attributes.status!=='completed';
  return {status:pending?'Pending':!total?'Unknown':malicious?'Malicious detections':suspicious?'Suspicious detections':'No detections reported',malicious,suspicious,total,flaggedPercent:(!pending&&total)?Math.round((malicious+suspicious)/total*100):null,analyzedAt:attributes.last_analysis_date||attributes.date||null};
}
