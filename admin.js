(function(){
const cfg=window.JAIN_CONFIG||{};
let owner=null;
const $=id=>document.getElementById(id);

function isoLocal(v){
  if(!v)return '';
  const d=new Date(v);
  if(Number.isNaN(d.getTime()))return '';
  const p=n=>String(n).padStart(2,'0');
  return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+'T'+p(d.getHours())+':'+p(d.getMinutes());
}

function jsonp(params,done){
  if(!cfg.API_URL){
    done({ok:true,name:'Demo Jain Auto',status:'OPEN',message:'Demo mode. Configure API_URL to connect Google Sheets.',hours:'09:00 AM – 08:00 PM',updatedAt:new Date().toISOString()});
    return;
  }
  const cb='jain_'+Date.now();
  window[cb]=r=>{delete window[cb];document.getElementById(cb)?.remove();done(r)};
  const s=document.createElement('script');
  s.id=cb;
  s.src=cfg.API_URL+'?'+new URLSearchParams({...params,callback:cb,_:Date.now()});
  s.onerror=()=>{delete window[cb];s.remove();done({ok:false,error:'Could not reach Google Apps Script.'})};
  document.body.appendChild(s);
}

function showDash(data){
  owner=data;
  $('loginPanel').classList.add('hidden');
  $('dash').classList.remove('hidden');
  $('dashName').textContent=data.name||'Jain Auto';
  $('currentStatus').textContent=data.status||'CLOSED';
  $('mode').value=data.status||'CLOSED';
  $('openUntil').value=isoLocal(data.openUntil);
  $('nextOpenAt').value=isoLocal(data.nextOpenAt);
  $('hours').value=data.hours||'';
  $('message').value=data.message||'';
  updateFieldHints();
}

function updateFieldHints(){
  const mode=String($('mode').value||'CLOSED').toUpperCase();
  const open=$('openUntil');
  const next=$('nextOpenAt');
  open.removeAttribute('required');
  next.removeAttribute('required');
  open.disabled=false;
  next.disabled=false;
  open.closest('label')?.classList.toggle('optional-field',true);
  next.closest('label')?.classList.toggle('optional-field',true);
  if(mode==='OPEN'){
    next.disabled=true;
  }else if(mode==='BREAK'){
    open.disabled=true;
    next.disabled=true;
  }else if(mode==='CLOSED'){
    open.disabled=true;
  }
}

$('loginForm').addEventListener('submit',e=>{
  e.preventDefault();
  $('loginError').textContent='Signing in…';
  jsonp({action:'login',userId:$('userId').value.trim(),password:$('password').value},r=>{
    if(r.ok){
      sessionStorage.setItem('jain_owner',JSON.stringify({userId:$('userId').value.trim(),token:r.token||''}));
      showDash(r);
    }else $('loginError').textContent=r.error||'Login failed.';
  });
});

document.querySelectorAll('.quick button').forEach(b=>b.addEventListener('click',()=>{
  const m=b.dataset.mode;
  $('mode').value=m;
  if(m==='OPEN'){
    // Optional: leave blank if you do not want an automatic closing time.
    $('openUntil').value='';
    $('nextOpenAt').value='';
  }else if(m==='CLOSED'){
    $('openUntil').value='';
    // Next opening time is optional. Leave it blank unless you want customers to see one.
    $('nextOpenAt').value='';
  }else{
    $('openUntil').value='';
    $('nextOpenAt').value='';
  }
  updateFieldHints();
}));

$('mode').addEventListener('change',updateFieldHints);

$('save').addEventListener('click',()=>{
  const saved=JSON.parse(sessionStorage.getItem('jain_owner')||'{}');
  const p={
    action:'update',
    userId:saved.userId||'',
    token:saved.token||'',
    status:$('mode').value,
    openUntil:'',
    nextOpenAt:'',
    hours:$('hours').value,
    message:$('message').value
  };

  // Only send dates when the user actually selected one.
  if(!$('openUntil').disabled && $('openUntil').value){
    const d=new Date($('openUntil').value);
    if(!Number.isNaN(d.getTime())) p.openUntil=d.toISOString();
  }
  if(!$('nextOpenAt').disabled && $('nextOpenAt').value){
    const d=new Date($('nextOpenAt').value);
    if(!Number.isNaN(d.getTime())) p.nextOpenAt=d.toISOString();
  }

  $('saveMsg').textContent='Updating…';
  jsonp(p,r=>{
    $('saveMsg').textContent=r.ok?'Live status updated.':'Update failed: '+(r.error||'unknown error');
    if(r.ok){
      owner=r;
      $('currentStatus').textContent=r.status||p.status;
      $('mode').value=r.status||p.status;
      $('openUntil').value=isoLocal(r.openUntil);
      $('nextOpenAt').value=isoLocal(r.nextOpenAt);
      $('hours').value=r.hours||p.hours||'';
      $('message').value=r.message||p.message||'';
      updateFieldHints();
    }
  });
});

$('logout').addEventListener('click',()=>{sessionStorage.removeItem('jain_owner');location.reload()});

const saved=JSON.parse(sessionStorage.getItem('jain_owner')||'null');
if(saved?.userId){
  jsonp({action:'session',userId:saved.userId,token:saved.token},r=>{if(r.ok)showDash(r)});
}
})();
