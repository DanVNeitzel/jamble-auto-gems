const KEY='jag_v2', $=id=>document.getElementById(id);let selected=null,prevSeconds=null,origin=0,base=0;
const fmt=s=>s==null?'--:--':`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
const escapeHtml=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function load(){const data=await chrome.storage.local.get(KEY),s=data[KEY]||{},tabs=s.tabs||{};const live=Object.entries(tabs).filter(([id,t])=>t.url?.includes('jamble.com/live/'));
if(selected===null){const [current]=await chrome.tabs.query({active:true,currentWindow:true});selected=live.some(([id])=>+id===current?.id)?String(current.id):(live[0]?.[0]||'');}
if(!live.some(([id])=>id===selected))selected=live[0]?.[0]||'';
$('toggle').textContent=s.enabled?'LIGADO':'DESLIGADO';$('toggle').className='toggle '+(s.enabled?'on':'');$('enabledText').textContent=s.enabled?'Monitoramento ativo':'Monitoramento pausado';$('notify').checked=s.notify!==false;document.body.classList.toggle('light',s.theme==='light');
$('attempts').textContent=s.stats?.attempts||0;$('errors').textContent=s.stats?.errors||0;$('tabCount').textContent=live.length+' aba(s)';
$('tabs').innerHTML=live.length?live.map(([id,t])=>`<option value="${id}">${escapeHtml((t.title||'Live').slice(0,60))} (#${id})</option>`).join(''):'<option value="">Nenhuma live detectada</option>';$('tabs').value=selected;
const t=tabs[selected]||{};$('state').textContent=t.state||'Sem dados';$('detail').textContent=t.detail||'Abra uma transmissão na Jamble';$('tabDetail').textContent=t.url||'';
if(t.seconds!==prevSeconds){prevSeconds=t.seconds;origin=Date.now();base=t.seconds;}renderTimer(t.state);
$('history').innerHTML=(s.history||[]).slice(0,12).map(e=>`<div class="entry"><b>${escapeHtml(e.event)}</b><small>${new Date(e.at).toLocaleString('pt-BR')} · Aba ${e.tab} · ${escapeHtml(e.detail)}</small></div>`).join('')||'<small>Nenhum evento registrado.</small>';}
let currentState='';function renderTimer(state){currentState=state;const n=base==null?null:Math.max(0,base-Math.floor((Date.now()-origin)/1000));$('time').textContent=state==='AGUARDANDO'?fmt(n):state==='DISPONIVEL'?'00:00':'--:--';const fraction=state==='AGUARDANDO'&&base>0?Math.max(0,Math.min(100,(1-n/Math.max(base,1))*100)):0;$('ring').style.setProperty('--progress',fraction+'%');}
async function patch(update){const v=await chrome.storage.local.get(KEY);await chrome.storage.local.set({[KEY]:{...(v[KEY]||{}),...update}});}
$('toggle').onclick=async()=>{const v=await chrome.storage.local.get(KEY);const enable=!v[KEY]?.enabled;if(enable){const state=v[KEY]||{};const tabs=Object.fromEntries(Object.entries(state.tabs||{}).map(([id,t])=>[id,{...t,finished:false}]));await patch({enabled:true,tabs});}else{await patch({enabled:false});}load();};
$('notify').onchange=()=>patch({notify:$('notify').checked});$('theme').onclick=async()=>{const v=await chrome.storage.local.get(KEY);await patch({theme:v[KEY]?.theme==='light'?'dark':'light'});load();};
$('tabs').onchange=()=>{selected=$('tabs').value;prevSeconds=null;load();};$('clear').onclick=()=>patch({history:[]}).then(load);
load();setInterval(load,1200);setInterval(()=>renderTimer(currentState),250);