(function(){
var CART_KEY='magnezia_cart';
function getCart(){try{return JSON.parse(localStorage.getItem(CART_KEY))||[];}catch(e){return [];}}
function saveCart(cart){localStorage.setItem(CART_KEY,JSON.stringify(cart));renderCart();}
function addToCart(id,name,price){
  var cart=getCart();
  var item=cart.find(function(i){return i.id===id;});
  if(item){item.qty+=1;}else{cart.push({id:id,name:name,price:price,qty:1});}
  saveCart(cart);
  showToast(name+' добавлен в корзину');
  openDrawer();
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
function cartTotal(cart){return cart.reduce(function(sum,i){return sum+i.price*i.qty;},0);}
function cartCount(cart){return cart.reduce(function(sum,i){return sum+i.qty;},0);}
function renderCart(){
  var cart=getCart();
  var wrap=document.getElementById('cartItems');
  var countEl=document.getElementById('cartCount');
  var totalEl=document.getElementById('cartTotal');
  if(countEl)countEl.textContent=cartCount(cart);
  if(totalEl)totalEl.textContent=cartTotal(cart).toLocaleString('ru-RU')+' ₽';
  if(!wrap)return;
  if(cart.length===0){wrap.innerHTML='<p class="empty">Корзина пока пуста.</p>';return;}
  wrap.innerHTML=cart.map(function(i){
    return '<div class="cart-row" data-id="'+i.id+'">'+
      '<div><b>'+i.name+'</b><br><small>'+i.price.toLocaleString('ru-RU')+' ₽ × '+i.qty+'</small>'+
      '<div class="quantity"><button type="button" data-action="dec">−</button><span>'+i.qty+'</span><button type="button" data-action="inc">+</button></div></div>'+
      '<button type="button" class="close" data-action="remove" style="position:static;font-size:22px">×</button>'+
    '</div>';
  }).join('');
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

document.addEventListener('click',function(e){
  var addBtn=e.target.closest('.add');
  if(addBtn){
    var card=addBtn.closest('.card');
    addToCart(card.dataset.id,card.dataset.name,parseFloat(card.dataset.price));
    return;
  }
  var tab=e.target.closest('.tab');
  if(tab){
    document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active');});
    tab.classList.add('active');
    var target=tab.dataset.tab;
    document.querySelectorAll('.products').forEach(function(p){
      p.classList.toggle('hidden',p.id!==target);
    });
    return;
  }
  if(e.target.id==='cartBtn'){openDrawer();return;}
  if(e.target.id==='closeCart'){closeDrawer();return;}
  if(e.target.id==='drawer'){closeDrawer();return;}
  if(e.target.id==='wholesaleBtn'){openModal('wholesaleModal');return;}
  if(e.target.id==='checkoutBtn'){
    var cart=getCart();
    if(cart.length===0){showToast('Корзина пуста');return;}
    var productsField=document.getElementById('orderProducts');
    var totalField=document.getElementById('orderTotal');
    if(productsField)productsField.value=cart.map(function(i){return i.name+' x'+i.qty+' = '+(i.price*i.qty)+' ₽';}).join('; ');
    if(totalField)totalField.value=cartTotal(cart).toLocaleString('ru-RU')+' ₽';
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

document.addEventListener('DOMContentLoaded',function(){
  renderCart();
  if('IntersectionObserver' in window){
    var obs=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){entry.target.classList.add('visible');obs.unobserve(entry.target);}
      });
    },{threshold:0.12});
    document.querySelectorAll('.reveal').forEach(function(el){obs.observe(el);});
  }else{
    document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('visible');});
  }
});
})();
