const KEY='jag_v2';const defaults={enabled:false,notify:true,theme:'dark',history:[],stats:{attempts:0,errors:0},tabs:{}};
async function get(){const v=await chrome.storage.local.get(KEY);return {...defaults,...v[KEY],stats:{...defaults.stats,...v[KEY]?.stats},tabs:{...v[KEY]?.tabs},history:[...(v[KEY]?.history||[])]};}
let queue=Promise.resolve();function mutate(fn){queue=queue.catch(()=>{}).then(async()=>{const s=await get();await fn(s);await chrome.storage.local.set({[KEY]:s});});return queue;}
function notify(title,message){chrome.storage.local.get(KEY).then(v=>{if(!v[KEY]?.notify)return;chrome.notifications.create({type:'basic',iconUrl:'icon.png',title,message});});}
chrome.runtime.onMessage.addListener((msg,sender,respond)=>{const id=sender.tab?.id;if(id==null)return;mutate(async s=>{const t=s.tabs[id]||{};t.title=sender.tab.title||'Live';t.url=sender.tab.url||'';t.updatedAt=Date.now();
if(msg.type==='STATUS'&&!t.finished){t.state=msg.state;t.seconds=msg.seconds;t.detail=msg.detail;}
if(msg.type==='EVENT'&&msg.event==='estado'&&!t.finished&&msg.state!=='FINALIZADO'&&msg.state!==t.lastLogged){t.lastLogged=msg.state;s.history.unshift({at:Date.now(),tab:id,event:'Estado: '+msg.state,detail:msg.detail});}
if(msg.type==='CLAIM_ATTEMPT'){s.stats.attempts++;t.attempts=(t.attempts||0)+1;s.history.unshift({at:Date.now(),tab:id,event:'Clique enviado',detail:'Crédito não confirmado'});}
if(msg.type==='ERROR'){s.stats.errors++;t.state='ERRO';s.history.unshift({at:Date.now(),tab:id,event:'Erro',detail:msg.detail});if(s.notify)notify('Jamble Auto Gems','Erro na tentativa de coleta');}
if(msg.type==='FINISHED'&&!t.finished){t.finished=true;t.state='FINALIZADO';t.seconds=null;t.detail='Limite diário atingido — coleta desativada';s.enabled=false;s.history.unshift({at:Date.now(),tab:id,event:'Próximo dia',detail:'Limite detectado nesta live; coleta desativada'});if(s.notify)notify('Jamble Auto Gems','Limite diário detectado. Coleta desativada.');}
s.tabs[id]=t;s.history=s.history.slice(0,150);}).then(()=>respond({ok:true})).catch(e=>respond({error:String(e)}));return true;});
chrome.tabs.onRemoved.addListener(id=>mutate(s=>{delete s.tabs[id]}));
chrome.runtime.onInstalled.addListener(()=>mutate(()=>{}));