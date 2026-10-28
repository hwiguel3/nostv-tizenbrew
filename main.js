/* NOS PIN v2 – selecao azul e teclado com comando; PIN local, sem registos. */
(function(){
'use strict';
if(!/(^|\.)nostv\.pt$/i.test(location.hostname)||window.__nosPinV2)return;
window.__nosPinV2=true;
var header=null,rect=null,box=null,label=null,pad=null,open=false,code='',index=0;
var digits=['1','2','3','4','5','6','7','8','9','Apagar','0','Fechar'];
function r(el){try{return el.getBoundingClientRect();}catch(e){return null;}}
function visible(el){if(!el)return false;var b=r(el);if(!b||b.width<3||b.height<3||b.bottom<0||b.top>innerHeight)return false;var s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0;}
function title(){var els=document.querySelectorAll('h1,h2,h3,h4,span,p,div'),best=null,min=Infinity;for(var i=0;i<els.length&&i<7000;i++){var el=els[i],t=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();if(t!=='introduza o pin'||!visible(el))continue;var b=r(el),size=b.width*b.height;if(size<min){best=el;min=size;}}return best;}
function pinInputs(){if(!header)return[];var a=document.querySelectorAll('input'),out=[],h=r(header);for(var i=0;i<a.length;i++){var e=a[i],t=(e.type||'text').toLowerCase(),b=r(e);if(/^(hidden|search|checkbox|radio|submit|button|file)$/.test(t)||!b)continue;var p=e.parentElement,pr=p?r(p):null;var x=b.width?b.left+b.width/2:(pr?pr.left+pr.width/2:0),y=b.height?b.top+b.height/2:(pr?pr.top+pr.height/2:0);if(x<h.left-80||x>innerWidth||y<h.top-30||y>h.top+innerHeight*.5)continue;var cx=rect?rect.left+rect.width/2:h.left+innerWidth*.16,cy=rect?rect.top+rect.height/2:h.bottom+innerHeight*.24;out.push({e:e,x:x,score:Math.abs(x-cx)+Math.abs(y-cy)-(e.maxLength===1?30:0)});}out.sort(function(a,b){return a.score-b.score;});if(out.length>=4){var four=out.slice(0,4).sort(function(a,b){return a.x-b.x;});if(four[3].x-four[0].x>20)return four.map(function(t){return t.e;});}return out.length?[out[0].e]:[];}
function position(){var h=r(header);if(!h)return null;var res={left:Math.min(innerWidth-65,h.left+innerWidth*.10),top:h.bottom+innerHeight*.205,width:Math.min(innerWidth*.17,330),height:Math.max(37,Math.min(innerHeight*.065,74))};var ins=pinInputs(),found=[];for(var i=0;i<ins.length;i++)if(visible(ins[i]))found.push(r(ins[i]));if(found.length===4){res.left=found[0].left;res.top=found[0].top;var right=0,bottom=0;for(i=0;i<4;i++){res.left=Math.min(res.left,found[i].left);res.top=Math.min(res.top,found[i].top);right=Math.max(right,found[i].right);bottom=Math.max(bottom,found[i].bottom);}res.width=right-res.left;res.height=bottom-res.top;}else if(found.length===1&&found[0].width>60&&found[0].width<innerWidth*.45){res={left:found[0].left,top:found[0].top,width:found[0].width,height:found[0].height};}return res;}
function create(){if(!document.body)return false;if(!document.getElementById('nos-pin-v2-css')){var s=document.createElement('style');s.id='nos-pin-v2-css';s.textContent='#nos-pin-v2-box{position:fixed!important;pointer-events:none!important;z-index:2147483647!important;display:none;border:4px solid #19a2ff!important;box-shadow:0 0 0 3px #002952,0 0 18px 5px #0989e5!important;border-radius:8px!important;box-sizing:border-box!important}#nos-pin-v2-label{position:fixed!important;pointer-events:none!important;z-index:2147483647!important;display:none;background:#0068be!important;border-radius:6px!important;color:white!important;padding:8px 13px!important;font:18px Arial!important}#nos-pin-v2-pad{position:fixed!important;z-index:2147483647!important;display:none;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;width:420px!important;max-width:91vw!important;background:#122041!important;border:3px solid #32adff!important;border-radius:15px!important;padding:22px!important;box-sizing:border-box!important;color:white!important;font:20px Arial!important;text-align:center!important;box-shadow:0 12px 65px #000!important}#nos-pin-v2-pad .grid{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:9px!important}#nos-pin-v2-pad .cell{background:#29436c!important;border:2px solid #6788ae!important;border-radius:8px!important;padding:16px 0!important}#nos-pin-v2-pad .on{background:#096ed0!important;border-color:#d0f1ff!important;box-shadow:0 0 14px #00a1ff!important}body.nos-pin-v2-active #nos-remote-ring,body.nos-pin-v2-active #nostv-remote-ring{visibility:hidden!important}';document.head.appendChild(s);}function el(id){var x=document.getElementById(id);if(!x){x=document.createElement('div');x.id=id;document.body.appendChild(x);}return x;}box=el('nos-pin-v2-box');label=el('nos-pin-v2-label');pad=el('nos-pin-v2-pad');if(!pad.getAttribute('data-ready')){var html='<div style="font-weight:bold;margin-bottom:12px">PIN do perfil NOS</div><div id="nos-pin-v2-dots" style="margin:12px;font-size:26px;letter-spacing:10px">○ ○ ○ ○</div><div class="grid">';for(var i=0;i<digits.length;i++)html+='<div class="cell">'+digits[i]+'</div>';pad.innerHTML=html+'</div><div style="font-size:14px;margin-top:13px;color:#c7dcf1">Setas: escolher · OK: confirmar · Voltar: sair</div>';pad.setAttribute('data-ready','1');}return true;}
function draw(){if(!create())return;header=title();if(!header){document.body.classList.remove('nos-pin-v2-active');box.style.display='none';label.style.display='none';pad.style.display='none';open=false;code='';return;}document.body.classList.add('nos-pin-v2-active');rect=position();if(!rect)return;box.style.left=Math.round(rect.left-3)+'px';box.style.top=Math.round(rect.top-3)+'px';box.style.width=Math.round(rect.width+6)+'px';box.style.height=Math.round(rect.height+6)+'px';box.style.display='block';label.textContent='PIN: carregar OK';label.style.left=Math.max(0,Math.min(innerWidth-220,rect.left))+'px';label.style.top=Math.min(innerHeight-43,rect.top+rect.height+15)+'px';label.style.display=open?'none':'block';pad.style.display=open?'block':'none';}
function redraw(){if(!pad)return;var cells=pad.querySelectorAll('.cell');for(var i=0;i<cells.length;i++)cells[i].className='cell'+(index===i?' on':'');var dots=pad.querySelector('#nos-pin-v2-dots');if(dots){var s='';for(i=0;i<4;i++)s+=(i<code.length?'●':'○')+' ';dots.textContent=s;}}
function setValue(el,value){try{var d=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');if(d&&d.set)d.set.call(el,value);else el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));return true;}catch(e){return false;}}
function enter(v){if(v==='Fechar'){open=false;code='';draw();return;}if(v==='Apagar')code=code.slice(0,-1);else if(code.length<4)code+=v;var ins=pinInputs();if(ins.length>=4){for(var i=0;i<4;i++)setValue(ins[i],code.charAt(i)||'');}else if(ins.length)setValue(ins[0],code);else{label.textContent='Campo PIN não acessível';label.style.display='block';}redraw();if(code.length===4)setTimeout(function(){open=false;code='';draw();},700);}
function keys(e){if(!title())return;var k=e.keyCode||e.which,arrow=k>=37&&k<=40,num=(k>=48&&k<=57)||(k>=96&&k<=105);if(!arrow&&k!==13&&k!==8&&k!==10009&&!num)return;var active=document.activeElement;if(active&&active.tagName==='INPUT'&&!open)return;if(k===10009&&!open)return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();if(k===10009){open=false;code='';draw();return;}if(!open){if(k===13||num){open=true;code='';index=0;draw();redraw();if(num)enter(String(k>=96?k-96:k-48));}else draw();return;}if(num){enter(String(k>=96?k-96:k-48));return;}if(k===8){enter('Apagar');return;}if(arrow){var row=Math.floor(index/3),col=index%3;if(k===37)col=(col+2)%3;if(k===39)col=(col+1)%3;if(k===38)row=(row+3)%4;if(k===40)row=(row+1)%4;index=row*3+col;redraw();return;}if(k===13)enter(digits[index]);}
function start(){document.addEventListener('keydown',keys,true);setInterval(draw,900);draw();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,false);else start();
})();
/* NOS TV Comando v2: modulo experimental para TizenBrew.
   Navegacao espacial propria, contorno independente de :focus e rato virtual.
   Nao e uma aplicacao oficial NOS. ES5 para Tizen 6. */
(function () {
  'use strict';
  if (!/(^|\.)nostv\.pt$/i.test(location.hostname) || window.__nosRemoteV2) return;
  window.__nosRemoteV2 = true;

  var selected = null, choices = [], ring = null, mouse = null, info = null;
  var mouseMode = false, mx = window.innerWidth / 2, my = window.innerHeight / 2;
  var lastActivity = Date.now(), lastScan = 0, infoTimer = 0;
  var query = 'a[href],button,input,select,textarea,summary,label[for],' +
    '[role="button"],[role="link"],[role="menuitem"],[role="tab"],' +
    '[role="option"],[role="checkbox"],[onclick],[tabindex],' +
    '[class*="cursor-pointer"],[class*="clickable"],[class*="Clickable"],' +
    '[style*="cursor: pointer"]';

  function box(el) {
    try { return el.getBoundingClientRect(); } catch (err) { return null; }
  }
  function isOwn(el) {
    while (el && el.nodeType === 1) {
      if (el.id === 'nos-remote-ring' || el.id === 'nos-remote-mouse' ||
          el.id === 'nos-remote-info') return true;
      el = el.parentNode;
    }
    return false;
  }
  function center(r) { return { x:r.left+r.width/2, y:r.top+r.height/2 }; }
  function ui() {
    if (!document.body) return false;
    if (!document.getElementById('nos-remote-css')) {
      var css = document.createElement('style');
      css.id='nos-remote-css';
      css.textContent = [
        '#nos-remote-ring{position:fixed!important;display:none;pointer-events:none!important;',
        'z-index:2147483646!important;box-sizing:border-box!important;',
        'outline:4px solid #ffe45c!important;outline-offset:3px!important;',
        'border:1px solid #111!important;border-radius:5px!important;',
        'box-shadow:0 0 0 2px #111,0 0 18px #ffd324!important;}',
        '#nos-remote-ring.pin-mode{outline-color:#38bdf8!important;',
        'box-shadow:0 0 0 2px #071b36,0 0 19px 5px rgba(56,189,248,.85)!important;}',
        '#nos-remote-mouse{position:fixed!important;display:none;pointer-events:none!important;',
        'z-index:2147483647!important;width:22px;height:22px;border:3px solid #ffe45c;',
        'border-radius:50%;background:rgba(255,220,30,.2);box-shadow:0 0 9px #000;}',
        '#nos-remote-info{position:fixed!important;display:none;pointer-events:none!important;',
        'z-index:2147483647!important;right:22px;top:18px;padding:10px 14px;',
        'font:17px Arial,sans-serif!important;color:white!important;background:rgba(0,0,0,.9)!important;',
        'border:2px solid #ffe45c!important;border-radius:6px!important;}'
      ].join('');
      (document.head || document.documentElement).appendChild(css);
    }
    function make(id) {
      var el = document.getElementById(id);
      if (!el) {
        el = document.createElement('div');
        el.id = id; el.setAttribute('aria-hidden','true');
        document.body.appendChild(el);
      }
      return el;
    }
    ring = make('nos-remote-ring');
    mouse = make('nos-remote-mouse');
    info = make('nos-remote-info');
    return true;
  }
  function message(s) {
    if (!ui()) return;
    info.textContent='NOS Comando v2 | '+s;
    info.style.display='block';
    if (infoTimer) clearTimeout(infoTimer);
    infoTimer=setTimeout(function(){ if(info) info.style.display='none'; },2400);
  }
  function visible(el) {
    if (!el || isOwn(el) || el.disabled ||
        el.getAttribute('aria-hidden') === 'true') return false;
    var r=box(el), w=window.innerWidth, h=window.innerHeight;
    if (!r || r.width<14 || r.height<12 || r.width>w*.9 || r.height>h*.75) return false;
    if (r.bottom<1 || r.right<1 || r.left>w-1 || r.top>h-1) return false;
    var style=window.getComputedStyle(el);
    if (!style || style.display==='none' || style.visibility==='hidden' ||
        style.pointerEvents==='none' || parseFloat(style.opacity)<.04) return false;
    var cx=Math.max(1,Math.min(w-2,r.left+r.width/2));
    var cy=Math.max(1,Math.min(h-2,r.top+r.height/2));
    var at=document.elementFromPoint(cx,cy);
    if (at && at!==el && !el.contains(at) && !at.contains(el)) return false;
    return true;
  }
  function clickable(el) {
    var tag=el.tagName, role=el.getAttribute('role'), st=window.getComputedStyle(el);
    if (tag==='A') return !!el.getAttribute('href');
    if (/^(BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(tag)) return true;
    if (tag==='LABEL' && el.hasAttribute('for')) return true;
    if (role && /^(button|link|menuitem|tab|option|checkbox|switch)$/.test(role)) return true;
    if (el.hasAttribute('onclick')) return true;
    var tab=el.getAttribute('tabindex');
    if (tab!==null && tab!=='-1') return true;
    return !!st && st.cursor==='pointer';
  }
  function scan() {
    lastScan=Date.now();
    var nodes=document.querySelectorAll(query), found=[], i, el;
    for (i=0;i<nodes.length && found.length<350;i++) {
      el=nodes[i]; if (clickable(el) && visible(el)) found.push(el);
    }
    if (found.length<8 && document.body) {
      nodes=document.body.querySelectorAll('div,article,li,section,img');
      for(i=0;i<nodes.length && i<2500 && found.length<350;i++) {
        el=nodes[i];
        if (found.indexOf(el)<0 && clickable(el) && visible(el)) found.push(el);
      }
    }
    var clean=[];
    for(i=0;i<found.length;i++) {
      el=found[i]; var parent=el.parentElement, duplicate=false, a=box(el);
      while(parent && parent!==document.body) {
        if(found.indexOf(parent)>=0) {
          var p=box(parent);
          if(!/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(el.tagName) &&
             a && p && a.width*a.height>p.width*p.height*.35) duplicate=true;
          break;
        }
        parent=parent.parentElement;
      }
      if(!duplicate) clean.push(el);
    }
    choices=clean;
    return clean;
  }

  // Four visible PIN boxes may belong to a single hidden input.
  function pinDialog() {
    var heads=document.querySelectorAll('h1,h2,h3,h4,p,span,div,label');
    var heading=null, hr=null, i, el, txt, r, style;
    for(i=0;i<heads.length && i<4500;i++) {
      el=heads[i];
      if(isOwn(el)) continue;
      txt=(el.textContent||'').replace(/\s+/g,' ').replace(/^\s+|\s+$/g,'');
      if(txt.length>42 || !/^(introduza|insira|digite|enter)\s+(o\s+|seu\s+|your\s+)?pin$/i.test(txt)) continue;
      r=box(el);
      if(!r || r.width<35 || r.height<12 || r.bottom<0 || r.top>=window.innerHeight) continue;
      style=window.getComputedStyle(el);
      if(style.display==='none' || style.visibility==='hidden') continue;
      if(!hr || r.width*r.height<hr.width*hr.height) {heading=el;hr=r;}
    }
    if(!heading) return null;

    var inputs=document.querySelectorAll('input:not([type="hidden"]),textarea');
    var chosenInput=null, bestInputScore=-999;
    for(i=0;i<inputs.length;i++) {
      el=inputs[i];
      if(el.disabled || el.readOnly) continue;
      var attrs=[el.id,el.name,el.placeholder,el.getAttribute('aria-label')].join(' ');
      var score=/pin|code|codigo|c[oó]digo/i.test(attrs)?110:0;
      if(el.maxLength===4) score+=100;
      if(/^(numeric|decimal|tel)$/i.test(el.inputMode||el.getAttribute('inputmode')||'')) score+=70;
      if(/^(password|tel|number)$/i.test(el.type)) score+=50;
      r=box(el);
      if(r && r.top>hr.bottom-15 && r.top<hr.bottom+270 &&
         r.left>hr.left-120 && r.left<hr.right+360) score+=65;
      if(score>bestInputScore) {bestInputScore=score;chosenInput=el;}
    }

    var nodes=document.querySelectorAll('div,span,input,button');
    var items=[], last, base, group, j, k;
    for(i=0;i<nodes.length && i<5500;i++) {
      el=nodes[i];
      if(isOwn(el)) continue;
      r=box(el);
      if(!r || r.width<14 || r.width>76 || r.height<15 || r.height>76) continue;
      if(r.left<hr.left-65 || r.left>hr.right+355 ||
         r.top<hr.bottom+15 || r.top>hr.bottom+250) continue;
      style=window.getComputedStyle(el);
      if(style.display==='none' || style.visibility==='hidden' ||
         parseFloat(style.opacity)<0.05) continue;
      items.push({el:el,r:r});
    }
    items.sort(function(a,b) {
      return Math.abs(a.r.top-b.r.top)>8?a.r.top-b.r.top:a.r.left-b.r.left;
    });
    var match=null, matchScore=Infinity;
    for(i=0;i<items.length;i++) {
      group=[items[i]];base=items[i].r;last=base;
      for(j=0;j<items.length && group.length<4;j++) {
        r=items[j].r;
        if(Math.abs(r.top-base.top)>9 || Math.abs(r.height-base.height)>15 ||
           Math.abs(r.width-base.width)>17) continue;
        var gap=r.left-last.right;
        if(gap< -3 || gap>32 || r.left<=last.left+10) continue;
        group.push(items[j]);last=r;
      }
      if(group.length===4) {
        var scoreGroup=Math.abs(group[0].r.width-group[0].r.height)+
          Math.abs(group[0].r.top-(hr.bottom+115))*.08+group[0].r.width*.04;
        if(scoreGroup<matchScore) {matchScore=scoreGroup;match=group;}
      }
    }
    if(match) {
      var left=match[0].r.left,top=match[0].r.top,right=match[0].r.right,bottom=match[0].r.bottom;
      for(k=1;k<4;k++) {
        left=Math.min(left,match[k].r.left);top=Math.min(top,match[k].r.top);
        right=Math.max(right,match[k].r.right);bottom=Math.max(bottom,match[k].r.bottom);
      }
      return {rect:{left:left,top:top,width:right-left,height:bottom-top},slot:match[0].el,input:chosenInput};
    }
    if(chosenInput) {
      r=box(chosenInput);
      if(r && r.width>12 && r.height>12 && r.left>=0 && r.top>=0)
        return {rect:{left:r.left,top:r.top,width:r.width,height:r.height},slot:chosenInput,input:chosenInput};
    }
    return null;
  }

  function focusPin(dialog) {
    var input=dialog.input, i;
    if(dialog.slot) {
      var r=box(dialog.slot),p=r?center(r):null;
      if(p) clickAt(dialog.slot,p.x,p.y);
    }
    if(!input) {
      var inputs=document.querySelectorAll('input:not([type="hidden"]),textarea');
      for(i=0;i<inputs.length;i++) {
        if(!inputs[i].disabled && !inputs[i].readOnly) {input=inputs[i];break;}
      }
    }
    if(input) {
      try {input.focus();input.click();} catch(err) {}
    }
    message(input?'PIN selecionado | Introduz o codigo':'PIN selecionado | OK para escrever');
  }

  function draw() {
    if (!ui()) return;
    if (mouseMode) {
      ring.style.display='none'; mouse.style.display='block';
      mouse.style.left=(mx-11)+'px'; mouse.style.top=(my-11)+'px';
      return;
    }
    mouse.style.display='none';
    var pin=pinDialog();
    if(pin) {
      ring.className='pin-mode';
      ring.style.left=Math.max(0,pin.rect.left)+'px';
      ring.style.top=Math.max(0,pin.rect.top)+'px';
      ring.style.width=pin.rect.width+'px';ring.style.height=pin.rect.height+'px';
      ring.style.display='block';return;
    }
    ring.className='';
    if(!selected || !document.documentElement.contains(selected) ||
       !visible(selected) || Date.now()-lastActivity>14000) {
      ring.style.display='none'; return;
    }
    var r=box(selected);
    ring.style.left=Math.max(0,r.left)+'px';
    ring.style.top=Math.max(0,r.top)+'px';
    ring.style.width=r.width+'px'; ring.style.height=r.height+'px';
    ring.style.display='block';
  }
  function first(arr) {
    var ordered=arr.slice().sort(function(a,b) {
      var ra=box(a), rb=box(b);
      return Math.abs(ra.top-rb.top)>28 ? ra.top-rb.top : ra.left-rb.left;
    });
    return ordered.length?ordered[0]:null;
  }
  function step(key) {
    var arr=scan();
    if(!arr.length) {selected=null;draw();message('Sem elementos detetados');return;}
    if(arr.indexOf(selected)<0) selected=null;
    if(!selected) {
      selected=arr.indexOf(document.activeElement)>=0?
        document.activeElement:first(arr);
      draw();message('Selecionado | '+arr.length+' alvos');return;
    }
    var org=center(box(selected)), best=null, scoreBest=Infinity;
    for(var i=0;i<arr.length;i++) {
      var el=arr[i]; if(el===selected) continue;
      var p=center(box(el)), dx=p.x-org.x, dy=p.y-org.y, adv, cross;
      if(key===37) {adv=-dx;cross=Math.abs(dy);}
      else if(key===39) {adv=dx;cross=Math.abs(dy);}
      else if(key===38) {adv=-dy;cross=Math.abs(dx);}
      else {adv=dy;cross=Math.abs(dx);}
      if(adv<5) continue;
      var score=adv+cross*2.3+(cross>adv*1.7?cross:0);
      if(score<scoreBest) {scoreBest=score;best=el;}
    }
    if(best) selected=best;
    draw();
  }
  function clickAt(el,x,y) {
    if(!el || isOwn(el)) return;
    try {
      if(el.focus) el.focus();
      var init={bubbles:true,cancelable:true,view:window,
        clientX:x,clientY:y,screenX:x,screenY:y,button:0,buttons:1};
      if(typeof MouseEvent==='function') {
        el.dispatchEvent(new MouseEvent('mousedown',init));
        el.dispatchEvent(new MouseEvent('mouseup',init));
        el.dispatchEvent(new MouseEvent('click',init));
      } else if(el.click) el.click();
    } catch(err) { try {if(el.click) el.click();}catch(ignore) {} }
    setTimeout(draw,380);
  }
  function onKey(e) {
    var key=e.keyCode||e.which;
    var arrow=key===37||key===38||key===39||key===40;
    if(!arrow && key!==13 && key!==404 && key!==406) return;
    var active=document.activeElement;
    if(active && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName) &&
       key!==404 && key!==406) return;
    if(!ui()) return;
    e.preventDefault(); e.stopPropagation();
    if(e.stopImmediatePropagation) e.stopImmediatePropagation();
    lastActivity=Date.now();
    var pin=pinDialog();
    if(pin && !mouseMode && (arrow || key===13)) {
      if(key===13) focusPin(pin);
      draw();return;
    }
    if(key===404) {
      if(e.repeat) return;
      mouseMode=!mouseMode;
      if(mouseMode && selected) {var r=box(selected);if(r){mx=center(r).x;my=center(r).y;}}
      message(mouseMode?'Rato virtual: ON':'Navegacao por setas: ON');
      draw();return;
    }
    if(key===406) {if(!e.repeat)message('Alvos: '+scan().length);return;}
    if(mouseMode) {
      if(arrow) {
        var delta=e.repeat?42:32;
        if(key===37)mx-=delta;
        if(key===39)mx+=delta;
        if(key===38)my-=delta;
        if(key===40)my+=delta;
        mx=Math.max(2,Math.min(window.innerWidth-2,mx));
        my=Math.max(2,Math.min(window.innerHeight-2,my));draw();
      } else if(key===13)clickAt(document.elementFromPoint(mx,my),mx,my);
      return;
    }
    if(arrow) step(key);
    if(key===13) {
      if(!selected) {selected=first(scan());draw();}
      else {var rect=box(selected);if(rect){var p=center(rect);clickAt(selected,p.x,p.y);}}
    }
  }
  function start() {
    if(!ui()) return;
    document.addEventListener('keydown',onKey,true);
    setInterval(draw,650);
    message('Pronto | Setas + OK | Verde: rato');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,false);
  else start();
})();
