const defaultProducts=[
{id:"p1",name:"Your Cosmetic Product",category:"Cosmetics",price:"450",image:"",description:"A carefully selected beauty essential for your everyday routine."},
{id:"p2",name:"Handmade Creation",category:"Handmade",price:"550",image:"",description:"A unique handmade piece prepared with care and attention to detail."},
{id:"p3",name:"Beauty Essential",category:"Cosmetics",price:"650",image:"",description:"A lovely beauty pick chosen to make your daily routine feel special."},
{id:"p4",name:"Handmade Gift",category:"Handmade",price:"750",image:"",description:"A thoughtful handmade gift for someone special."}];

const defaultSettings={
siteName:"Little Daydream",
heroEyebrow:"LITTLE DAYDREAM • COSMETICS & HANDMADE",
heroTitle:"Little things, thoughtfully chosen for your day.",
heroText:"Discover beautiful cosmetics and handmade pieces, selected with care so every order feels a little more special.",
step1Title:"Choose",step1Text:"Browse our cosmetics and handmade collection and find something you love.",
step2Title:"Order",step2Text:"Place your order with your name, phone number and delivery address.",
step3Title:"Enjoy",step3Text:"We prepare your order and get it ready for delivery across Bangladesh.",
aboutTitle:"Made for your everyday little dreams.",
aboutText:"Little Daydream is an online shop for cosmetics, jewelry, and handmade products in Bangladesh. We bring together beautiful, useful and giftable products in one cozy place.",
jewelryTitle:"Jewelry & Accessories",jewelryBio:"Discover delicate, elegant jewelry and accessories selected for everyday wear, gifting, and special little moments. Our collection focuses on timeless pieces that add a soft, beautiful touch to your look."
};
function getProducts(){return JSON.parse(localStorage.getItem("ld_products")||"null")||defaultProducts}
function getShippingFee(quantity=1){const v=Number(localStorage.getItem("ld_shipping_fee"));const base=Number.isFinite(v)&&v>=0?v:60;const qty=Math.max(1,Number(quantity)||1);const multiply=localStorage.getItem("ld_shipping_per_qty")==="1";return multiply?base*qty:base}
function money(v){return "৳ "+Number(v||0).toLocaleString("en-BD")}
function getVouchers(){return JSON.parse(localStorage.getItem("ld_vouchers")||"[]")}
function saveVouchers(v){localStorage.setItem("ld_vouchers",JSON.stringify(v))}
function getVoucherUserKey(){const user=JSON.parse(localStorage.getItem("ld_current_user")||"null");if(user?.email)return "account:"+String(user.email).trim().toLowerCase();const phone=document.getElementById("customerPhone")?.value.trim();return phone?"phone:"+phone.replace(/\s+/g,""):""}
function findVoucher(code){const c=String(code||"").trim().toUpperCase();return getVouchers().find(v=>v.code===c)}
function voucherValidation(v){if(!v)return "Voucher code not found.";if(v.active===false)return "This voucher is currently inactive.";const assigned=Array.isArray(v.assignedAccounts)?v.assignedAccounts:[];const currentKey=getVoucherUserKey();if(assigned.length&&(!currentKey||!assigned.includes(currentKey)))return "This voucher is not available for this account.";if(v.expiresAt&&new Date(v.expiresAt+"T23:59:59")<new Date())return "This voucher has expired.";if(Number(v.maxUses||0)>0&&Number(v.usageCount||0)>=Number(v.maxUses))return "This voucher has reached its total use limit.";const key=getVoucherUserKey();if(Number(v.perAccountLimit||0)>0&&key&&Number(v.usage?.[key]||0)>=Number(v.perAccountLimit))return "You have already used this voucher the maximum number of times.";if(Number(v.perAccountLimit||0)>0&&!key)return "Enter your phone number or sign in so we can track voucher usage.";return ""}
function getCurrentVoucher(){const code=document.getElementById("voucherCode")?.value.trim().toUpperCase();return code?findVoucher(code):null}
function renderAvailableOffers(){
 const box=document.getElementById("availableOffers"); if(!box)return;
 const now=new Date();
 const offers=getVouchers().filter(v=>{
   if(v.active===false)return false;
   if(v.expiresAt&&new Date(v.expiresAt+"T23:59:59")<now)return false;
   if(Number(v.maxUses||0)>0&&Number(v.usageCount||0)>=Number(v.maxUses))return false;
   return Number(v.amount||0)>0;
 });
 if(!offers.length){box.innerHTML='<div class="no-offers">No active offers right now. Check back soon ✦</div>';return;}
 box.innerHTML=offers.map(v=>{
   const discount=v.type==="percent"?`${Number(v.amount)}% OFF`:`৳ ${Number(v.amount).toLocaleString("en-BD")} OFF`;
   const expiry=v.expiresAt?`Valid until ${new Date(v.expiresAt+"T23:59:59").toLocaleDateString("en-BD")}`:"No expiry";
   const limit=v.perAccountLimit?`Use up to ${v.perAccountLimit} time${v.perAccountLimit===1?"":"s"} per account`:"Usage limit not set";
   return `<div class="offer-card"><div class="offer-main"><strong>${escapeHtml(v.code)}</strong><span>${discount}</span></div><div class="offer-meta"><small>${expiry}</small><small>${limit}</small></div><button type="button" class="offer-use-btn" onclick="useAvailableVoucher('${escapeHtml(v.code)}')">Use</button></div>`;
 }).join("");
}
function useAvailableVoucher(code){
 const input=document.getElementById("voucherCode"); if(!input)return;
 input.value=String(code||"").toUpperCase();
 applyVoucher();
 input.scrollIntoView({behavior:"smooth",block:"center"});
}
function calculateVoucherDiscount(v,subtotal){if(!v)return 0;const amount=Number(v.amount||0);return v.type==="fixed"?Math.min(subtotal,Math.max(0,amount)):Math.min(subtotal,Math.max(0,subtotal*amount/100))}
function updateVoucherMessage(text,ok=false){const el=document.getElementById("voucherMessage");if(el){el.textContent=text||"";el.className="voucher-message "+(ok?"success":"error")}}
function updateVoucherButton(){const input=document.getElementById("voucherCode"),remove=document.getElementById("voucherRemove");if(remove)remove.style.display=(input?.value.trim()&&getCurrentVoucher()&&!voucherValidation(getCurrentVoucher()))?"inline-flex":"none"}
function removeVoucher(){const input=document.getElementById("voucherCode");if(input)input.value="";updateVoucherMessage("Voucher removed.",false);const row=document.getElementById("voucherDiscountRow");if(row)row.style.display="none";updateVoucherButton();updateOrderTotal()}
function applyVoucher(){const input=document.getElementById("voucherCode");const code=input?.value.trim().toUpperCase();if(!code){updateVoucherMessage("Enter a voucher code.");updateVoucherButton();updateOrderTotal();return false}if(input)input.value=code;const v=findVoucher(code);const err=voucherValidation(v);if(err){updateVoucherMessage(err);updateVoucherButton();updateOrderTotal();return false}updateVoucherMessage(v.type==="percent"?`${v.amount}% discount applied successfully.`:`৳ ${Number(v.amount).toLocaleString("en-BD")} discount applied successfully.`,true);updateVoucherButton();updateOrderTotal();return true}
function updateOrderTotal(){
 const cartItems=JSON.parse(document.getElementById("orderCartItems")?.value||"null");
 const qty=Math.max(1,Number(document.getElementById("customerQty")?.value||1));
 let subtotal=0, shipping=getShippingFee(Array.isArray(cartItems)&&cartItems.length?cartItems.reduce((a,x)=>a+Number(x.qty||0),0):qty);
 if(Array.isArray(cartItems)&&cartItems.length){subtotal=cartItems.reduce((a,x)=>a+Number(x.lineTotal||0),0);}
 else {const p=getProducts().find(x=>x.id===document.getElementById("orderProduct")?.value);subtotal=Number(p?.price||0)*qty;}
 const v=getCurrentVoucher(); const valid=v&&!voucherValidation(v); const discount=valid?calculateVoucherDiscount(v,subtotal):0;
 if(v&&!valid){updateVoucherMessage(voucherValidation(v));updateVoucherButton();}
 const total=Math.max(0,subtotal+shipping-discount);
 document.getElementById("orderPrice").textContent=money(subtotal);document.getElementById("orderShipping").textContent=money(shipping);document.getElementById("orderTotal").textContent=money(total);
 const row=document.getElementById("voucherDiscountRow"),disc=document.getElementById("orderDiscount");if(row&&disc){row.style.display=discount>0?"flex":"none";disc.textContent="− "+money(discount)}
 return {subtotal,shipping,discount,total,voucher:valid?v:null};
}
function getSettings(){return {...defaultSettings,...(JSON.parse(localStorage.getItem("ld_settings")||"{}"))}}
function renderSettings(){const s=getSettings();document.querySelectorAll("[data-setting]").forEach(el=>{const k=el.dataset.setting;if(s[k]!=null)el.textContent=s[k]});const img=localStorage.getItem("ld_hero_image");if(img&&document.getElementById("heroImage"))document.getElementById("heroImage").src=img}

