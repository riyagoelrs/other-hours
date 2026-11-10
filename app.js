'use strict';
// One line to change the working product name across the visible UI.
const BRAND_NAME = 'other hours';
document.querySelectorAll('[data-brand]').forEach(node => { node.textContent = BRAND_NAME; });

// All curated project, place and community data live in data.js.
const $ = s => document.querySelector(s);
const escapeHtml = (input='') => String(input).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const storage = {get(k, fallback){try{let x=JSON.parse(localStorage.getItem(k));return x ?? fallback;}catch{return fallback;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}};
let currentFilter='all', currentQuery='', currentMode='idea', sourceUrl='', onlySaved=false, toastTimer;
let linkedProjectSlug='', linkBusy=false, showAllPlaces=false, showAllCommunities=false;
const getSaved = () => storage.get('oh:saved',[]);
const isSaved = slug => getSaved().includes(slug);
const checkedFor = slug => storage.get('oh:checked:'+slug,[]);
const notify = msg => {const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3100);};
const save = slug => {const saved=getSaved();storage.set('oh:saved',saved.includes(slug)?saved.filter(x=>x!==slug):[...saved,slug]);renderSavedCount();renderProjects();if($('#detail-root .detail-overlay'))renderDetail(slug);};
const renderSavedCount = () => {$('#saved-count').textContent=getSaved().length;};

