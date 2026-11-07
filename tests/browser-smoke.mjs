// Optional integration test with a fresh, isolated profile and a benign local fixture.
// Install Playwright and its Chromium browser, or supply PLAYWRIGHT_MODULE and BROWSER_EXE.
import {createRequire} from 'node:module';
import {mkdtemp,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=fileURLToPath(new URL('../',import.meta.url)), profile=await mkdtemp(join(process.env.PROFILE_ROOT||tmpdir(),'aegis-smoke-'));
const server=createServer((req,res)=>{
  if(req.url==='/fixture.zip'){
    // Harmless slow attachment, never executed or opened. Pause before it can finish.
    res.writeHead(200,{'Content-Type':'application/zip','Content-Disposition':'attachment; filename="fixture.zip"','Content-Length':4194304});
    const chunk=Buffer.alloc(65536);let sent=0;const timer=setInterval(()=>{res.write(chunk);sent+=chunk.length;if(sent>=4194304){clearInterval(timer);res.end();}},150);
    res.on('close',()=>clearInterval(timer));return;
  }
  res.writeHead(200,{'Content-Type':'text/html'});
  res.end(req.url==='/password'?'<form><label>Password <input type="password"></label></form>':'<h1>Benign Aegis fixture</h1>');
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let context;
try{
  context=await chromium.launchPersistentContext(profile,{channel:process.env.BROWSER_EXE?undefined:'chromium',executablePath:process.env.BROWSER_EXE||undefined,headless:true,ignoreDefaultArgs:['--disable-extensions'],args:['--disable-extensions-except='+root,'--load-extension='+root],viewport:{width:1440,height:1000}});
  const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker',{timeout:20000});
  const origin='chrome-extension://'+new URL(worker.url()).hostname;
  const dash=await context.newPage();const errors=[];dash.on('pageerror',e=>errors.push(e.message));
  await dash.goto(origin+'/dashboard.html');await dash.waitForFunction(()=>document.querySelector('#connection')?.textContent==='Monitoring active');
  assert.equal(await dash.locator('footer strong').textContent(),'Made by Georgia Rachel');
  const check=()=>worker.evaluate(async()=>chrome.declarativeNetRequest.testMatchOutcome({url:'https://ads.doubleclick.net/a.js',type:'script'}));
  assert.ok((await check()).matchedRules.length>0);await dash.locator('#toggle-blocking').uncheck();await dash.getByText('Starter blocking is paused.').waitFor();assert.equal((await check()).matchedRules.length,0);
  await dash.locator('#toggle-blocking').check();await dash.getByText('Starter blocking is active.').waitFor();
  const tab=await context.newPage(),url='http://127.0.0.1:'+server.address().port;
  await tab.goto(url);await tab.goto(url+'/password');await tab.locator('aegis-security-warning').waitFor({state:'attached'});
  // Dashboard intervals pause in hidden tabs; bringing it forward exercises visibility refresh.
  await dash.bringToFront();await dash.waitForFunction(()=>Number(document.querySelector('#total').textContent)>0&&Number(document.querySelector('#alert-count').textContent)>0);
  await tab.goto(url);await tab.evaluate(()=>{const link=document.createElement('a');link.href='/fixture.zip';link.download='fixture.zip';document.body.append(link);link.click();});
  await dash.bringToFront();await dash.getByText('Paused for review',{exact:true}).waitFor({timeout:20000});
  await dash.getByRole('button',{name:'Review source URL'}).first().click();assert.equal(await dash.locator('#scan-url').inputValue(),url+'/fixture.zip');assert.equal(await dash.locator('#consent').isChecked(),false);
  await dash.getByRole('button',{name:'Cancel download'}).first().click();await dash.getByText('Cancelled',{exact:true}).first().waitFor();
  for(const width of [1440,768,375]){await dash.setViewportSize({width,height:1000});assert.ok(await dash.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Page overflows at '+width);}
  if(process.env.SCREENSHOT_DIR){await mkdir(process.env.SCREENSHOT_DIR,{recursive:true});await dash.setViewportSize({width:1440,height:1000});await dash.screenshot({path:resolve(process.env.SCREENSHOT_DIR,'dashboard.png')});}
  assert.deepEqual(errors,[]);console.log('PASS: unpacked service worker, dashboard, real rule engine, settings, local HTTP traffic, phishing overlay, mobile/tablet/desktop layout.');
}finally{await context?.close();await new Promise(resolve=>server.close(resolve));}
