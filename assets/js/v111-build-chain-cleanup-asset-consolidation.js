/* V111 BUILD CHAIN CLEANUP / ASSET CONSOLIDATION PATCH */
(function(){
  var d=document;
  d.documentElement.dataset.v111Runtime='active';
  var expectedVendors=['sk-holdings','zakum','udt','queenbee','ddangkong','anybet'];
  var qa={version:'V111',ready:true,checkedAt:new Date().toISOString(),vendors:0,tools:0,removedRoutes:['faq','consult-motives','consult-result','provider-updates']};
  try{
    qa.vendors=expectedVendors.filter(function(v){return !!d.querySelector('a[href="/guaranteed/'+v+'/"]');}).length;
    qa.tools=d.querySelectorAll('[data-v103-open], [data-v73-tool], .v73-tool-card').length;
    window.__RUST_V111_QA__=qa;
  }catch(e){window.__RUST_V111_QA__={version:'V111',ready:false,error:String(e&&e.message||e)};}
})();
