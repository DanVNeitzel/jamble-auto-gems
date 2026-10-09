const KEY='jambleGemasV15';
const toggle=document.getElementById('toggle');
function render(s={}){
 toggle.textContent=s.enabled?'LIGADO':'DESLIGADO';toggle.className=s.enabled?'on':'';
 document.getElementById('status').textContent='Status: '+(s.status||'Sem diagnóstico');
 document.getElementById('detail').textContent=s.detail||'';
 document.getElementById('count').textContent='Cliques enviados: '+(s.count||0);
 const seconds=s.seconds;
 document.getElementById('timer').textContent=Number.isFinite(seconds)&&seconds>=0?`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`:'--:--';
}
chrome.storage.local.get(KEY,result=>render(result[KEY]));
chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes[KEY])render(changes[KEY].newValue)});
toggle.addEventListener('click',()=>chrome.storage.local.get(KEY,result=>{const s=result[KEY]||{};chrome.storage.local.set({[KEY]:{...s,enabled:!s.enabled,status:!s.enabled?'Monitorando':'Desligada',detail:'',seconds:null}})}));
