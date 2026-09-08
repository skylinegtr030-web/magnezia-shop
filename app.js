(function(){
var CART_KEY='magnezia_cart';
var PROMO_KEY='magnezia_promo';
var PROMO_CODES={'MAGNEZIA10':0.10,'SPORT5':0.05};
var SHEET_ID='1J8oLE0RabDCRmSpNS5TWNOMotYv5eZprSbplVGEFRFw';
var CSV_URL='https://docs.google.com/spreadsheets/d/'+SHEET_ID+'/gviz/tq?tqx=out:csv&sheet='+encodeURIComponent('товары');

function getCart(){try{return JSON.parse(localStorage.getItem(CART_KEY))||[];}catch(e){return [];}}
function saveCart(cart){localStorage.setItem(CART_KEY,JSON.stringify(cart));renderCart();}
function getPromo(){try{return JSON.parse(localStorage.getItem(PROMO_KEY))||null;}catch(e){return null;}}
function setPromo(p){localStorage.setItem(PROMO_KEY,JSON.stringify(p));renderCart();}

function addToCart(id,name,price){
  var cart=getCart();
  var item=cart.find(function(i){return i.id===id;});
  if(item){item.qty+=1;}else{cart.push({id:id,name:name,price:price,qty:1});}
  saveCart(cart);
  showToast(name+' добавлен в корзину');
  bumpCartIcon();
  openDrawer();
}
function bumpCartIcon(){
  var btn=document.getElementById('cartBtn');
  if(!btn)return;
  btn.classList.add('bump');
  setTimeout(function(){btn.classList.remove('bump');},260);
}
function changeQty(id,delta){
  var cart=getCart();
  var item=cart.find(function(i){return i.id===id;});
  if(!item)return;
  item.qty+=delta;
  if(item.qty<=0){cart=cart.filter(function(i){return i.id!==id;});}
  saveCart(cart);
}
function removeItem(id){
  var cart=getCart().filter(function(i){return i.id!==id;});
  saveCart(cart);
}
function cartSubtotal(cart){return cart.reduce(function(sum,i){return sum+i.price*i.qty;},0);}
function cartCount(cart){return cart.reduce(function(sum,i){return sum+i.qty;},0);}
function cartTotal(cart){
  var subtotal=cartSubtotal(cart);
  var promo=getPromo();
  if(promo&&PROMO_CODES[promo.code]){return Math.round(subtotal*(1-PROMO_CODES[promo.code]));}
  return subtotal;
}
function fmt(n){return n.toLocaleString('ru-RU')+' ₽';}

var lastTotal=null;
function renderCart(){
  var cart=getCart();
  var wrap=document.getElementById('cartItems');
  var countEl=document.getElementById('cartCount');
  var totalEl=document.getElementById('cartTotal');
  var discountRow=document.getElementById('discountRow');
  var promo=getPromo();
  if(countEl)countEl.textContent=cartCount(cart);
  var total=cartTotal(cart);
  if(totalEl){
    totalEl.textContent=fmt(total);
    if(lastTotal!==null&&lastTotal!==total){
      totalEl.classList.add('pulse');
      setTimeout(function(){totalEl.classList.remove('pulse');},220);
    }
    lastTotal=total;
  }
  if(discountRow){
    if(promo&&PROMO_CODES[promo.code]){
      var saved=cartSubtotal(cart)-cartTotal(cart);
      discountRow.style.display='flex';
      discountRow.querySelector('span').textContent='Промокод '+promo.code+' (−'+Math.round(PROMO_CODES[promo.code]*100)+'%): −'+fmt(saved);
    }else{
      discountRow.style.display='none';
    }
  }
  if(!wrap)return;
  if(cart.length===0){wrap.innerHTML='<p class="empty">Корзина пока пуста.</p>';return;}
  wrap.innerHTML=cart.map(function(i){
    return '<div class="cart-row" data-id="'+i.id+'">'+
      '<div><b>'+i.name+'</b><br><small>'+fmt(i.price)+' × '+i.qty+'</small>'+
      '<div class="quantity"><button type="button" data-action="dec">−</button><span>'+i.qty+'</span><button type="button" data-action="inc">+</button></div></div>'+
      '<button type="button" class="close" data-action="remove" style="position:static;font-size:22px">×</button>'+
    '</div>';
  }).join('');
}
function applyPromo(){
  var input=document.getElementById('promoInput');
  var msg=document.getElementById('promoMsg');
  if(!input)return;
  var code=input.value.trim().toUpperCase();
  if(!code){return;}
  if(PROMO_CODES[code]){
    setPromo({code:code});
    if(msg){msg.textContent='Промокод применён: -'+Math.round(PROMO_CODES[code]*100)+'%';msg.className='promo-msg ok';}
  }else{
    setPromo(null);
    if(msg){msg.textContent='Промокод не найден';msg.className='promo-msg err';}
  }
}
function showToast(msg){
  var toast=document.getElementById('toast');
  if(!toast)return;
  toast.textContent=msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t=setTimeout(function(){toast.classList.remove('show');},2200);
}
function openDrawer(){var d=document.getElementById('drawer');if(d)d.classList.add('open');}
function closeDrawer(){var d=document.getElementById('drawer');if(d)d.classList.remove('open');}
function openModal(id){var m=document.getElementById(id);if(m)m.classList.add('open');}
function closeModal(id){var m=document.getElementById(id);if(m)m.classList.remove('open');}
function openLightbox(src){
  var lb=document.getElementById('lightbox');
  var img=document.getElementById('lightboxImg');
  if(!lb||!img)return;
  img.src=src;
  lb.classList.add('open');
}
function closeLightbox(){
  var lb=document.getElementById('lightbox');
  if(lb)lb.classList.remove('open');
}
function switchTab(tab){
  document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active');});
  tab.classList.add('active');
  var target=tab.dataset.tab;
  var groups=document.querySelectorAll('.products');
  groups.forEach(function(p){p.classList.add('fading');});
  setTimeout(function(){
    groups.forEach(function(p){
      p.classList.toggle('hidden',p.id!==target);
      p.classList.remove('fading');
    });
  },180);
}

function parseCSV(text){
  var rows=[];var row=[];var cell='';var inQuotes=false;
  for(var i=0;i<text.length;i++){
    var c=text[i];
    if(inQuotes){
      if(c==='"'){ if(text[i+1]==='"'){cell+='"';i++;} else {inQuotes=false;} }
      else{cell+=c;}
    }else{
      if(c==='"'){inQuotes=true;}
      else if(c===','){row.push(cell);cell='';}
      else if(c==='\n'||c==='\r'){
        if(c==='\r'&&text[i+1]==='\n')i++;
        row.push(cell);cell='';rows.push(row);row=[];
      }else{cell+=c;}
    }
  }
  if(cell.length||row.length){row.push(cell);rows.push(row);}
  return rows.filter(function(r){return r.length&&r.some(function(x){return x!=='';});});
}
function cardHTML(p){
  var badge=p.badge?'<span class="badge">'+p.badge.toUpperCase()+'</span>':'';
  return '<article class="card tilt" data-id="'+p.id+'" data-name="'+p.name+'" data-price="'+p.price+'">'+badge+
    '<div class="card-media"><img src="'+p.photo+'" alt="'+p.name+'" loading="lazy"></div>'+
    '<div class="card-body"><h3>'+p.name+'</h3><p>'+(p.desc||'')+'</p>'+
    '<div class="card-footer"><strong>'+Math.round(p.price).toLocaleString('ru-RU')+' ₽</strong><button type="button" class="btn add">В корзину</button></div></div></article>';
}
function loadCatalogFromSheet(){
  if(!window.fetch)return;
  fetch(CSV_URL).then(function(r){if(!r.ok)throw new Error('no sheet');return r.text();}).then(function(text){
    var rows=parseCSV(text);
    if(rows.length<2)return;
    var products=rows.slice(1).map(function(r){
      return {id:r[0],name:r[1],price:parseFloat(r[2])||0,category:(r[3]||'').trim(),photo:r[4],badge:r[5],desc:r[6]};
    }).filter(function(p){return p.id&&p.name&&p.photo;});
    if(!products.length)return;
    var byCat={};
    products.forEach(function(p){
      var cat=p.category==='bricks'?'bricks':'powder';
      byCat[cat]=byCat[cat]||[];
      byCat[cat].push(p);
    });
    Object.keys(byCat).forEach(function(cat){
      var el=document.getElementById(cat);
      if(el)el.innerHTML=byCat[cat].map(cardHTML).join('');
    });
    initTilt();
  }).catch(function(){ /* держим статичный каталог с реальными фото, если таблица недоступна */ });
}

function initScrollProgress(){
  var bar=document.getElementById('scrollProgress');
  if(!bar)return;
  window.addEventListener('scroll',function(){
    var h=document.documentElement;
    var pct=(h.scrollTop)/((h.scrollHeight-h.clientHeight)||1)*100;
    bar.style.width=pct+'%';
  },{passive:true});
}

function initParallax(){
  var heroImg=document.getElementById('heroImg');
  var parallaxImgs=document.querySelectorAll('.parallax-img');
  window.addEventListener('scroll',function(){
    var y=window.scrollY;
    if(heroImg)heroImg.style.transform='translateY('+(y*0.18)+'px)';
    parallaxImgs.forEach(function(img){
      var rect=img.getBoundingClientRect();
      var offset=(window.innerHeight-rect.top)*0.05;
      img.style.transform='translateY('+(-offset)+'px)';
    });
  },{passive:true});
}

function initTilt(){
  document.querySelectorAll('.tilt').forEach(function(card){
    if(card._tiltBound)return;
    card._tiltBound=true;
    card.addEventListener('mousemove',function(e){
      var r=card.getBoundingClientRect();
      var x=(e.clientX-r.left)/r.width-0.5;
      var y=(e.clientY-r.top)/r.height-0.5;
      card.style.transform='translateY(-6px) rotateX('+(-y*8)+'deg) rotateY('+(x*10)+'deg)';
    });
    card.addEventListener('mouseleave',function(){
      card.style.transform='';
    });
  });
}

function initMagnetic(){
  document.querySelectorAll('.magnetic').forEach(function(btn){
    btn.addEventListener('mousemove',function(e){
      var r=btn.getBoundingClientRect();
      var x=(e.clientX-r.left-r.width/2)*0.25;
      var y=(e.clientY-r.top-r.height/2)*0.4;
      btn.style.transform='translate('+x+'px,'+y+'px)';
    });
    btn.addEventListener('mouseleave',function(){btn.style.transform='';});
  });
}

function initDust(){
  var canvas=document.getElementById('dust');
  var hero=document.getElementById('heroSection');
  if(!canvas||!hero)return;
  var ctx=canvas.getContext('2d');
  var W,H,particles=[];
  function resize(){
    W=canvas.width=hero.offsetWidth;
    H=canvas.height=hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize',resize);
  var count=window.innerWidth<800?35:70;
  for(var i=0;i<count;i++){
    particles.push({
      x:Math.random()*W,y:Math.random()*H,
      r:Math.random()*2.2+0.6,
      vx:(Math.random()-0.5)*0.25,
      vy:-Math.random()*0.35-0.05,
      a:Math.random()*0.5+0.15
    });
  }
  function tick(){
    ctx.clearRect(0,0,W,H);
    particles.forEach(function(p){
      p.x+=p.vx;p.y+=p.vy;
      if(p.y<-5){p.y=H+5;p.x=Math.random()*W;}
      if(p.x<-5)p.x=W+5;
      if(p.x>W+5)p.x=-5;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle='rgba(255,255,255,'+p.a+')';
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  tick();
}

document.addEventListener('click',function(e){
  var addBtn=e.target.closest('.add');
  if(addBtn){
    var card=addBtn.closest('.card');
    addToCart(card.dataset.id,card.dataset.name,parseFloat(card.dataset.price));
    return;
  }
  var tab=e.target.closest('.tab');
  if(tab){switchTab(tab);return;}
  var galleryItem=e.target.closest('.gallery-item');
  if(galleryItem){openLightbox(galleryItem.dataset.full);return;}
  if(e.target.id==='closeLightbox'||e.target.id==='lightbox'){closeLightbox();return;}
  if(e.target.id==='cartBtn'){openDrawer();return;}
  if(e.target.id==='closeCart'){closeDrawer();return;}
  if(e.target.id==='drawer'){closeDrawer();return;}
  if(e.target.id==='wholesaleBtn'){openModal('wholesaleModal');return;}
  if(e.target.id==='applyPromo'){applyPromo();return;}
  if(e.target.id==='checkoutBtn'){
    var cart=getCart();
    if(cart.length===0){showToast('Корзина пуста');return;}
    var promo=getPromo();
    var productsField=document.getElementById('orderProducts');
    var totalField=document.getElementById('orderTotal');
    if(productsField)productsField.value=cart.map(function(i){return i.name+' x'+i.qty+' = '+(i.price*i.qty)+' ₽';}).join('; ')+(promo&&PROMO_CODES[promo.code]?(' | промокод '+promo.code):'');
    if(totalField)totalField.value=fmt(cartTotal(cart));
    closeDrawer();
    openModal('orderModal');
    return;
  }
  var closeBtn=e.target.closest('[data-close]');
  if(closeBtn){closeModal(closeBtn.dataset.close);return;}
  if(e.target.classList.contains('modal')){e.target.classList.remove('open');return;}
  if(e.target.id==='burger'){document.getElementById('nav').classList.toggle('open');return;}
  var qtyBtn=e.target.closest('[data-action]');
  if(qtyBtn){
    var row=qtyBtn.closest('.cart-row');
    var id=row.dataset.id;
    var action=qtyBtn.dataset.action;
    if(action==='inc')changeQty(id,1);
    if(action==='dec')changeQty(id,-1);
    if(action==='remove')removeItem(id);
    return;
  }
});

document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){closeLightbox();}
});

document.addEventListener('DOMContentLoaded',function(){
  renderCart();
  loadCatalogFromSheet();
  initScrollProgress();
  initParallax();
  initTilt();
  initMagnetic();
  initDust();
  if('IntersectionObserver' in window){
    var obs=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){entry.target.classList.add('visible');obs.unobserve(entry.target);}
      });
    },{threshold:0.12});
    document.querySelectorAll('.reveal, .stagger').forEach(function(el){obs.observe(el);});
  }else{
    document.querySelectorAll('.reveal, .stagger').forEach(function(el){el.classList.add('visible');});
  }
});
})();
