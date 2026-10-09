(() => {
  if (window !== window.top || window.__jambleGemasV15) return;
  window.__jambleGemasV15 = true;
  const KEY = 'jambleGemasV15';
  let enabled = false, count = 0, pending = false, lastClaim = 0, lastState = '', lastTimer = null;
  const log = (message) => console.info('%c💎 [Jamble Gemas]', 'color:#36d8bd;font-weight:bold', message);
  const button = () => document.querySelector('button[aria-label="Recompensa por assistir"]');
  const normalize = text => (text || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const format = seconds => `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
  function readReward() {
    const b = button();
    if (!b) return {status:'Aguardando botão', detail:'Botão não localizado', seconds:null};
    const parent = b.parentElement;
    const text = normalize(parent?.innerText);
    if (text.includes('proximo dia')) return {status:'Próximo dia',detail:'Limite diário exibido pela Jamble',seconds:null};
    const timerText = (parent?.innerText || '').match(/(?:^|\s)(\d{1,2}):(\d{2})(?=\s|$)/);
    if (timerText) {
      const seconds = Number(timerText[1])*60+Number(timerText[2]);
      if (seconds > 0) return {status:'Aguardando timer',detail:'Próxima tentativa após zerar o cronômetro',seconds};
    }
    if (b.disabled || b.getAttribute('aria-disabled') === 'true') return {status:'Botão indisponível',detail:'Aguardando liberação',seconds:null};
    if (text.includes('reivindicar')) return {status:'Reivindicar',detail:'Recompensa disponível para tentativa',seconds:0};
    return {status:'Botão encontrado',detail:'Aguardando indicação de recompensa',seconds:null};
  }
  function save(status, detail, seconds) {
    chrome.storage.local.get(KEY, ({[KEY]:s = {}}) => {
      // Preserve toggle state set by popup; don't overwrite a newer change.
      if (Boolean(s.enabled) !== enabled) return;
      chrome.storage.local.set({[KEY]: {...s, count, status, detail, seconds, updatedAt:Date.now()}});
    });
  }
  function tick() {
    if (!enabled) return;
    const r = readReward();
    if (r.status !== lastState) {log(`Estado: ${r.status}${r.seconds != null ? ' ('+format(r.seconds)+')' : ''}`);lastState=r.status;}
    if (r.status === 'Próximo dia') {
      enabled = false; pending = false;
      chrome.storage.local.get(KEY, ({[KEY]:s = {}}) => chrome.storage.local.set({[KEY]:{...s,enabled:false,status:'Próximo dia',detail:r.detail,seconds:null,updatedAt:Date.now()}}));
      log('Próximo dia: coleta encerrada.'); return;
    }
    if (r.status === 'Aguardando timer') {
      pending = false;
      if (r.seconds !== lastTimer) lastTimer = r.seconds;
      save(r.status,r.detail,r.seconds); return;
    }
    if (r.status !== 'Reivindicar') {save(r.status,r.detail,r.seconds);return;}
    // A new attempt only after timer appeared and expired, or the first ready state.
    if (pending || Date.now()-lastClaim < 10000) {save('Aguardando confirmação','Clique já enviado; aguardando atualização',null);return;}
    pending=true;lastClaim=Date.now();lastTimer=null;
    try {button().click();count++;log(`Clique de reivindicação enviado (#${count}); crédito não confirmado.`);save('Clique enviado','Aguardando confirmação visual',null);}
    catch(e) {pending=false;console.error('💎 [Jamble Gemas] Falha:',e);save('Erro',String(e),null);}
  }
  chrome.storage.local.get(KEY, ({[KEY]:s = {}}) => {
    enabled=Boolean(s.enabled);count=Number(s.count)||0;
    log(enabled?'Monitoramento ativado.':'Monitoramento desligado.');tick();
  });
  chrome.storage.onChanged.addListener((changes,area) => {
    if(area!=='local'||!changes[KEY])return;
    const next=changes[KEY].newValue;
    if(typeof next?.enabled==='boolean' && next.enabled!==enabled){
      enabled=next.enabled;pending=false;lastState='';
      log(enabled?'Coleta ativada.':'Coleta desativada.');if(enabled)tick();
    }
  });
  setInterval(tick,1000);
})();