function art(type){
 const stroke='stroke="#372e28" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';
 const shapes={
  journal:`<g transform="rotate(-11 200 175)"><rect x="105" y="52" width="189" height="248" rx="7" fill="#8f422e" ${stroke}/><path d="M129 55v242" ${stroke} fill="none"/><path d="M123 74l10 11-10 11 10 11-10 11 10 11-10 11 10 11-10 11 10 11" fill="none" stroke="#e5b893" stroke-width="3"/><text x="206" y="153" fill="#f0ddc7" font-family="Georgia" font-size="26" text-anchor="middle" font-style="italic">notes to</text><text x="206" y="182" fill="#f0ddc7" font-family="Georgia" font-size="26" text-anchor="middle" font-style="italic">self.</text></g><path d="M66 290c-20-30 20-38 30-15s20 22 23 5" fill="none" stroke="#f2d6ad" stroke-width="5"/>`,
  denim:`<g transform="rotate(10 200 200)"><path d="M122 56h163l-6 91 9 166h-77l-12-129-13 129h-75l8-168z" fill="#6987af" ${stroke}/><path d="M122 110h162M156 56v49m81-49v49M158 144h79M178 167l46-15 5 46-48 12z" fill="none" ${stroke}/><path d="M174 183l7 10 10-22 8 22 8-17 8 14" fill="none" stroke="#f3bf77" stroke-width="4"/></g>`,
  tote:`<g transform="rotate(-8 200 200)"><path d="M106 131h188l-12 192H117z" fill="#e5baa2" ${stroke}/><path d="M155 139V94c0-53 86-53 86 0v46" fill="none" ${stroke} stroke-width="9"/><path d="M157 148V97c0-43 81-43 81 0v51" fill="none" stroke="#f4dfce" stroke-width="5"/><text x="200" y="228" text-anchor="middle" font-family="Georgia" font-size="23" fill="#7a4d41" font-style="italic">make</text><text x="200" y="253" text-anchor="middle" font-family="Georgia" font-size="23" fill="#7a4d41" font-style="italic">things.</text></g>`,
  clay:`<ellipse cx="200" cy="280" rx="115" ry="24" fill="#d69f59" opacity=".4"/><path d="M91 166c11 68 30 102 109 102s104-35 109-102" fill="#d69f59" ${stroke}/><ellipse cx="200" cy="166" rx="110" ry="44" fill="#efc47f" ${stroke}/><ellipse cx="200" cy="160" rx="80" ry="25" fill="#d69f59" opacity=".7"/><path d="M119 192c16 29 43 46 82 47" fill="none" stroke="#f7d8a2" stroke-width="5"/>`,
  patch:`<g transform="rotate(10 200 200)"><circle cx="200" cy="191" r="119" fill="#f1dfcc" ${stroke}/><circle cx="200" cy="191" r="100" fill="#e7c3e8" ${stroke}/><path d="M201 260v-77M200 217c-26-22-42-15-50-39M198 223c30-22 48-12 54-39" fill="none" stroke="#496a47" stroke-width="5"/><g fill="#df6651" ${stroke}><ellipse cx="200" cy="162" rx="15" ry="34"/><ellipse cx="200" cy="162" rx="15" ry="34" transform="rotate(60 200 162)"/><ellipse cx="200" cy="162" rx="15" ry="34" transform="rotate(120 200 162)"/></g><circle cx="200" cy="162" r="13" fill="#e6ac55" ${stroke}/></g>`,
  beads:`<path d="M95 101c-12 80 15 144 79 177 53 28 108-20 130-93" stroke="#4e4941" stroke-width="5" fill="none"/><g stroke="#4e4941" stroke-width="2.5"><circle cx="101" cy="129" r="18" fill="#f4a68d"/><circle cx="102" cy="167" r="18" fill="#f5d980"/><circle cx="118" cy="205" r="18" fill="#c8abd5"/><circle cx="143" cy="241" r="18" fill="#f3a897"/><circle cx="176" cy="268" r="18" fill="#f7d980"/><circle cx="215" cy="273" r="18" fill="#c8d8ca"/><circle cx="251" cy="251" r="18" fill="#c9a7d9"/><circle cx="280" cy="218" r="18" fill="#e7906c"/><circle cx="293" cy="180" r="18" fill="#f6d47e"/><circle cx="291" cy="142" r="18" fill="#a4b5db"/></g><path d="M98 94l0-30m-11 16h22" stroke="#4e4941" stroke-width="4"/>`
 };
 return `<svg class="project-art-svg" viewBox="0 0 400 380" role="img" aria-label="Illustration of a ${escapeHtml(type)} project"><path d="M35 54q130-25 290 14M39 316q152 37 326 2" stroke="#fff" stroke-width="1" opacity=".35" fill="none"/>${shapes[type]||`<circle cx="200" cy="184" r="116" fill="none" stroke="#493e36" stroke-width="2" stroke-dasharray="3 10"/><circle cx="200" cy="184" r="92" fill="#fff8"/><text x="200" y="176" font-family="Georgia,serif" font-size="27" font-style="italic" fill="#493e36" text-anchor="middle">${escapeHtml(type.replaceAll('-', ' ').slice(0,22))}</text><path d="M152 201q48 36 96 0" fill="none" stroke="#493e36" stroke-width="2"/>`}</svg>`;
}
function projectCard(p,i){return `<article class="project-card" tabindex="0" role="button" aria-label="Open ${escapeHtml(p.title)}" data-open="${p.slug}"><div class="project-visual ${p.accent}"><span class="visual-index">PROJECT / ${String(i+1).padStart(2,'0')}</span>${art(p.visual)}<button class="bookmark ${isSaved(p.slug)?'selected':''}" aria-label="${isSaved(p.slug)?'Unsave':'Save'} ${escapeHtml(p.title)}" data-save="${p.slug}" aria-pressed="${isSaved(p.slug)}">${isSaved(p.slug)?'♥':'♡'}</button></div><div class="card-info"><span class="card-category">${p.label} <span>↗</span></span><h3>${escapeHtml(p.title)}</h3><div class="card-bottom"><span>${p.time}</span><span>START AT ~ $${p.budgetMin}*</span></div></div></article>`;}
function scoredProjects(query){
 const stop=new Set(['want','make','learn','some','from','this','that','with','could','like','video','craft','thing','look','seems','looks','about','handmade','diy','really','please','how','tutorial','first','beginner','easy','step','steps','homemade','aesthetic','project','making']);
 const words=query.toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s-]/g,' ').split(/\s+/).filter(w=>w.length>2&&!stop.has(w)).map(w=>w.replace(/(ing|ies|es|s)$/,'').slice(0,20));
 if(!words.length)return projects.map(p=>({p,score:0}));
 return projects.map(p=>{
   const title=p.title.toLowerCase(),tags=p.tags.join(' ').toLowerCase(),intro=p.intro.toLowerCase();
   let score=0;
   for(const w of words){if(title.includes(w))score+=6; if(p.tags.some(t=>t.toLowerCase().includes(w)))score+=4; if(intro.includes(w))score+=0.6;}
   const exact=p.tags.some(t=>t.toLowerCase().length>4&&query.toLowerCase().includes(t.toLowerCase()));
   if(exact)score+=8;
   return {p,score};
 }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
}
function relevantProjects(query){return scoredProjects(query).map(x=>x.p);}
function renderProjects(){let list=relevantProjects(currentQuery);if(onlySaved)list=list.filter(p=>isSaved(p.slug));if(currentFilter==='under30')list=list.filter(p=>p.budgetMin<30);else if(currentFilter!=='all')list=list.filter(p=>p.category===currentFilter);$('#project-grid').innerHTML=list.map((p,i)=>projectCard(p,i)).join('');$('#empty-state').hidden=list.length!==0;$('#project-grid').hidden=list.length===0;$('.projects-section .section-top h2').innerHTML=onlySaved?'Your <em>saved things.</em>':currentQuery?'Your next <em>rabbit hole.</em>':'What are you <em>into?</em>';
}
function renderPlaces(){
 const entries=Object.entries(places);
 const list=showAllPlaces?entries:entries.slice(0,6);
 $('#places-grid').innerHTML=list.map(([id,p],i)=>`<a class="place-card" href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer"><span class="place-number">${String(i+1).padStart(2,'0')} / NYC</span><div class="place-symbol ${escapeHtml(p.color)}">${['✳','✂','▤','◉','✎','✺'][i%6]}</div><span class="eyebrow">${escapeHtml(p.kind)}</span><h3>${escapeHtml(p.name)} <span>↗</span></h3><p>${escapeHtml(p.summary)}</p><span class="place-area">↗ ${escapeHtml(p.area)}</span></a>`).join('');
 const btn=$('#places-more'); if(btn){btn.textContent=showAllPlaces?'SHOW FEWER LOCAL SPOTS ↑':`VIEW ALL ${entries.length} NYC SPOTS ↗`;btn.setAttribute('aria-expanded',String(showAllPlaces));}
}
function renderCommunities(){
 const entries=Object.entries(communities);
 const list=showAllCommunities?entries:entries.slice(0,6);
 $('#community-grid').innerHTML=list.map(([id,c],i)=>`<a class="community-card" href="${escapeHtml(c.url)}" target="_blank" rel="noopener noreferrer"><span class="community-kicker">${String(i+1).padStart(2,'0')} · ${escapeHtml(c.kind)}</span><h3>${escapeHtml(c.name)} <span>↗</span></h3><p>${escapeHtml(c.summary)}</p><small>⌁ ${escapeHtml(c.area)}</small></a>`).join('');
 const btn=$('#community-more'); if(btn){btn.textContent=showAllCommunities?'SHOW FEWER GROUPS ↑':`VIEW ALL ${entries.length} GROUPS ↗`;btn.setAttribute('aria-expanded',String(showAllCommunities));}
}
const placeItem=id=>{const p=places[id];if(!p)return '';return `<a class="detail-place" href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer"><div><strong>${escapeHtml(p.name)} ↗</strong><span>${escapeHtml(p.area)} · ${escapeHtml(p.kind)}</span></div><span class="tiny-arrow">↗</span></a>`;};
const communityItem=id=>{const c=communities[id];if(!c)return '';return `<a class="detail-place community-link" href="${escapeHtml(c.url)}" target="_blank" rel="noopener noreferrer"><div><strong>${escapeHtml(c.name)} ↗</strong><span>${escapeHtml(c.kind)} · ${escapeHtml(c.area)}</span></div><span class="tiny-arrow">↗</span></a>`;};
function renderDetail(slug){const p=projects.find(p=>p.slug===slug);if(!p)return;const checks=checkedFor(slug);$('#detail-root').innerHTML=`<div class="detail-overlay" id="detail-overlay"><div class="detail-shade" data-close></div><section class="detail-sheet" role="dialog" aria-modal="true" aria-labelledby="detail-title"><div class="detail-head"><a class="detail-brand" href="#home">✳ ${BRAND_NAME}.</a><button id="close-detail" class="detail-close" aria-label="Close project">CLOSE ×</button></div><div class="detail-layout"><div class="detail-main"><div class="detail-visual ${p.accent}">${art(p.visual)}<span>YOUR NEXT WEEKEND PROJECT</span></div><div class="detail-body"><p class="eyebrow">${p.label} &nbsp; / &nbsp; ${p.skill}</p><h2 id="detail-title">${escapeHtml(p.title)}<span>.</span></h2><p class="detail-intro">${escapeHtml(p.intro)}</p><div class="detail-stats"><div><span>TIME</span><strong>${escapeHtml(p.time)}</strong></div><div><span>SUPPLY BUDGET*</span><strong>~$${p.budgetMin}–$${p.budgetMax}</strong></div><div><span>SKILL</span><strong>Beginner</strong></div></div><div class="detail-section"><div class="detail-subhead"><h3>The game plan</h3><span>STEP BY STEP</span></div><ol class="steps">${p.steps.map((step,i)=>`<li><span>${String(i+1).padStart(2,'0')}</span><p>${escapeHtml(step)}</p></li>`).join('')}</ol></div></div></div><aside class="detail-sidebar"><div class="detail-subhead"><h3>What you'll need</h3><span id="material-count">${checks.length} / ${p.materials.length}</span></div><p class="detail-hint">Tap each material as you find it. Saved on this device.</p><div class="check-list">${p.materials.map(([title,note],i)=>`<label class="check-item ${checks.includes(i)?'done':''}"><input type="checkbox" data-material="${i}" ${checks.includes(i)?'checked':''}/><span class="custom-check">✓</span><span><strong>${escapeHtml(title)}</strong><small>${escapeHtml(note)}</small></span></label>`).join('')}</div><div class="reuse-note"><strong>♻ REUSE BEFORE YOU BUY</strong><p>${escapeHtml(p.tip)}</p></div><div class="detail-subhead spaces-head"><h3>Find it in NYC</h3><span>${p.placeIds.length} PLACES</span></div><div class="detail-places">${p.placeIds.map(placeItem).join('')}</div><div class="detail-subhead spaces-head"><h3>Make it with people</h3><span>${p.communityIds.length} GROUPS / CLASSES</span></div><p class="detail-hint">Existing community meetups and classes, not guaranteed bookings.</p><div class="detail-places community-list">${p.communityIds.map(communityItem).join('')}</div><p class="info-note">Shop inventory, class prices and availability are not live. Check with each venue before going.</p>${sourceUrl && linkedProjectSlug===slug ? `<p class="source-note">FROM YOUR INSPIRATION: <a href="${escapeHtml(sourceUrl)}" rel="noopener noreferrer" target="_blank">OPEN THE ORIGINAL VIDEO ↗</a></p>` : ''}<div class="detail-actions"><button id="detail-save" class="pill-black">${isSaved(slug)?'♥ SAVED':'♡ SAVE THIS PROJECT'}</button><button id="detail-share" class="pill-outline">COPY LINK ↗</button></div><p class="budget-note">*Illustrative DIY starting estimates, not verified retail quotes. Classes can cost more.</p></aside></div></section></div>`;
 document.body.classList.add('dialog-open');$('#close-detail').focus();
 $('.detail-overlay').addEventListener('click',e=>{if(e.target.closest('[data-close]')||e.target.closest('#close-detail'))closeDetail();});
 $('.detail-overlay').querySelectorAll('[data-material]').forEach(el=>el.addEventListener('change',e=>{const i=Number(e.target.dataset.material), current=checkedFor(slug), next=e.target.checked?[...current,i]:current.filter(x=>x!==i);storage.set('oh:checked:'+slug,next);e.target.closest('.check-item').classList.toggle('done',e.target.checked);$('#material-count').textContent=`${next.length} / ${p.materials.length}`;}));
 $('#detail-save').addEventListener('click',()=>save(slug));$('#detail-share').addEventListener('click',async()=>{const link=location.href.split('#')[0]+'#project/'+slug;try{await navigator.clipboard.writeText(link);notify('Link copied. Send it to your future crafting partner.');}catch{prompt('Copy your project link:',link);}});
}
function closeDetail(){document.body.classList.remove('dialog-open');$('#detail-root').innerHTML='';if(location.hash.startsWith('#project/'))history.replaceState(null,'',location.href.split('#')[0]+'#explore');}
function navigate(){const hash=decodeURIComponent(location.hash);if(hash.startsWith('#project/')){const slug=hash.split('/')[1];if(projects.some(p=>p.slug===slug)){renderDetail(slug);}else{closeDetail();}}else if(hash==='#saved'){onlySaved=true;currentQuery='';currentFilter='all';renderProjects();document.querySelector('#explore').scrollIntoView();}else if($('#detail-root .detail-overlay')){closeDetail();}}
function setMode(mode){currentMode=mode;$('#tab-idea').classList.toggle('active',mode==='idea');$('#tab-link').classList.toggle('active',mode==='link');$('#tab-idea').setAttribute('aria-selected',String(mode==='idea'));$('#tab-link').setAttribute('aria-selected',String(mode==='link'));$('#search-query').placeholder=mode==='idea'?'I want to make a leather journal...':'Paste a TikTok, Instagram, YouTube or Pinterest link...';$('#search-query').type=mode==='link'?'url':'text';$('#caption-container').hidden=mode!=='link';$('#search-footnote').hidden=mode==='link';$('#link-status').hidden=true;$('#search-query').focus();}
function identifyProvider(url){
 let parsed;try{parsed=new URL(url);}catch{return null;}
 const host=parsed.hostname.replace(/^www\./,'').toLowerCase();
 if(parsed.protocol!=='https:')return null;
 const providers=[['youtube',['youtube.com','youtu.be','m.youtube.com']],['tiktok',['tiktok.com','vm.tiktok.com','vt.tiktok.com']],['instagram',['instagram.com']],['pinterest',['pinterest.com','pin.it']]];
 for(const [provider,hosts] of providers)if(hosts.some(x=>host===x))return {url:parsed,provider};
 return null;
}
function getUrlWords(parsed){
 const segments=decodeURIComponent(parsed.pathname).split('/').filter(x=>x&&!x.startsWith('@')&&!/^[\d_-]{8,}$/.test(x));
 const params=['title','description','caption','text','q'].map(k=>parsed.searchParams.get(k)||'').filter(Boolean);
 return [...segments,...params].join(' ').replace(/[\W_]+/g,' ').slice(0,500);
}
async function publicVideoTitle(link){
 const {provider,url}=link;
 // Public oEmbed endpoints expose limited metadata, not full transcripts. They can fail or be rate limited.
 const endpoints={youtube:'https://www.youtube.com/oembed?format=json&url=',tiktok:'https://www.tiktok.com/oembed?url=',instagram:'https://graph.facebook.com/v26.0/instagram_oembed?url='};
 const endpoint=endpoints[provider]; if(!endpoint)return '';
 try{
   const controller=new AbortController();
   const t=setTimeout(()=>controller.abort(),6500);
   try{const res=await fetch(endpoint+encodeURIComponent(url.href),{signal:controller.signal,headers:{Accept:'application/json'}});if(!res.ok)return '';const info=await res.json();const title=String(info.title||info.description||'').trim();return title.slice(0,600);}
   finally{clearTimeout(t);}
 }catch{return '';}
}
function renderLinkResult(p,matchedText,provider,method){
 const groupEntries=p.communityIds.map(id=>communities[id]).filter(Boolean);
 $('#link-result').hidden=false;
 $('#link-result').innerHTML=`<div class="link-result-head"><div><p class="eyebrow">YOUR INSPIRATION, DECODED · NYC EDITION</p><h2>Here's how to <em>start.</em></h2><p class="result-disclosure">${method==='metadata'?'Based on a public post title, not a transcript.':'Matched using the words you provided or the URL.'} Check the original video for exact techniques.</p></div><button id="link-result-close" class="pill-outline" type="button" aria-label="Dismiss results">CLOSE ×</button></div><div class="link-plan"><div class="link-plan-supplies"><span class="eyebrow">01 / WHAT YOU NEED</span><h3>${escapeHtml(p.title)}</h3><ul>${p.materials.map(([material,note])=>`<li><strong>${escapeHtml(material)}</strong><small>${escapeHtml(note)}</small></li>`).join('')}</ul></div><div class="link-plan-next"><span class="eyebrow">02 / WHERE TO BEGIN</span><h3>Near you, in NYC.</h3>${p.placeIds.slice(0,3).map(placeItem).join('')}<span class="eyebrow result-group-head">03 / FIND YOUR PEOPLE</span>${p.communityIds.slice(0,3).map(communityItem).join('')}<button class="pill-black" id="link-full-plan">OPEN THE COMPLETE PROJECT ↗</button></div></div><p class="result-footnote">We only use publicly accessible information where available. Inventory, events and classes need to be confirmed with venues. <a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">View original ${escapeHtml(provider)} link ↗</a></p>`;
 $('#link-result-close').addEventListener('click',()=>{$('#link-result').hidden=true;});
 $('#link-full-plan').addEventListener('click',()=>{location.hash='#project/'+p.slug;});
 $('#link-result').scrollIntoView({behavior:'smooth',block:'start'});
}
async function matchVideo(url,description){
 const link=identifyProvider(url);
 if(!link){notify('Use a valid public TikTok, Instagram, YouTube, or Pinterest link with https://');return false;}
 if(linkBusy)return false;
 linkBusy=true;
 const formBtn=$('#search-form button[type="submit"]');
 const prev=formBtn.textContent;formBtn.disabled=true;formBtn.textContent='…';
 $('#link-status').hidden=false;
 $('#link-status').textContent='Checking available public post details…';
 try{
   const title=await publicVideoTitle(link);
   const pathWords=getUrlWords(link.url);
   const text=[description,title,pathWords].filter(Boolean).join(' ').slice(0,900);
   const scored=scoredProjects(text);
   if(!scored.length){
     $('#link-result').hidden=true;
     $('#link-status').textContent='Could not identify the project from public post information. Add a brief description (e.g. “crochet a flower bag”) and try again.';
     $('#caption-input').focus();return false;
   }
   // Choose the most plausible curated template, not a claim that we watched or understood the video.
   const p=scored[0].p;
   sourceUrl=link.url.href;linkedProjectSlug=p.slug;currentQuery='';onlySaved=false;currentFilter='all';
   $('#link-status').textContent='Starter materials and local groups found. Please confirm the project matches your video.';
   renderLinkResult(p,text,link.provider,title&&!description.trim()?'metadata':'description');
   return true;
 }finally{linkBusy=false;formBtn.disabled=false;formBtn.textContent=prev;}
}

