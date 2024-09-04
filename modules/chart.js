export function drawTraffic(canvas,buckets) {
  const width=canvas.clientWidth||600,height=230,dpr=Math.min(devicePixelRatio||1,2);
  canvas.width=width*dpr;canvas.height=height*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);
  const minute=Math.floor(Date.now()/60000)*60000;
  const rows=Array.from({length:60},(_,i)=>buckets.find(b=>b.time===minute-(59-i)*60000)||{time:minute-(59-i)*60000,requests:0,blocked:0});
  const max=Math.max(4,...rows.flatMap(b=>[b.requests,b.blocked]));
  const left=38,right=width-12,top=15,bottom=195;
  c.font='11px system-ui';c.fillStyle='#a6b3c5';c.strokeStyle='#2b394c';
  for(let i=0;i<=4;i++){const y=top+(bottom-top)*i/4;c.beginPath();c.moveTo(left,y);c.lineTo(right,y);c.stroke();c.fillText(String(Math.round(max*(1-i/4))),0,y+4);}
  for(const [key,color,dash] of [['requests','#9be5c2',[]],['blocked','#f3bf76',[5,4]]]){
    c.strokeStyle=color;c.lineWidth=2;c.setLineDash(dash);c.beginPath();rows.forEach((b,i)=>{const x=left+i*(right-left)/59,y=bottom-b[key]/max*(bottom-top);i?c.lineTo(x,y):c.moveTo(x,y);});c.stroke();
  }
  c.setLineDash([]);c.fillText('59 min ago',left,220);c.fillText('Now',right-25,220);
  return rows;
}
