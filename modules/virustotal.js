import {httpURL} from './urls.js';
import {verdict} from './verdict.js';
const BASE='https://www.virustotal.com/api/v3';
export async function requestVT(path,options={}) {
  const {apiKey,lastVT=0}=await chrome.storage.session.get(['apiKey','lastVT']);
  if(!apiKey) throw new Error('Add your VirusTotal API key first.');
  if(Date.now()-lastVT<16000) throw new Error('Please wait 16 seconds between VirusTotal requests. Your account may have additional limits.');
  await chrome.storage.session.set({lastVT:Date.now()});
  const response=await fetch(BASE+path,{...options,credentials:'omit',redirect:'error',headers:{'x-apikey':apiKey,...options.headers},signal:AbortSignal.timeout(20000)});
  if(response.status===404) return null;
  if(response.status===429) throw new Error('VirusTotal quota reached. Wait before retrying.');
  if(response.status===401||response.status===403) throw new Error('VirusTotal rejected the key or this account lacks access.');
  if(!response.ok) throw new Error('VirusTotal request failed (HTTP '+response.status+').');
  return response.json();
}
export async function submitURL(value) {
  const url=httpURL(value).href;
  const data=await requestVT('/urls',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({url}).toString()});
  if(!data?.data?.id) throw new Error('VirusTotal returned no analysis ID.');
  return {analysisId:data.data.id,status:'Pending',host:new URL(url).hostname,kind:'URL',flaggedPercent:null};
}
export async function lookupHash(hash) {
  if(typeof hash!=='string'||!/^[a-f0-9]{64}$/i.test(hash)) throw new Error('Expected a SHA-256 file hash.');
  const data=await requestVT('/files/'+hash);
  return {kind:'File hash',hash,status:'Unknown',flaggedPercent:null,...(data?verdict(data.data.attributes):{})};
}
export async function refreshAnalysis(id) {
  if(typeof id!=='string'||id.length>300) throw new Error('Invalid analysis ID.');
  const data=await requestVT('/analyses/'+encodeURIComponent(id));
  if(!data) throw new Error('Analysis no longer available. Submit again if appropriate.');
  return verdict(data.data.attributes);
}
