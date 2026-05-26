/* V101_REMOVED_ROUTE_LOCK_BUILD_HYGIENE */
(function(){
  var replacements=[[/^\/faq(?:\/|$)/,'/blog/'],[/^\/consult-motives(?:\/|$)/,'/consult/'],[/^\/consult-result(?:\/|$)/,'/consult/'],[/^\/provider-updates(?:\/|$)/,'/guaranteed/']];
  function repair(anchor){var href=anchor.getAttribute('href')||''; if(!href||href.indexOf('http')===0||href.indexOf('#')===0)return; for(var i=0;i<replacements.length;i++){if(replacements[i][0].test(href)){anchor.setAttribute('href',replacements[i][1]);anchor.setAttribute('data-v101-route-repaired','true');return;}}}
  document.addEventListener('DOMContentLoaded',function(){document.querySelectorAll('a[href]').forEach(repair);document.querySelectorAll('.v96-5-conversion-rail').forEach(function(el){el.setAttribute('hidden','hidden');});});
})();
