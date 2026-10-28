/* NOS TV Comando v5 — Samsung TizenBrew (ES5)
   Navegacao, scroll vertical/horizontal, destaque azul e PIN.
   Modulo experimental nao oficial; nao envia nem regista codigos PIN. */
(function () {
  'use strict';
  if (!/(^|\.)nostv\.pt$/i.test(location.hostname) || window.__nosRemoteV5) return;
  window.__nosRemoteV5 = true;

  var PREFIX='ntv5-', BLUE='#168cff';
  var selected=null, targets=[], ring=null, cursor=null, toast=null, panel=null;
  var mouseMode=false, mouseX=innerWidth/2, mouseY=innerHeight/2;
  var lastToast=0, timer=0, lastKey=0, lastDiag='', lastError='';
  var pinPad=false, pinValue='', pinIndex=0, pinData=null, pinStamp=0;
  var PIN_KEYS=['1','2','3','4','5','6','7','8','9','Apagar','0','Fechar'];
  var selector='a[href],button,input:not([type="hidden"]),textarea,select,summary,'+
    '[role="button"],[role="link"],[role="menuitem"],[role="tab"],[role="option"],'+
    '[onclick],[tabindex]:not([tabindex="-1"]),[data-testid],[class*="cursor-pointer"],'+
    '[class*="clickable"],[class*="Clickable"],[class*="swiper-slide"],'+
    '[class*="card"],[class*="Card"],[style*="cursor: pointer"]';

  function rect(el) {try{return el.getBoundingClientRect();}catch(e){return null;}}
  function center(r) {return {x:r.left+r.width/2,y:r.top+r.height/2};}
  function own(el) {
    while(el&&el.nodeType===1) {
      if(el.id && el.id.indexOf(PREFIX)===0)return true;
      el=el.parentElement;
    }
    return false;
  }
  function shown(el,allowOffscreen) {
    if(!el||own(el)||el.disabled||el.getAttribute('aria-hidden')==='true')return false;
    var r=rect(el);
    if(!r||r.width<10||r.height<10||r.width>innerWidth*.94||r.height>innerHeight*.84)return false;
    var s=window.getComputedStyle(el);
    if(!s||s.display==='none'||s.visibility==='hidden'||s.pointerEvents==='none'||parseFloat(s.opacity)<.05)return false;
    if(allowOffscreen)return true;
    if(r.bottom<4||r.right<4||r.left>innerWidth-4||r.top>innerHeight-4)return false;
    var cx=Math.max(4,Math.min(innerWidth-4,center(r).x));
    var cy=Math.max(4,Math.min(innerHeight-4,center(r).y));
    var at=document.elementFromPoint(cx,cy);
    if(at&&at!==el&&!el.contains(at)&&!at.contains(el))return false;
    return true;
  }
  function actionable(el) {
    if(!el||!el.tagName)return false;
    var tag=el.tagName,role=(el.getAttribute('role')||'').toLowerCase();
    if(/^(A|BUTTON|INPUT|TEXTAREA|SELECT|SUMMARY)$/.test(tag))
      return tag!=='A'||!!el.getAttribute('href');
    if(/^(button|link|tab|menuitem|option|checkbox|switch)$/.test(role))return true;
    if(el.hasAttribute('onclick')||el.getAttribute('tabindex')==='0')return true;
    var s=window.getComputedStyle(el);
    return s&&s.cursor==='pointer';
  }
  function ensureUI() {
    if(!document.body)return false;
    if(!document.getElementById(PREFIX+'css')) {
      var css=document.createElement('style');
      css.id=PREFIX+'css';
      css.textContent=[
        '#ntv5-ring{position:fixed!important;z-index:2147483639!important;',
        'display:none;pointer-events:none!important;box-sizing:border-box!important;',
        'border:4px solid #168cff!important;border-radius:8px!important;',
        'box-shadow:0 0 0 2px #061b4f,0 0 20px 5px rgba(22,140,255,.8)!important;}',
        '#ntv5-cursor{position:fixed!important;z-index:2147483640!important;',
        'display:none;pointer-events:none!important;width:22px;height:22px;',
        'border:4px solid #168cff!important;border-radius:50%!important;',
        'background:rgba(22,140,255,.28)!important;box-shadow:0 0 12px #168cff!important;}',
        '#ntv5-toast{position:fixed!important;right:12px!important;top:13px!important;',
        'z-index:2147483642!important;display:none;pointer-events:none!important;',
        'background:#002b64!important;color:#fff!important;',
        'border:2px solid #168cff!important;border-radius:6px!important;',
        'padding:8px 12px!important;font:17px Arial,sans-serif!important;}',
        '#ntv5-panel{position:fixed!important;left:5%!important;top:15%!important;',
        'z-index:2147483645!important;display:none;width:90%!important;',
        'max-height:68%!important;overflow:auto!important;',
        'background:#081b36!important;color:white!important;border:3px solid #168cff!important;',
        'border-radius:10px!important;padding:20px!important;font:18px Arial,sans-serif!important;}',
        '#ntv5-pinpad{position:fixed!important;z-index:2147483643!important;',
        'display:none;left:50%!important;top:50%!important;',
        'transform:translate(-50%,-50%)!important;box-sizing:border-box!important;',
        'width:420px!important;max-width:92vw!important;padding:16px!important;',
        'background:#102548!important;color:#fff!important;',
        'border:4px solid #168cff!important;border-radius:12px!important;',
        'font:20px Arial,sans-serif!important;text-align:center!important;',
        'box-shadow:0 8px 65px rgba(0,0,0,.85)!important;}',
        '#ntv5-pinpad .ntv5-grid{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:7px!important;}',
        '#ntv5-pinpad .ntv5-key{padding:12px 1px!important;border:2px solid #6484b2!important;',
        'border-radius:8px!important;background:#1c3760!important;}',
        '#ntv5-pinpad .ntv5-current{background:#065dbd!important;border-color:#ccecff!important;',
        'box-shadow:0 0 14px #168cff!important;}'
      ].join('');
      (document.head||document.documentElement).appendChild(css);
    }
    function make(id) {
      var e=document.getElementById(PREFIX+id);
      if(!e){e=document.createElement('div');e.id=PREFIX+id;document.body.appendChild(e);}
      return e;
    }
    ring=make('ring');cursor=make('cursor');toast=make('toast');panel=make('panel');
    var pad=make('pinpad');
    if(!pad.getAttribute('data-ready')) {
      var html='<div style="font-weight:bold;margin-bottom:8px">PIN do perfil NOS</div>'+
        '<div id="ntv5-dots" style="margin:12px;font-size:26px">○ ○ ○ ○</div>'+
        '<div class="ntv5-grid">';
      for(var i=0;i<PIN_KEYS.length;i++)html+='<div class="ntv5-key">'+PIN_KEYS[i]+'</div>';
      pad.innerHTML=html+'</div><div style="font-size:14px;margin-top:9px">Setas: selecionar · OK: inserir · Voltar: sair</div>';
      pad.setAttribute('data-ready','1');
    }
    return true;
  }
  function notify(msg) {
    if(!ensureUI())return;
    toast.textContent='NOS Comando v5 | '+msg;
    toast.style.display='block';lastToast=Date.now();
  }
  function drawBox(r) {
    if(!r||!ring)return;
    ring.style.left=Math.max(0,Math.round(r.left-3))+'px';
    ring.style.top=Math.max(0,Math.round(r.top-3))+'px';
    ring.style.width=Math.max(1,Math.round(r.width+6))+'px';
    ring.style.height=Math.max(1,Math.round(r.height+6))+'px';
    ring.style.display='block';
  }
  function fillPinPad() {
    var pad=document.getElementById(PREFIX+'pinpad');
    if(!pad)return;
    pad.style.display=pinPad?'block':'none';
    if(!pinPad)return;
    var keys=pad.querySelectorAll('.ntv5-key');
    for(var i=0;i<keys.length;i++)keys[i].className='ntv5-key'+(i===pinIndex?' ntv5-current':'');
    var dot=pad.querySelector('#ntv5-dots');
    if(dot) {
      var chars=[];
      for(i=0;i<4;i++)chars.push(i<pinValue.length?'●':'○');
      dot.textContent=chars.join(' ');
    }
  }
  function titlePin() {
    var all=document.querySelectorAll('h1,h2,h3,h4,span,p,label,div,strong');
    var best=null,min=Infinity;
    for(var i=0;i<all.length&&i<7000;i++) {
      var e=all[i];if(own(e))continue;
      var text=(e.textContent||'').replace(/\s+/g,' ').replace(/^\s+|\s+$/g,'');
      if(text.length>55||!/(introduza|insira|digite|enter).{0,18}\bpin\b/i.test(text))continue;
      var r=rect(e),s=r&&window.getComputedStyle(e);
      if(!r||!s||r.width<45||r.height<10||r.bottom<=0||r.top>=innerHeight||s.display==='none'||s.visibility==='hidden')continue;
      var area=r.width*r.height;
      if(area<min) {best=e;min=area;}
    }
    return best;
  }
  function allPinFields() {
    var out=[],roots=[document],seen=[],scope,els,i,k,e,sh;
    while(roots.length && seen.length<120) {
      scope=roots.shift();
      if(!scope || seen.indexOf(scope)>=0)continue;
      seen.push(scope);
      try {
        els=scope.querySelectorAll('input,textarea,[contenteditable="true"],[role="textbox"]');
        for(i=0;i<els.length;i++) if(!own(els[i]))out.push(els[i]);
        // Open Shadow DOM components may hide the actual OTP input.
        var nodes=scope.querySelectorAll('*');
        for(k=0;k<nodes.length && k<8500;k++) {
          e=nodes[k];if(e.shadowRoot)roots.push(e.shadowRoot);
          if(e.tagName==='IFRAME') {
            try {
              var doc=e.contentDocument;
              if(doc&&doc.body)roots.push(doc);
            } catch(ignore){}
          }
        }
      } catch(ignore2){}
    }
    return out;
  }
  function pinInputCandidates(heading,area) {
    var a=allPinFields(),hr=rect(heading),out=[],i,r,e,attrs,sc,near,x,y;
    for(i=0;i<a.length;i++) {
      e=a[i];
      if(!e||e.disabled||e.readOnly||e.type==='hidden')continue;
      r=rect(e);
      attrs=[e.id,e.name,e.className,e.getAttribute('autocomplete'),
        e.getAttribute('aria-label'),e.getAttribute('placeholder')].join(' ');
      sc=/pin|otp|one.time|pass|code|c[oó]digo/i.test(attrs)?180:0;
      if(e.maxLength===4)sc+=155;
      if(e.maxLength===1)sc+=130;
      if(/^(password|tel|number)$/.test(e.type||''))sc+=85;
      if(/^(tel|numeric|decimal)$/i.test(e.inputMode||''))sc+=60;
      if(r) {
        x=r.left+r.width/2;y=r.top+r.height/2;
        if(x>=hr.left-160&&x<=hr.right+420 &&
          y>=hr.top-35&&y<=hr.bottom+360)sc+=120;
        if(area && x>=area.left-100&&x<=area.left+area.width+100&&
           y>=area.top-80&&y<=area.top+area.height+100)sc+=145;
      }
      near=!!(r && x>=Math.max(0,hr.left-160)&&
        x<=Math.min(innerWidth,hr.right+440)&&
        y>=hr.top-35&&y<=hr.bottom+360);
      if((near||sc>=180)&&sc>=110)out.push({el:e,score:sc,rect:r});
    }
    out.sort(function(a,b){return b.score-a.score;});
    return out;
  }
  function pinCells(heading) {
    var hr=rect(heading);if(!hr)return null;
    var elements=document.querySelectorAll('input,div,span,button');
    var items=[];
    for(var i=0;i<elements.length&&i<8000;i++) {
      var e=elements[i];if(own(e))continue;
      var r=rect(e);
      if(!r||r.width<12||r.width>90||r.height<14||r.height>90)continue;
      if(r.left<hr.left-100||r.left>hr.right+300||
         r.top<hr.bottom+8||r.top>hr.bottom+240)continue;
      var st=window.getComputedStyle(e);
      if(st.display==='none'||st.visibility==='hidden')continue;
      // Ignore duplicate nested boxes at the same position.
      var duplicate=false;
      for(var z=0;z<items.length;z++) {
        var other=items[z].r;
        if(Math.abs(other.left-r.left)<3&&Math.abs(other.top-r.top)<3&&
           Math.abs(other.width-r.width)<5) {duplicate=true;break;}
      }
      if(!duplicate)items.push({el:e,r:r});
    }
    items.sort(function(a,b){return a.r.left-b.r.left;});
    var best=null,bestScore=Infinity;
    for(var a=0;a<items.length;a++) {
      var row=[items[a]];
      for(var b=a+1;b<items.length&&row.length<4;b++) {
        var nxt=items[b].r,pr=row[row.length-1].r,first=row[0].r;
        if(Math.abs(nxt.top-first.top)>9||Math.abs(nxt.width-first.width)>14||
           Math.abs(nxt.height-first.height)>14)continue;
        var gap=nxt.left-pr.right;
        if(gap>=-3&&gap<=40)row.push(items[b]);
      }
      if(row.length===4) {
        var r0=row[0].r,score=Math.abs(r0.width-r0.height)+
          Math.abs(r0.top-(hr.bottom+40))*.12;
        if(score<bestScore){best=row;bestScore=score;}
      }
    }
    if(!best)return null;
    var left=best[0].r.left,top=best[0].r.top,right=best[0].r.right,bottom=best[0].r.bottom;
    for(var k=1;k<4;k++) {
      left=Math.min(left,best[k].r.left);top=Math.min(top,best[k].r.top);
      right=Math.max(right,best[k].r.right);bottom=Math.max(bottom,best[k].r.bottom);
    }
    return {rect:{left:left,top:top,width:right-left,height:bottom-top},cells:best.map(function(x){return x.el;})};
  }
  function detectPin(force) {
    if(!force&&Date.now()-pinStamp<1000)return pinData;
    pinStamp=Date.now();
    var heading=titlePin();
    if(!heading) {pinData=null;pinPad=false;pinValue='';return null;}
    var cells=pinCells(heading),area=cells&&cells.rect;
    var inputs=pinInputCandidates(heading,area);
    if(!area&&inputs.length) {
      var ir=inputs[0].rect;
      if(ir&&ir.width>15&&ir.height>15)area=ir;
    }
    if(!area) {
      var hr=rect(heading);
      area={left:Math.max(0,hr.left+hr.width*.18),top:hr.bottom+Math.min(85,innerHeight*.11),
            width:Math.min(270,Math.max(115,hr.width*.85)),height:Math.min(57,innerHeight*.065)};
    }
    pinData={heading:heading,area:area,cells:cells?cells.cells:[],inputs:inputs};
    return pinData;
  }
  function draw() {
    if(!ensureUI())return;
    if(Date.now()-lastToast>3400)toast.style.display='none';
    var pin=detectPin(false);
    fillPinPad();
    if(mouseMode) {
      ring.style.display='none';cursor.style.display='block';
      cursor.style.left=(mouseX-11)+'px';cursor.style.top=(mouseY-11)+'px';return;
    }
    cursor.style.display='none';
    if(pin) {drawBox(pin.area);return;}
    if(!selected||!document.documentElement.contains(selected)||!shown(selected,false)) {
      ring.style.display='none';return;
    }
    drawBox(rect(selected));
  }
  function targetsInView(includeOffscreen) {
    var all=document.querySelectorAll(selector),result=[],i,e,j,r,duplicate;
    for(i=0;i<all.length&&i<8500&&result.length<450;i++) {
      e=all[i];if(!actionable(e)||!shown(e,includeOffscreen))continue;
      r=rect(e);duplicate=false;
      for(j=0;j<result.length;j++) {
        var q=rect(result[j]);
        if(q&&Math.abs(q.left-r.left)<5&&Math.abs(q.top-r.top)<5&&
           Math.abs(q.width-r.width)<9&&Math.abs(q.height-r.height)<9) {
          if(e.contains(result[j]))result[j]=e;
          duplicate=true;break;
        }
      }
      if(!duplicate)result.push(e);
    }
    return result;
  }
  function firstTarget(arr) {
    if(!arr.length)return null;
    var sorted=arr.slice().sort(function(a,b) {
      var ar=rect(a),br=rect(b);
      return Math.abs(ar.top-br.top)>45?ar.top-br.top:ar.left-br.left;
    });
    return sorted[0];
  }
  function nearest(arr,origin,key) {
    var best=null,bestScore=Infinity;
    for(var i=0;i<arr.length;i++) {
      var e=arr[i];if(e===selected)continue;
      var p=center(rect(e)),dx=p.x-origin.x,dy=p.y-origin.y,forward,perp;
      if(key===37){forward=-dx;perp=Math.abs(dy);}
      else if(key===39){forward=dx;perp=Math.abs(dy);}
      else if(key===38){forward=-dy;perp=Math.abs(dx);}
      else{forward=dy;perp=Math.abs(dx);}
      if(forward<9)continue;
      var score=forward+perp*2.2+(perp>forward*1.8?perp*1.7:0);
      if(score<bestScore){best=e;bestScore=score;}
    }
    return {el:best,score:bestScore};
  }

  // Small vertical channel rail (usually displayed on the right).
  // We must be able to LEAVE it instead of scrolling forever.
  function channelRail() {
    if(!selected)return null;
    var el=selected.parentElement,level=0;
    while(el&&el!==document.body&&level++<15) {
      var r=rect(el);
      if(r&&r.width>125&&r.width<innerWidth*.8&&r.height>innerHeight*.25 &&
         r.left>innerWidth*.15 &&
         el.scrollHeight>el.clientHeight+80) {
        var style=window.getComputedStyle(el);
        if(/auto|scroll|hidden/i.test(style.overflowY||'') ||
           el.scrollHeight>el.clientHeight+innerHeight*.45)
          return el;
      }
      el=el.parentElement;
    }
    return null;
  }
  function leaveChannelRail() {
    var rail=channelRail();if(!rail)return false;
    var rr=rect(rail),visibleTargets=targetsInView(false);
    var best=null,score=Infinity;
    for(var i=0;i<visibleTargets.length;i++) {
      var el=visibleTargets[i];if(rail.contains(el))continue;
      var r=rect(el);if(!r)continue;
      if(r.right>=rr.left-10)continue;
      var dist=(rr.left-r.right)*.30+
        Math.abs(center(r).y-center(rr).y)*1.7;
      if(dist<score){score=dist;best=el;}
    }
    if(!best) {
      // Prefer the TV 'Canais' tab over leaving the site.
      var nav=document.querySelectorAll('header a,nav a,header button,nav button,[role="navigation"] a');
      for(i=0;i<nav.length;i++) {
        el=nav[i];
        if(!shown(el,false))continue;
        var name=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
        if(name==='canais'||name==='início'||name==='inicio') {best=el;break;}
      }
    }
    if(!best) {
      for(i=0;i<visibleTargets.length;i++) {
        el=visibleTargets[i];if(rail.contains(el))continue;
        var ar=rect(el);
        if(ar&&ar.top<innerHeight*.28){best=el;break;}
      }
    }
    if(!best) return leaveToTop();
    selected=best;
    try{if(selected.focus)selected.focus({preventScroll:true});}catch(err){}
    draw();notify('Saíste da lista de canais');return true;
  }
  function leaveToTop() {
    var nav=document.querySelectorAll('header a,nav a,header button,nav button,[role="navigation"] a');
    for(var i=0;i<nav.length;i++) {
      var e=nav[i],t=(e.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(shown(e,false)&&(t==='canais'||t==='início'||t==='inicio')) {
        selected=e;draw();notify('Seleção no menu principal');return true;
      }
    }
    return false;
  }
  function canScroll(el,horizontal) {
    if(!el)return false;
    var extent=horizontal?(el.scrollWidth-el.clientWidth):(el.scrollHeight-el.clientHeight);
    return extent>22;
  }
  function scrollOne(el,key) {
    var horizontal=(key===37||key===39),sign=(key===37||key===38)?-1:1;
    var amount=sign*(horizontal?Math.max(190,innerWidth*.29):Math.max(175,innerHeight*.57));
    try {
      var before=horizontal?el.scrollLeft:el.scrollTop;
      if(horizontal)el.scrollLeft+=amount;else el.scrollTop+=amount;
      return Math.abs((horizontal?el.scrollLeft:el.scrollTop)-before)>2;
    }catch(err){return false;}
  }
  function tryCarouselArrow(key,base) {
    if(key!==37&&key!==39)return false;
    var container=base,depth=0;
    while(container&&depth++<8) {
      var arrows=container.querySelectorAll?container.querySelectorAll('button,[role="button"],a'):[],
          br=rect(base),choice=null,score=Infinity;
      for(var i=0;i<arrows.length&&i<120;i++) {
        var el=arrows[i],label=[el.getAttribute('aria-label'),el.getAttribute('title'),
          el.className,el.textContent].join(' ').toLowerCase();
        var relevant=key===39?/next|seguinte|pr[oó]ximo|right|swiper-button-next|chevron-right/:
          /prev|anterior|previous|left|swiper-button-prev|chevron-left/;
        if(!relevant.test(label)||!shown(el,false))continue;
        var r=rect(el),d=Math.abs(center(r).y-center(br).y);
        if(d<score){score=d;choice=el;}
      }
      if(choice) {try{choice.click();return true;}catch(err){}}
      container=container.parentElement;
    }
    return false;
  }
  function scrollFallback(key) {
    var horizontal=(key===37||key===39),current=selected||document.activeElement;
    var e=current,depth=0;
    while(e&&depth++<15) {
      if(canScroll(e,horizontal)&&scrollOne(e,key))return true;
      e=e.parentElement;
    }
    var all=document.querySelectorAll('main,section,article,div,[style*="overflow"]');
    var cr=current&&rect(current),chosen=null,score=Infinity;
    for(var i=0;i<all.length&&i<3500;i++) {
      var el=all[i];if(own(el)||!canScroll(el,horizontal))continue;
      var r=rect(el);if(!r||r.width<80||r.height<55||
          r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth)continue;
      var dist=cr?Math.abs(center(r).y-center(cr).y)+Math.abs(center(r).x-center(cr).x)*.3:0;
      if(dist<score){score=dist;chosen=el;}
    }
    if(chosen&&scrollOne(chosen,key))return true;
    if(!horizontal) {
      var root=document.scrollingElement||document.documentElement;
      if(canScroll(root,false)&&scrollOne(root,key))return true;
      try {
        var y=window.pageYOffset;
        window.scrollBy(0,(key===40?1:-1)*Math.max(160,innerHeight*.6));
        return Math.abs(window.pageYOffset-y)>2;
      }catch(err){}
    }
    return tryCarouselArrow(key,current||document.body);
  }
  function navigate(key) {
    targets=targetsInView(false);
    if(!targets.length) {selected=null;scrollFallback(key);draw();notify('Nenhum botao detetado');return;}
    if(targets.indexOf(selected)<0)selected=null;
    if(!selected){selected=firstTarget(targets);draw();return;}
    var result=nearest(targets,center(rect(selected)),key);
    var origin=center(rect(selected));
    if(result.el) {
      var candidateCenter=center(rect(result.el));
      var crossGap=(key===37||key===39)?
        Math.abs(candidateCenter.y-origin.y):Math.abs(candidateCenter.x-origin.x);
      var crossLimit=(key===37||key===39)?Math.max(75,innerHeight*.10):
        Math.max(160,innerWidth*.18);
      // Do not jump to an unrelated navigation menu at the end of a carousel.
      if(crossGap<=crossLimit) {
        selected=result.el;
        draw();
        return;
      }
      // On wide perpendicular jumps, prefer scrolling the current row/page.
      if(!scrollFallback(key)) {
        selected=result.el;draw();return;
      }
      notify('A deslocar '+(key===39?'direita':key===37?'esquerda':key===40?'baixo':'cima'));
      setTimeout(function() {
        var newlyVisible=targetsInView(false),next=nearest(newlyVisible,origin,key);
        if(next.el) {
          var ncenter=center(rect(next.el));
          var gap=(key===37||key===39)?
            Math.abs(ncenter.y-origin.y):Math.abs(ncenter.x-origin.x);
          if(gap<=crossLimit)selected=next.el;
        }
        draw();
      },200);
      return;
    }
    if(scrollFallback(key)) {
      notify('A deslocar '+(key===39?'direita':key===37?'esquerda':key===40?'baixo':'cima'));
      setTimeout(function() {
        var fresh=targetsInView(false),next=nearest(fresh,origin,key);
        if(next.el)selected=next.el;
        draw();
      },170);
    } else {
      notify('Limite da pagina / carrossel');
    }
  }
  function activate(el) {
    if(!el||own(el))return false;
    var r=rect(el);
    try {
      if(el.tagName==='INPUT'||el.tagName==='TEXTAREA') {
        el.focus();el.click();return true;
      }
      var target=el;
      if(r) {
        var p=center(r);
        var hit=document.elementFromPoint(
          Math.max(2,Math.min(innerWidth-2,p.x)),
          Math.max(2,Math.min(innerHeight-2,p.y)));
        if(hit&&el.contains(hit)&&!own(hit)) {
          var a=hit;
          while(a&&a!==el) {
            if(actionable(a)) {target=a;break;}
            a=a.parentElement;
          }
        }
      }
      if(target.focus)target.focus();
      // One native click only: do not dispatch mousedown/up/click separately.
      if(typeof target.click==='function')target.click();
      else target.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
      return true;
    }catch(err) {
      lastError='Clique: '+String(err).slice(0,130);
      notify('Erro ao abrir; ver diagnostico (azul)');
      return false;
    }
  }
  function nativeSet(e,value) {
    try {
      var realm=e.ownerDocument&&e.ownerDocument.defaultView||window;
      if(e.isContentEditable) {
        e.textContent=value;
      } else {
        var proto=e.tagName==='TEXTAREA'?realm.HTMLTextAreaElement.prototype:realm.HTMLInputElement.prototype;
        var desc=Object.getOwnPropertyDescriptor(proto,'value');
        if(desc&&desc.set)desc.set.call(e,value);else e.value=value;
      }
      try{
        if(typeof realm.InputEvent==='function')
          e.dispatchEvent(new realm.InputEvent('input',{
            bubbles:true,inputType:'insertText',data:value.slice(-1)}));
        else e.dispatchEvent(new realm.Event('input',{bubbles:true}));
      }catch(ignore){e.dispatchEvent(new realm.Event('input',{bubbles:true}));}
      e.dispatchEvent(new realm.Event('change',{bubbles:true}));
      return true;
    }catch(err){lastError='PIN: '+String(err).slice(0,130);return false;}
  }
  function dispatchPinDigit(target,digit) {
    if(!target)return false;
    try {
      if(target.focus)target.focus();
      var w=target.ownerDocument.defaultView||window;
      var types=['keydown','keypress','keyup'];
      for(var i=0;i<types.length;i++) {
        var e=target.ownerDocument.createEvent('Event');
        e.initEvent(types[i],true,true);
        try{Object.defineProperty(e,'key',{value:digit});}catch(ignore){}
        try{Object.defineProperty(e,'keyCode',{value:digit.charCodeAt(0)});}catch(ignore2){}
        try{Object.defineProperty(e,'which',{value:digit.charCodeAt(0)});}catch(ignore3){}
        target.dispatchEvent(e);
      }
      return true;
    }catch(err){return false;}
  }
  function writePin() {
    var pin=detectPin(true),ins=pin&&pin.inputs?pin.inputs:[],i;
    if(!pin)return false;
    var singles=[];
    for(i=0;i<ins.length;i++)if(ins[i].el.maxLength===1)singles.push(ins[i]);
    if(singles.length>=4) {
      var four=singles.slice(0,4).sort(function(a,b){
        return a.rect&&b.rect?a.rect.left-b.rect.left:0;
      }),okAll=true;
      for(i=0;i<4;i++) {
        try{four[i].el.focus();}catch(ignore){}
        if(!nativeSet(four[i].el,pinValue.charAt(i)||''))okAll=false;
      }
      return okAll;
    }
    if(ins.length) {
      try{ins[0].el.focus();}catch(ignore){}
      return nativeSet(ins[0].el,pinValue);
    }
    // Visual slots may be a custom keyboard-driven widget.
    // Synthetic key events are a fallback, not guaranteed to be accepted.
    if(pin.cells.length && pinValue.length) {
      var e=pin.cells[Math.min(pin.cells.length-1,pinValue.length-1)];
      var digit=pinValue.charAt(pinValue.length-1);
      return dispatchPinDigit(e,digit);
    }
    lastError='PIN: nenhum campo HTML encontrado na pagina / Shadow DOM acessivel.';
    return false;
  }
  function openPin() {
    var pin=detectPin(true);
    if(!pin)return;
    pinPad=true;pinValue='';pinIndex=0;fillPinPad();
    if(!pin.inputs.length&&pin.cells.length) {
      activate(pin.cells[0]);
      pin=detectPin(true);
    }
    notify(pin&&pin.inputs.length?'PIN: escolher numeros e OK':
      'PIN: tentar clicar na primeira caixa');
  }
  function enterPinKey(value) {
    if(value==='Fechar'){pinPad=false;pinValue='';draw();return;}
    if(value==='Apagar')pinValue=pinValue.slice(0,-1);
    else if(pinValue.length<4)pinValue+=value;
    var ok=writePin();
    fillPinPad();
    if(!ok) {
      // No usable DOM input: don't keep a sensitive value in memory.
      pinValue='';fillPinPad();notify('PIN nao acessivel; diagnostico no azul');return;
    }
    if(pinValue.length===4) {
      pinPad=false;pinValue='';
      setTimeout(draw,120);
      notify('PIN tentado; confirma se as caixas NOS mudaram');
    }
  }
  function movePad(key) {
    var row=Math.floor(pinIndex/3),col=pinIndex%3;
    if(key===37)col=(col+2)%3;
    if(key===39)col=(col+1)%3;
    if(key===38)row=(row+3)%4;
    if(key===40)row=(row+1)%4;
    pinIndex=row*3+col;fillPinPad();
  }

  function nativePinFocus() {
    var pin=detectPin(true),i,el;
    if(!pin)return false;
    // Click the first visual box, then focus the actual input.
    if(pin.cells.length) {
      try {
        var c=rect(pin.cells[0]),p=c?center(c):null;
        if(p) {
          var node=document.elementFromPoint(p.x,p.y)||pin.cells[0];
          activate(node);
        }
      }catch(err){}
    }
    for(i=0;i<pin.inputs.length;i++) {
      el=pin.inputs[i].el;
      if(el.disabled||el.readOnly)continue;
      try {
        if(el.focus)el.focus();
        if(document.activeElement===el) {
          // The Samsung IME may open when the actual field is clicked.
          if(el.click)el.click();
          notify('Campo de PIN focado; tenta escrever');
          return true;
        }
      }catch(err){}
    }
    notify('Campo de PIN não focável; teclado alternativo');
    return false;
  }
  function diagnostic() {
    var pin=detectPin(true),scrolls=0;
    var els=document.querySelectorAll('main,div,section,article');
    for(var i=0;i<els.length&&i<3000;i++)
      if(canScroll(els[i],true)||canScroll(els[i],false))scrolls++;
    var d=['NOS TV — Diagnostico v5','URL: '+location.pathname,
      'Botoes visiveis: '+targetsInView(false).length,
      'Areas scroll possiveis: '+scrolls,
      'PIN detetado: '+(pin?'SIM':'NAO'),
      'Inputs DOM total (nao valores): '+allPinFields().length,
      'Caixas PIN: '+(pin?pin.cells.length:0),
      'Campos PIN: '+(pin?pin.inputs.length:0),
      'Tipos de campo: '+(pin?pin.inputs.slice(0,4).map(function(x){
        var e=x.el;return e.tagName.toLowerCase()+
          (e.tagName==='INPUT'?'['+(e.type||'text')+']':'')+
          '(max '+(e.maxLength||'?')+')';
      }).join(', '):'nenhum'),
      'Iframes: '+document.getElementsByTagName('iframe').length,
      'Video DOM: '+document.getElementsByTagName('video').length,
      'Motor: '+navigator.userAgent.slice(0,145),
      'Erros video: '+Array.prototype.map.call(document.querySelectorAll('video'),function(v){return v.error?v.error.code:'-';}).join(','),
      'MSE: '+(typeof window.MediaSource!=='undefined'?'SIM':'NAO'),
      'EME API: '+(typeof navigator.requestMediaKeySystemAccess==='function'?'SIM':'NAO'),
      'URL player: '+location.pathname,
      'Ultimo erro JS: '+(lastError||'nenhum'),
      'Verde: rato virtual / Azul: fechar este painel'];
    panel.textContent=d.join('\n');
    panel.style.whiteSpace='pre-wrap';
    panel.style.display=panel.style.display==='block'?'none':'block';
  }
  function handleKey(e) {
    var k=e.keyCode||e.which;
    var arrow=k===37||k===38||k===39||k===40;
    if(!arrow&&k!==13&&k!==404&&k!==406&&k!==10009&&k!==8&&!(k>=48&&k<=57))return;
    var inRail=channelRail();
    var channelView=location.pathname.toLowerCase().indexOf('canais')>=0||
      !!document.querySelector('[aria-current="page"][href*="canais"]');
    if(!channelView) {
      // NOS uses an SPA: the active Canais tab may not change the URL.
      var navs=document.querySelectorAll('header a,header button,nav a,nav button,[role="tab"]');
      for(var ci=0;ci<navs.length&&ci<90;ci++) {
        var textNav=(navs[ci].textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
        if(textNav==='canais'&&shown(navs[ci],false)) {
          channelView=true;break;
        }
      }
    }
    var railLike=!!inRail;
    if(!railLike&&selected&&channelView) {
      var sr=rect(selected);
      railLike=!!(sr&&sr.top>innerHeight*.20&&sr.left>innerWidth*.22);
    }
    if(k===10009&&!pinPad&&panel.style.display!=='block'&&!railLike)return;
    var target=e.target,tag=target&&target.tagName;
    // Let Samsung's genuine on-screen keyboard type into a focused field.
    // Intercepting those keys prevents the real NOS form from changing.
    if(!pinPad && /^(INPUT|TEXTAREA|SELECT)$/.test(tag) &&
       k!==404 && k!==406)return;
    // Prevent repeated keydown duplicate on Samsung remotes.
    if(k===13&&e.repeat)return;
    if(k===404&&e.repeat)return;
    e.preventDefault();e.stopPropagation();
    if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    if(k===406){diagnostic();return;}
    if(panel.style.display==='block') {
      if(k===10009)panel.style.display='none';
      return;
    }
    if(k===10009&&pinPad){pinPad=false;pinValue='';draw();return;}
    if(k===10009&&railLike){
      if(!leaveChannelRail()) {
        if(!leaveToTop()){selected=null;draw();notify('Saiu da lista; escolhe menu superior');}
      }
      return;
    }
    // Left immediately escapes the vertical channel list.
    if(k===37&&railLike&&!mouseMode&&!pinPad) {
      if(!leaveChannelRail()) {
        if(!leaveToTop()){selected=null;draw();notify('Saiu da lista; escolhe menu superior');}
      }
      return;
    }
    if(k===404) {
      mouseMode=!mouseMode;
      if(mouseMode&&selected) {
        var r=rect(selected);
        if(r){mouseX=center(r).x;mouseY=center(r).y;}
      }
      notify(mouseMode?'Rato virtual ON':'Navegacao por setas ON');
      draw();return;
    }
    var pin=detectPin(false);
    if(pin&&!mouseMode) {
      if(!pinPad) {
        if(k===13) {
          if(!nativePinFocus())openPin();
        }
        else if(k>=48&&k<=57){openPin();enterPinKey(String(k-48));}
        draw();return;
      }
      if(arrow)movePad(k);
      else if(k===13)enterPinKey(PIN_KEYS[pinIndex]);
      else if(k===8)enterPinKey('Apagar');
      else if(k>=48&&k<=57)enterPinKey(String(k-48));
      draw();return;
    }
    if(mouseMode) {
      if(arrow) {
        var amount=e.repeat?55:38;
        if(k===37)mouseX-=amount;
        if(k===39)mouseX+=amount;
        if(k===38)mouseY-=amount;
        if(k===40)mouseY+=amount;
        mouseX=Math.min(innerWidth-4,Math.max(4,mouseX));
        mouseY=Math.min(innerHeight-4,Math.max(4,mouseY));
        draw();
      }else if(k===13) {
        var hit=document.elementFromPoint(mouseX,mouseY);
        if(hit)activate(hit);
      }
      return;
    }
    if(arrow)navigate(k);
    else if(k===13) {
      if(!selected){selected=firstTarget(targetsInView(false));draw();}
      else activate(selected);
    }
  }
  function start() {
    if(!ensureUI())return;
    document.addEventListener('keydown',handleKey,true);
    window.addEventListener('error',function(e) {
      lastError=String(e.message||'Erro da pagina').slice(0,180);
    });
    window.addEventListener('unhandledrejection',function() {
      lastError='Falha de pedido/script da NOS (ver ecra).';
    });
    timer=setInterval(draw,800);
    notify('v5 ativa | azul | esquerda/voltar: sair canais');
    draw();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,false);
  else start();
})();
