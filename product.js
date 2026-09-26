(function(){
  const qs=new URLSearchParams(location.search), id=qs.get('id');
  const root=document.getElementById('productDetail');
  const products=JSON.parse(localStorage.getItem('ld_products')||'null')||defaultProducts;
  const p=products.find(x=>x.id===id);
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
  if(!p){root.innerHTML='<div class="product-not-found"><h1>Product not found</h1><a class="gold-button" href="index.html#shop">Back to Shop</a></div>';return;}
  const photos=Array.isArray(p.images)&&p.images.length?p.images:(p.image?[p.image]:[]);
  const specs=Array.isArray(p.specs)?p.specs:(p.specs?String(p.specs).split(/\\n|\\r?\\n/).filter(Boolean):[]);
  root.innerHTML=`<div class="product-breadcrumb"><a href="index.html#shop">Shop</a><span>›</span><strong>${esc(p.name)}</strong></div>
  <section class="product-detail-card"><div class="product-gallery"><div class="product-main-photo ${photos.length?'':'placeholder'}"><img id="mainProductPhoto" src="${photos[0]||''}" alt="${esc(p.name)}" ${photos.length?'':'style="display:none"'}>${photos.length?'':'<span>'+esc(p.category)+'</span>'}</div><div class="product-thumbs">${photos.map((src,i)=>`<button class="product-thumb ${i===0?'active':''}" type="button" onclick="showProductPhoto(${i})"><img src="${src}" alt="${esc(p.name)} photo ${i+1}"></button>`).join('')}</div></div>
  <div class="product-detail-copy"><span class="tag">${esc(p.category)}</span><h1>${esc(p.name)}</h1><p class="product-price">৳ ${esc(p.price)}</p><p class="product-short">${esc(p.description||'A beautiful piece selected for your little day dream.')}</p>${p.color?`<div class="product-option"><span>Color</span><strong>${esc(p.color)}</strong></div>`:''}${p.size?`<div class="product-option"><span>Size</span><strong>${esc(p.size)}</strong></div>`:''}${p.weight?`<div class="product-option"><span>Weight</span><strong>${esc(p.weight)}</strong></div>`:''}<div class="detail-qty"><span>Quantity</span><div><button type="button" onclick="changeDetailQty(-1)">−</button><strong id="detailQty">1</strong><button type="button" onclick="changeDetailQty(1)">+</button></div></div><div class="detail-actions"><button class="buy-now-btn" type="button" onclick="buyProductNow()">Buy Now</button><button class="add-cart-large" type="button" onclick="addDetailToCart()">Add to Cart</button></div><p class="detail-note">Secure checkout • Bangladesh delivery • Payment by bKash, Nagad or Cash on Delivery</p></div></section>
  <section class="product-description-section"><div class="product-description-head"><span class="gold-eyebrow">PRODUCT DETAILS</span><h2>About this product</h2></div><div class="product-description-body"><p>${esc(p.details||p.description||'Product details will be added by the admin.')}</p>${specs.length?`<div class="product-specs"><h3>Details</h3><ul>${specs.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}</div></section>`;
  let currentPhoto=0, qty=1;
  window.showProductPhoto=function(i){currentPhoto=i;const img=document.getElementById('mainProductPhoto');if(img&&photos[i])img.src=photos[i];document.querySelectorAll('.product-thumb').forEach((b,n)=>b.classList.toggle('active',n===i))};
  window.changeDetailQty=function(d){qty=Math.max(1,qty+d);document.getElementById('detailQty').textContent=qty};
  window.addDetailToCart=function(){const cart=getCart();const found=cart.find(x=>x.id===p.id);if(found)found.qty+=qty;else cart.push({id:p.id,qty});saveCart(cart);openCart()};
  window.buyProductNow=function(){document.getElementById('orderProduct').value=p.id;document.getElementById('orderCartItems').value='';document.getElementById('customerQty').value=qty;document.getElementById('orderTitle').textContent='Order: '+p.name;document.getElementById('orderModal').classList.add('show');updateOrderTotal();document.getElementById('customerName').focus()};
  updateCartUI();
})();