function getCart(){return JSON.parse(localStorage.getItem("ld_cart")||"[]")}
function saveCart(cart){localStorage.setItem("ld_cart",JSON.stringify(cart));updateCartUI()}
function addToCart(id){
 const p=getProducts().find(x=>x.id===id); if(!p)return;
 const cart=getCart(); const found=cart.find(x=>x.id===id);
 if(found) found.qty+=1; else cart.push({id:p.id,qty:1});
 saveCart(cart); openCart();
}
function changeCartQty(id,delta){
 const cart=getCart(); const item=cart.find(x=>x.id===id); if(!item)return;
 item.qty+=delta; const next=item.qty>0?cart.filter(x=>x.qty>0):cart.filter(x=>x.id!==id); saveCart(next);
}
function removeFromCart(id){saveCart(getCart().filter(x=>x.id!==id))}
function cartData(){
 return getCart().map(i=>{const p=getProducts().find(x=>x.id===i.id);return p?{...p,qty:i.qty,unitPrice:Number(p.price||0),lineTotal:Number(p.price||0)*i.qty}:null}).filter(Boolean)
}
function updateCartUI(){
 const data=cartData(), count=data.reduce((a,x)=>a+x.qty,0), subtotal=data.reduce((a,x)=>a+x.lineTotal,0), shipping=data.length?getShippingFee(count):0;
 const countEl=document.getElementById("cartCount"); if(countEl) countEl.textContent=count;
 const box=document.getElementById("cartItems"); if(!box)return;
 box.innerHTML=data.length?data.map(x=>`<div class="cart-item"><div class="cart-item-image ${x.image?'':'placeholder'}">${x.image?`<img src="${x.image}" alt="${escapeHtml(x.name)}">`:escapeHtml(x.category)}</div><div class="cart-item-info"><strong>${escapeHtml(x.name)}</strong><span>${money(x.unitPrice)} each</span><div class="cart-controls"><button onclick="changeCartQty('${x.id}',-1)">−</button><b>${x.qty}</b><button onclick="changeCartQty('${x.id}',1)">+</button><button class="remove-cart" onclick="removeFromCart('${x.id}')">Remove</button></div></div><strong class="cart-line-total">${money(x.lineTotal)}</strong></div>`).join(""):'<div class="cart-empty"><span>🛍️</span><h3>Your cart is empty</h3><p>Add something beautiful to your cart.</p></div>';
 document.getElementById("cartSubtotal").textContent=money(subtotal); document.getElementById("cartShipping").textContent=money(shipping); document.getElementById("cartTotal").textContent=money(subtotal+shipping);
 const checkout=document.querySelector('#cartDrawer .btn'); if(checkout) checkout.disabled=!data.length;
}
function openCart(){updateCartUI();document.getElementById("cartDrawer")?.classList.add("show")}
function closeCart(){document.getElementById("cartDrawer")?.classList.remove("show")}
function checkoutCart(){
 const data=cartData(); if(!data.length)return;
 document.getElementById("orderProduct").value="CART";
 document.getElementById("orderCartItems").value=JSON.stringify(data.map(x=>({id:x.id,name:x.name,qty:x.qty,unitPrice:x.unitPrice,lineTotal:x.lineTotal})));
 document.getElementById("orderTitle").textContent="Complete Your Order";
 closeCart(); document.getElementById("orderModal").classList.add("show"); document.getElementById("voucherCode").value=""; updateVoucherMessage(""); updateVoucherButton(); renderAvailableOffers(); updateOrderTotal(); document.getElementById("customerName").focus();
}