$('#search-form').addEventListener('submit',async e=>{
 e.preventDefault();const raw=$('#search-query').value.trim();if(!raw)return;
 onlySaved=false;currentFilter='all';document.querySelectorAll('.filter').forEach(button=>button.classList.toggle('active',button.dataset.filter==='all'));
 if(currentMode==='link'){
   await matchVideo(raw,$('#caption-input').value.trim());
 }else{
   sourceUrl='';linkedProjectSlug='';currentQuery=raw;$('#link-result').hidden=true;$('#link-status').hidden=true;renderProjects();
   $('#explore').scrollIntoView({behavior:'smooth',block:'start'});
 }
});
$('#tab-idea').addEventListener('click',()=>setMode('idea'));$('#tab-link').addEventListener('click',()=>setMode('link'));
document.querySelectorAll('[data-example]').forEach(button=>button.addEventListener('click',()=>{$('#search-query').value=button.dataset.example;$('#search-form').requestSubmit();}));
$('#filters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;onlySaved=false;currentFilter=b.dataset.filter;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===b));renderProjects();});
$('#project-grid').addEventListener('click',e=>{const b=e.target.closest('[data-save]');if(b){e.stopPropagation();save(b.dataset.save);return;}const a=e.target.closest('[data-open]');if(a)location.hash='#project/'+a.dataset.open;});
$('#project-grid').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-open]')){e.preventDefault();location.hash='#project/'+e.target.dataset.open;}});
$('#saved-button').addEventListener('click',()=>{if(!getSaved().length){notify('Save a project with the heart icon to find it here.');return;}location.hash='#saved';navigate();});
$('#reset-search').addEventListener('click',()=>{onlySaved=false;currentQuery='';currentFilter='all';$('#search-query').value='';document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x.dataset.filter==='all'));renderProjects();});
$('#places-more').addEventListener('click',()=>{showAllPlaces=!showAllPlaces;renderPlaces();});
$('#community-more').addEventListener('click',()=>{showAllCommunities=!showAllCommunities;renderCommunities();});
window.addEventListener('hashchange',navigate);window.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#detail-root .detail-overlay'))closeDetail();});
renderPlaces();renderCommunities();renderSavedCount();renderProjects();navigate();
