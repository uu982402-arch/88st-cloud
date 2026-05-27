import https from 'node:https';
const routes=['/','/blog/','/tools/','/guaranteed/','/consult/','/sports-check/','/search-guides/','/ops/'];
const timeoutMs=9000;
function get(route){
  return new Promise((resolve)=>{
    const req=https.get('https://88st.cloud'+route,{headers:{'user-agent':'RUST-V106-LiveQA/1.0'}},res=>{
      res.resume(); res.on('end',()=>resolve({route,status:res.statusCode,ok:res.statusCode>=200&&res.statusCode<400}));
    });
    req.setTimeout(timeoutMs,()=>{req.destroy(); resolve({route,status:0,ok:false,error:'timeout'});});
    req.on('error',e=>resolve({route,status:0,ok:false,error:e.message}));
  });
}
const results=await Promise.all(routes.map(get));
const failed=results.filter(r=>!r.ok);
console.log(JSON.stringify({checked_at:new Date().toISOString(),results},null,2));
if (failed.length) process.exit(1);