function renderProducts(){
 const grid=document.getElementById("productGrid");if(!grid)return;
 grid.innerHTML=getProducts().map(p=>{
   const cover=(Array.isArray(p.images)&&p.images.length?p.images[0]:p.image);
   return `<article class="product-card product-card-clickable" tabindex="0" role="link" onclick="openProduct('${p.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openProduct('${p.id}')}" aria-label="View ${escapeHtml(p.name)}">
     <div class="product-image ${cover?'':'placeholder'}">${cover?`<img src="${cover}" alt="${escapeHtml(p.name)}">`:escapeHtml(p.category)}</div>
     <div class="product-info"><span class="tag">${escapeHtml(p.category)}</span><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description || "Beautifully selected for your little day dream.")}</p>
     <div class="product-bottom"><strong>৳ ${escapeHtml(p.price)}</strong><span class="product-view-link">View product →</span></div></div>
   </article>`;
 }).join("");
}
function openProduct(id){location.href=`product.html?id=${encodeURIComponent(id)}`}
function openOrder(id){const p=getProducts().find(x=>x.id===id);if(!p)return;document.getElementById("orderProduct").value=p.id;document.getElementById("orderTitle").textContent="Order: "+p.name;document.getElementById("orderModal").classList.add("show");document.getElementById("voucherCode").value="";updateVoucherMessage("");updateVoucherButton();renderAvailableOffers();updateOrderTotal();document.getElementById("customerName").focus()}
function closeOrder(){document.getElementById("orderModal")?.classList.remove("show")}
document.getElementById("voucherCode")?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();applyVoucher();}});
document.getElementById("customerQty")?.addEventListener("input",updateOrderTotal);document.getElementById("customerPhone")?.addEventListener("input",()=>{if(document.getElementById("voucherCode")?.value.trim())updateOrderTotal()});
function getPaymentSettings(){return {bkash:localStorage.getItem("ld_bkash_number")||"",nagad:localStorage.getItem("ld_nagad_number")||""}}
function updatePaymentInfo(){const method=document.getElementById("paymentMethod")?.value||"bkash";const info=document.getElementById("paymentInfo"),num=document.getElementById("paymentNumber"),wrap=document.getElementById("transactionWrap"),tx=document.getElementById("paymentTransactionId");const ps=getPaymentSettings();if(method==="cod"){info.innerHTML="<strong>Payment:</strong> Cash on Delivery";if(wrap)wrap.style.display="none";if(tx)tx.required=false;}else{const label=method==="bkash"?"bKash payment number":"Nagad payment number";num.textContent=ps[method]||"Not set by admin";info.innerHTML="<strong>"+label+":</strong> <span id=\"paymentNumber\">"+(ps[method]||"Not set by admin")+"</span>";if(wrap)wrap.style.display="block";if(tx)tx.required=true;}}
document.querySelectorAll(".payment-method-btn").forEach(btn=>btn.addEventListener("click",()=>{
  const method=btn.dataset.payment;
  const select=document.getElementById("paymentMethod");
  if(select) select.value=method;
  document.querySelectorAll(".payment-method-btn").forEach(b=>b.classList.toggle("active",b===btn));
  updatePaymentInfo();
}));
document.getElementById("paymentMethod")?.addEventListener("change",()=>{
  const value=document.getElementById("paymentMethod").value;
  document.querySelectorAll(".payment-method-btn").forEach(b=>b.classList.toggle("active",b.dataset.payment===value));
  updatePaymentInfo();
});
updatePaymentInfo();

