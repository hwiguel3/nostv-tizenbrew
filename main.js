/* NOS TV Comando v1: modulo experimental para TizenBrew.
   Navegacao espacial propria, contorno independente de :focus e rato virtual.
   Nao e uma aplicacao oficial NOS. ES5 para Tizen 6. */
(function () {
  'use strict';
  if (!/(^|\.)nostv\.pt$/i.test(location.hostname) || window.__nosRemoteV1) return;
  window.__nosRemoteV1 = true;

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
    info.textContent='NOS Comando v1 | '+s;
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
  function draw() {
    if (!ui()) return;
    if (mouseMode) {
      ring.style.display='none'; mouse.style.display='block';
      mouse.style.left=(mx-11)+'px'; mouse.style.top=(my-11)+'px';
      return;
    }
    mouse.style.display='none';
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
