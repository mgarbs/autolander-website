(() => {'use strict';
 const data=window.MANUAL_DATA, pdfs=window.MANUAL_PDFS;
 const $=id=>document.getElementById(id);
 const byId=new Map(data.map(p=>[p.id,p]));
 let role='rep', current=null;
 const normalize=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const searchable=new Map(data.map(p=>[p.id,normalize(p.title+' '+p.deck+' '+document.getElementById(p.id).textContent)]));
 const rows=()=>data.filter(p=>p.role===role);
 const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function renderNav(){
  const terms=normalize($('search').value).split(' ').filter(Boolean);
  const matched=rows().filter(p=>terms.every(t=>searchable.get(p.id).includes(t)));
  let group='';
  $('toc').innerHTML=matched.map(p=>{const heading=group!==p.group?'<p class="nav-group">'+esc(p.group)+'</p>':'';group=p.group;return heading+'<a class="task-link" href="#'+p.id+'" '+(p.id===current?.id?'aria-current="page"':'')+'><span class="num">'+String(p.page).padStart(2,'0')+'</span><span>'+esc(p.title)+'</span></a>';}).join('');
  $('search-status').textContent=terms.length?`${matched.length} matching task${matched.length===1?'':'s'} in this guide`:'Choose a task below. Press / to search.';
  $('clear-search').hidden=!terms.length;
  $('no-results').hidden=matched.length!==0;
  $('articles').hidden=matched.length===0;
  document.querySelector('.page-nav').hidden=matched.length===0;
 }
 function setRole(next){
  role=next;
  document.querySelectorAll('[data-role][aria-pressed]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.role===role)));
  $('pdf-link').href=pdfs[role];
 }
 function show(id,scroll=true){
  const item=byId.get(id)||byId.get('rep--start');
  setRole(item.role);current=item;
  data.forEach(p=>$(p.id).hidden=p.id!==id);
  if(!byId.has(id))$(item.id).hidden=false;
  const list=rows(), pos=list.findIndex(p=>p.id===current.id);
  $('previous').disabled=pos===0;$('next').disabled=pos===list.length-1;
  $('page-count').textContent=`${role==='rep'?'Sales rep':'Manager'} guide · PDF page ${item.page}`;
  $('copy-status').textContent='';
  document.title=item.title+' · AutoLander Training';
  renderNav();
  if(scroll){$('main').scrollIntoView({behavior:'auto',block:'start'});$('main').focus({preventScroll:true});}
 }
 function go(id){if(location.hash.slice(1)===id)show(id);else location.hash=id;}
 document.querySelectorAll('[data-role][aria-pressed]').forEach(b=>b.addEventListener('click',()=>{
  $('search').value='';const same=b.dataset.role+'--'+current.key;go(byId.has(same)?same:b.dataset.role+'--start');
 }));
 $('search').addEventListener('input',renderNav);
 $('clear-search').addEventListener('click',()=>{$('search').value='';renderNav();$('search').focus();});
 $('toc').addEventListener('click',e=>{if(e.target.closest('a')){$('search').value='';renderNav();}});
 $('open-help').addEventListener('click',()=>{$('search').value='';go(role+'--quick-help');});
 $('previous').addEventListener('click',()=>{const list=rows();go(list[list.findIndex(p=>p.id===current.id)-1].id);});
 $('next').addEventListener('click',()=>{const list=rows();go(list[list.findIndex(p=>p.id===current.id)+1].id);});
 $('print').addEventListener('click',()=>window.print());
 $('copy-link').addEventListener('click',async()=>{
  const link=location.href.split('#')[0]+'#'+current.id;
  try{await navigator.clipboard.writeText(link);$('copy-status').textContent='Task link copied.';}
  catch{$('copy-status').textContent='Task reference: '+current.title+' (PDF page '+current.page+'). Use this page\'s address bar to copy its link.';}
 });
 document.addEventListener('keydown',e=>{
  if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();$('search').focus();}
  if(e.key==='Escape'&&document.activeElement===$('search')){$('search').value='';renderNav();$('search').blur();}
 });
 window.addEventListener('hashchange',()=>show(location.hash.slice(1)));
 show(location.hash.slice(1)||'rep--start',false);
})();