document.getElementById("orderForm")?.addEventListener("submit",e=>{
 e.preventDefault();
 const cartItems=JSON.parse(document.getElementById("orderCartItems").value||"null");
 const p=getProducts().find(x=>x.id===document.getElementById("orderProduct").value);
 const orders=JSON.parse(localStorage.getItem("ld_orders")||"[]"),user=JSON.parse(localStorage.getItem("ld_current_user")||"null");
 const qty=Number(document.getElementById("customerQty").value||1);
 const totals=updateOrderTotal();
 const voucher=totals.voucher;
 if(document.getElementById("voucherCode")?.value.trim()&&!voucher){alert("Please fix the voucher code before placing the order.");return;}
 const shippingFee=totals.shipping;
 let productName, total, unitPrice=0, orderQty=qty, items=[];
 if(Array.isArray(cartItems)&&cartItems.length){items=cartItems;productName=cartItems.map(x=>`${x.name} × ${x.qty}`).join(", ");total=totals.total;orderQty=cartItems.reduce((a,x)=>a+Number(x.qty||0),0);}
 else {unitPrice=Number(p?.price||0);productName=p?.name||"Product";total=totals.total;items=[{id:p?.id,name:productName,qty,unitPrice,lineTotal:unitPrice*qty}];}
 const paymentMethod=document.getElementById("paymentMethod")?.value||"cod";const paymentTransactionId=document.getElementById("paymentTransactionId")?.value.trim()||"";const paymentStatus="Pending";
 const orderId="LD-"+Date.now().toString().slice(-8);
 orders.unshift({id:orderId,customer:document.getElementById("customerName").value,phone:document.getElementById("customerPhone").value,address:document.getElementById("customerAddress").value,product:productName,qty:orderQty,unitPrice,shippingFee,total,status:"New",paymentMethod,paymentTransactionId,paymentStatus,date:new Date().toISOString(),account:user?.email||"",items,voucherCode:voucher?.code||"",voucherType:voucher?.type||"",voucherAmount:voucher?.amount||0,voucherDiscount:totals.discount});
 localStorage.setItem("ld_orders",JSON.stringify(orders));
 if(voucher){const vouchers=getVouchers();const i=vouchers.findIndex(x=>x.code===voucher.code);if(i>=0){const key=getVoucherUserKey()||"guest";vouchers[i].usage=vouchers[i].usage||{};vouchers[i].usage[key]=Number(vouchers[i].usage[key]||0)+1;vouchers[i].usageCount=Number(vouchers[i].usageCount||0)+1;saveVouchers(vouchers)}}
 if(Array.isArray(cartItems))localStorage.removeItem("ld_cart");
 closeOrder();e.target.reset();document.getElementById("orderCartItems").value="";updateCartUI();updateOrderTotal();showOrderSuccess(orderId);
});

