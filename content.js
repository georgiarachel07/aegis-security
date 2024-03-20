// Isolated-world script. Never reads or transmits password values or page text.
(() => {
  let warning=null, bypassed=false, timer, last='', lastCheck=0;
  async function check() {
    if(bypassed)return;
    const password=document.querySelector('input[type="password"]');
    let insecureAction=false;
    if(password?.form)try{insecureAction=new URL(password.form.action||location.href,location.href).protocol==='http:';}catch{}
    const signals={password:!!password,insecureAction};
    const signature=location.href+JSON.stringify(signals);
    if(signature===last&&Date.now()-lastCheck<30000)return;
    last=signature;lastCheck=Date.now();
    try{
      const reply=await chrome.runtime.sendMessage({type:'analyze',signals});
      if(reply?.ok&&reply.data.reasons.length&&!warning)show(reply.data.reasons);
      else if(reply?.ok&&!reply.data.reasons.length&&warning){warning.remove();warning=null;}
    }catch{/* Reload the page after reloading/updating the extension. */}
  }
  function show(reasons) {
    warning=document.createElement('aegis-security-warning');
    const shadow=warning.attachShadow({mode:'closed'});
    const style=document.createElement('style');
    style.textContent=':host{all:initial} dialog{box-sizing:border-box;max-width:600px;width:calc(100% - 32px);border:1px solid #f2b35f;border-radius:20px;padding:32px;background:#111b2b;color:#f6f8fc;font:16px/1.6 system-ui}dialog::backdrop{background:#060b16f2}h1{font-size:28px;line-height:1.2}button{padding:13px 18px;margin:8px 8px 0 0;border:1px solid #97a8bc;border-radius:8px;cursor:pointer;background:#f2b35f;color:#121923;font:600 15px system-ui}button+button{background:transparent;color:#f6f8fc}button:focus-visible{outline:3px solid white;outline-offset:3px}small{display:block;margin-top:24px;color:#c1cbd8}';
    const dialog=document.createElement('dialog');dialog.setAttribute('aria-labelledby','aegis-title');
    const heading=document.createElement('h1');heading.id='aegis-title';heading.textContent='Pause. Check this website.';
    const text=document.createElement('p');text.textContent='Aegis found a potential phishing signal. This heuristic can be wrong. Do not enter credentials until you verify the address.';
    const list=document.createElement('ul');reasons.forEach(reason=>{const li=document.createElement('li');li.textContent=reason;list.append(li);});
    const leave=document.createElement('button');leave.textContent='Leave this website';leave.onclick=()=>chrome.runtime.sendMessage({type:'leave'});
    const proceed=document.createElement('button');proceed.textContent='Continue at my own risk';proceed.onclick=()=>{bypassed=true;warning.remove();warning=null;};
    const credit=document.createElement('small');credit.textContent='Made by Georgia Rachel • A page warning, not a browser security boundary.';
    dialog.append(heading,text,list,leave,proceed,credit);shadow.append(style,dialog);document.documentElement.append(warning);
    dialog.addEventListener('cancel',event=>event.preventDefault());dialog.showModal();leave.focus();
  }
  function schedule(){clearTimeout(timer);timer=setTimeout(check,400);}
  if(document.documentElement){new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['type','action']});check();}
  document.addEventListener('DOMContentLoaded',check,{once:true});
  // Also catches SPA navigation and preference changes; avoids permanent trust exceptions.
  setInterval(check,5000);
})();
