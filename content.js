(()=>{
if(window!==top||window.__jag2)return;window.__jag2=true;
const KEY='jag_v2';let enabled=false,armed=true,lastClick=0,previous='',count=0,waiting=false,seenTimer=false,activeSeconds=null,finished=false;
const norm=t=>(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const log=(...a)=>console.info('%c💎 [Jamble Auto Gems]','color:#30d8bb;font-weight:bold',...a);
const btn=()=>document.querySelector('button[aria-label="Recompensa por assistir"]');
function read(){const b=btn();if(!b)return {state:'SEM_BOTAO',seconds:null,detail:'Botão não encontrado'};
const text=norm(b.parentElement?.innerText);if(text.includes('proximo dia'))return {state:'FINALIZADO',seconds:null,detail:'Limite diário atingido'};
const m=(b.parentElement?.innerText||'').match(/(?:^|\s)(\d{1,2}):(\d{2})(?=\s|$)/);
if(m){const s=+m[1]*60+(+m[2]);if(s>0)return {state:'AGUARDANDO',seconds:s,detail:'Cronômetro em andamento'};}
if(b.disabled||b.getAttribute('aria-disabled')==='true')return {state:'INDISPONIVEL',seconds:null,detail:'Botão desabilitado'};
if(text.includes('reivindicar'))return {state:'DISPONIVEL',seconds:0,detail:'Recompensa pronta'};
return {state:'SEM_RECOMPENSA',seconds:null,detail:'Aguardando nova recompensa'};}
function send(type,data={}){try{chrome.runtime.sendMessage({type, ...data},()=>void chrome.runtime.lastError)}catch(e){console.warn('[Jamble Auto Gems]',e)}}
function tick(){if(!enabled||finished)return;const r=read();if(r.state!==previous){log('Estado:',r.state,r.detail);previous=r.state;send('EVENT',{event:'estado',state:r.state,detail:r.detail,seconds:r.seconds});}
if(r.state==='FINALIZADO'){finished=true;enabled=false;send('FINISHED');log('Próximo dia — encerrado.');return;}
if(r.state==='AGUARDANDO'){seenTimer=true;armed=true;waiting=false;activeSeconds=r.seconds;}
if(r.state==='DISPONIVEL'&&armed&&!waiting&&Date.now()-lastClick>10000){const b=btn();if(b){armed=false;waiting=true;lastClick=Date.now();try{b.click();count++;log('Clique enviado #'+count+' (crédito não confirmado)');send('CLAIM_ATTEMPT',{count});}catch(e){armed=true;waiting=false;send('ERROR',{detail:String(e)});}}}
// Re-arm only when a new countdown appears; do not repeatedly click a static "Reivindicar" button.
if(r.state==='SEM_BOTAO'&&seenTimer){ /* transient UI state: keep previous timer */ }
send('STATUS',{state:r.state,seconds:r.seconds,detail:r.detail});}
chrome.storage.local.get(KEY,v=>{enabled=!!v[KEY]?.enabled;tick()});
chrome.storage.onChanged.addListener((c,a)=>{if(a==='local'&&c[KEY]&&typeof c[KEY].newValue?.enabled==='boolean'){const e=c[KEY].newValue.enabled;if(e!==enabled){enabled=e;log(e?'Ligado':'Desligado');if(e){finished=false;armed=true;tick();}}}});
setInterval(tick,1000);
})();