function showOrderSuccess(orderId){
  let modal=document.getElementById("orderSuccessModal");
  if(!modal){
    modal=document.createElement("div");
    modal.id="orderSuccessModal";
    modal.className="order-success-modal";
    modal.setAttribute("aria-hidden","true");
    modal.innerHTML=`<div class="order-success-backdrop"></div><div class="order-success-card" role="dialog" aria-modal="true" aria-labelledby="orderSuccessTitle">
      <button class="order-success-close" type="button" aria-label="Close" onclick="closeOrderSuccess()">×</button>
      <div class="success-check" aria-hidden="true">✓</div>
      <p class="success-eyebrow">ORDER CONFIRMED</p>
      <h2 id="orderSuccessTitle">Thanks for your order!</h2>
      <p class="success-message">Your order has been placed successfully.</p>
      <p class="success-order-id">Order ID: <strong id="successOrderId"></strong></p>
      <div class="success-actions">
        <button class="btn primary" type="button" onclick="continueNewOrder()">Continue New Order</button>
        <button class="btn success-home-btn" type="button" onclick="goHomeFromSuccess()">Home Page</button>
      </div>
    </div>`;
    document.body.appendChild(modal);
    modal.querySelector('.order-success-backdrop').addEventListener('click',closeOrderSuccess);
  }
  document.getElementById("successOrderId").textContent=orderId||"";
  modal.classList.add("show");
  modal.setAttribute("aria-hidden","false");
}
function closeOrderSuccess(){
  const modal=document.getElementById("orderSuccessModal");
  if(modal){modal.classList.remove("show");modal.setAttribute("aria-hidden","true");}
}
function continueNewOrder(){
  closeOrderSuccess();
  if(location.pathname.endsWith('/product.html')){ location.href='index.html#shop'; }
  else { location.hash='shop'; window.scrollTo({top:document.getElementById('shop')?.offsetTop||0,behavior:'smooth'}); }
}
function goHomeFromSuccess(){ location.href='index.html'; }

function togglePromoCodes(){
  const content=document.getElementById("promoCodesContent");
  const toggle=document.getElementById("promoCodesToggle");
  const text=document.getElementById("promoEnterText");
  if(!content||!toggle)return;
  const open=content.hidden;
  content.hidden=!open;
  toggle.setAttribute("aria-expanded",String(open));
  if(text)text.textContent=open?"Close⌃":"Enter⌄";
}

function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
document.getElementById("year")&&(document.getElementById("year").textContent=new Date().getFullYear());
document.querySelector(".menu-btn")?.addEventListener("click",()=>document.querySelector(".nav").classList.toggle("open"));
renderSettings();renderProducts();renderAvailableOffers();updateCartUI();
