const ADMIN_EMAIL="aman3092008@gmail.com";
const ADMIN_PASSWORD="Littledaydream@#";
// Permanent admin credentials for this front-end demo. No admin sign-up or password-change flow.
const ADMIN_SESSION_KEY="ld_admin_logged_in";
const defaultProducts=[{id:"p1",name:"Your Cosmetic Product",category:"Cosmetics",price:"450",image:"",description:"A carefully selected beauty essential for your everyday routine."},{id:"p2",name:"Handmade Creation",category:"Handmade",price:"550",image:"",description:"A unique handmade piece prepared with care and attention to detail."},{id:"p3",name:"Beauty Essential",category:"Cosmetics",price:"650",image:"",description:"A lovely beauty pick chosen to make your daily routine feel special."},{id:"p4",name:"Handmade Gift",category:"Handmade",price:"750",image:"",description:"A thoughtful handmade gift for someone special."}];
const defaultSettings={siteName:"Little Daydream",heroEyebrow:"LITTLE DAYDREAM • COSMETICS & HANDMADE",heroTitle:"Little things, thoughtfully chosen for your day.",heroText:"Discover beautiful cosmetics and handmade pieces, selected with care so every order feels a little more special.",step1Title:"Choose",step1Text:"Browse our cosmetics and handmade collection and find something you love.",step2Title:"Order",step2Text:"Place your order with your name, phone number and delivery address.",step3Title:"Enjoy",step3Text:"We prepare your order and get it ready for delivery across Bangladesh.",aboutTitle:"Made for your everyday little dreams.",aboutText:"Little Daydream is an online shop for cosmetics, jewelry, and handmade products in Bangladesh. We bring together beautiful, useful and giftable products in one cozy place.",jewelryTitle:"Jewelry & Accessories",jewelryBio:"Discover delicate, elegant jewelry and accessories selected for everyday wear, gifting, and special little moments. Our collection focuses on timeless pieces that add a soft, beautiful touch to your look."};
function getOrders(){return JSON.parse(localStorage.getItem("ld_orders")||"[]")}
function getProducts(){return JSON.parse(localStorage.getItem("ld_products")||"null")||defaultProducts}
function getShippingFee(quantity=1){const v=Number(localStorage.getItem("ld_shipping_fee"));const base=Number.isFinite(v)&&v>=0?v:60;const qty=Math.max(1,Number(quantity)||1);const multiply=localStorage.getItem("ld_shipping_per_qty")==="1";return multiply?base*qty:base}
function money(v){return "৳ "+Number(v||0).toLocaleString("en-BD")}
function saveProducts(p){localStorage.setItem("ld_products",JSON.stringify(p))}
function getSettings(){return {...defaultSettings,...(JSON.parse(localStorage.getItem("ld_settings")||"{}"))}}
function showAdminLogin(){const screen=document.getElementById("adminLoginScreen");if(screen){screen.classList.add("open");screen.setAttribute("aria-hidden","false")}document.body.classList.add("admin-locked")}
function hideAdminLogin(){const screen=document.getElementById("adminLoginScreen");if(screen){screen.classList.remove("open");screen.setAttribute("aria-hidden","true")}document.body.classList.remove("admin-locked")}
function checkAdmin(){if(localStorage.getItem(ADMIN_SESSION_KEY)==="true"){hideAdminLogin();return true}showAdminLogin();return false}
function adminLogin(email,password){if(email.trim().toLowerCase()===ADMIN_EMAIL.toLowerCase()&&password===ADMIN_PASSWORD){localStorage.setItem(ADMIN_SESSION_KEY,"true");hideAdminLogin();loadSettings();loadPaymentSettings();render();return true}return false}
function logout(){localStorage.removeItem(ADMIN_SESSION_KEY);location.reload()}
function loadSettings(){const s=getSettings();Object.keys(s).forEach(k=>{const el=document.getElementById(k);if(el)el.value=s[k]})}
function getVouchers(){return JSON.parse(localStorage.getItem("ld_vouchers")||"[]")}
function saveVouchers(v){localStorage.setItem("ld_vouchers",JSON.stringify(v))}
function generateVoucherCode(){const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let code="LD-";for(let i=0;i<6;i++)code+=chars[Math.floor(Math.random()*chars.length)];const existing=getVouchers();if(existing.some(v=>v.code===code))return generateVoucherCode();document.getElementById("voucherCodeAdmin").value=code}

function voucherAccountKey(u){return "account:"+String(u.email||"").trim().toLowerCase()}
function getVoucherAssignedAccounts(v){return Array.isArray(v.assignedAccounts)?v.assignedAccounts:[]}
function saveVoucherAssignment(code,accountKey,add=true){
  const list=getVouchers(),i=list.findIndex(v=>v.code===code);
  if(i<0||!accountKey)return;
  const a=getVoucherAssignedAccounts(list[i]);
  if(add){if(!a.includes(accountKey))a.push(accountKey)}
  else {list[i].assignedAccounts=a.filter(x=>x!==accountKey)}
  list[i].assignedAccounts=a;
  saveVouchers(list);
}
function renderVoucherAssignment(){
  const accountSel=document.getElementById("voucherAccountSelect");
  const voucherSel=document.getElementById("voucherSelectForAccount");
  const assignedBox=document.getElementById("selectedAccountVouchers");
  if(!accountSel||!voucherSel||!assignedBox)return;
  const users=getUsers().filter(u=>u.email);
  const currentAccount=accountSel.value;
  accountSel.innerHTML='<option value="">Select customer account</option>'+users.map(u=>{
    const key=voucherAccountKey(u);
    return `<option value="${escAttr(key)}">${esc(u.name||"Unnamed")} — ${esc(u.email)}</option>`;
  }).join("");
  if(currentAccount)accountSel.value=currentAccount;
  const vouchers=getVouchers().filter(v=>v.active!==false);
  voucherSel.innerHTML='<option value="">Select voucher</option>'+vouchers.map(v=>{
    const assigned=getVoucherAssignedAccounts(v);
    const label=assigned.length?`${v.code} • Assigned to ${assigned.length} account${assigned.length===1?"":"s"}`:`${v.code} • All accounts`;
    return `<option value="${escAttr(v.code)}">${esc(label)}</option>`;
  }).join("");
  if(!currentAccount){
    assignedBox.innerHTML='<p class="muted">Select a customer account to see its assigned vouchers.</p>';
    return;
  }
  const user=users.find(u=>voucherAccountKey(u)===currentAccount);
  const assigned=vouchers.filter(v=>getVoucherAssignedAccounts(v).includes(currentAccount));
  assignedBox.innerHTML=`<div class="selected-account-heading"><strong>${esc(user?.name||"Customer")}</strong><span>${esc(user?.email||"")}</span></div>`+
    (assigned.length?assigned.map(v=>`<div class="assigned-voucher-row"><span><strong>${esc(v.code)}</strong> — ${v.type==="percent"?esc(v.amount)+"%":"৳ "+Number(v.amount||0).toLocaleString("en-BD")}</span><button type="button" class="delete-btn" onclick="unassignVoucher('${escAttr(v.code)}','${escAttr(currentAccount)}')">Remove</button></div>`).join(""):'<p class="muted">No voucher is assigned to this account.</p>');
}
function assignSelectedVoucher(){
  const account=document.getElementById("voucherAccountSelect")?.value;
  const code=document.getElementById("voucherSelectForAccount")?.value;
  if(!account)return alert("Select a customer account first.");
  if(!code)return alert("Select a voucher first.");
  saveVoucherAssignment(code,account,true);
  renderVoucherAssignment();
  renderVouchers();
  alert("Voucher assigned to the selected account.");
}
function unassignVoucher(code,account){
  saveVoucherAssignment(code,account,false);
  renderVoucherAssignment();
  renderVouchers();
  renderVoucherAssignment();
}
function getUsers(){return JSON.parse(localStorage.getItem("ld_users")||"[]")}
function renderVouchers(){const body=document.getElementById("vouchersBody"),empty=document.getElementById("emptyVouchers");if(!body)return;const list=getVouchers();empty.style.display=list.length?"none":"block";body.innerHTML=list.map(v=>{const expiry=v.expiresAt?new Date(v.expiresAt+"T23:59:59").toLocaleDateString():"No expiry";const status=v.active===false?"Inactive":(v.expiresAt&&new Date(v.expiresAt+"T23:59:59")<new Date()?"Expired":"Active");const discount=v.type==="percent"?`${v.amount}%`:`৳ ${Number(v.amount||0).toLocaleString("en-BD")}`;const max=v.maxUses?`${v.usageCount||0}/${v.maxUses}`:`${v.usageCount||0}/∞`;const per=v.perAccountLimit?`×${v.perAccountLimit}`:"∞";return `<tr><td><strong>${esc(v.code)}</strong></td><td>${discount}</td><td>${max}</td><td>${per}</td><td>${expiry}</td><td><span class="tag">${status}</span></td><td><button class="delete-btn" onclick="showVoucherUsage('${escAttr(v.code)}')">Usage</button> <button class="delete-btn" onclick="toggleVoucher('${escAttr(v.code)}')">${v.active===false?"Activate":"Deactivate"}</button> <button class="delete-btn" onclick="deleteVoucher('${escAttr(v.code)}')">Delete</button></td></tr>`}).join("")}
function showVoucherUsage(code){const v=getVouchers().find(x=>x.code===code);if(!v)return;const entries=Object.entries(v.usage||{});document.getElementById("voucherUsageTitle").textContent=`${v.code} • Usage`;document.getElementById("voucherUsageContent").innerHTML=entries.length?`<div class="voucher-usage-list">${entries.map(([key,count])=>`<div class="voucher-usage-row"><span>${esc(key.replace(/^account:/,"Account: ").replace(/^phone:/,"Phone: "))}</span><strong>${count} use${count===1?"":"s"}</strong></div>`).join("")}</div>`:`<p class="muted">No customer has used this voucher yet.</p>`;const m=document.getElementById("voucherUsageModal");m.classList.add("open");m.setAttribute("aria-hidden","false")}
function closeVoucherUsage(){const m=document.getElementById("voucherUsageModal");if(m){m.classList.remove("open");m.setAttribute("aria-hidden","true")}}
function toggleVoucher(code){const list=getVouchers(),i=list.findIndex(v=>v.code===code);if(i<0)return;list[i].active=list[i].active===false;saveVouchers(list);renderVouchers()}
function deleteVoucher(code){if(!confirm(`Delete voucher ${code}?`))return;saveVouchers(getVouchers().filter(v=>v.code!==code));renderVouchers()}
function readFile(file,cb){if(!file){cb("");return}const r=new FileReader();r.onload=()=>cb(r.result);r.readAsDataURL(file)}
document.getElementById("settingsForm").addEventListener("submit",e=>{e.preventDefault();const s={};Object.keys(defaultSettings).forEach(k=>s[k]=document.getElementById(k).value);const file=document.getElementById("heroImageFile").files[0];readFile(file,img=>{if(img)localStorage.setItem("ld_hero_image",img);localStorage.setItem("ld_settings",JSON.stringify(s));alert("Homepage changes saved!");})});
function render(){
  const orders=getOrders(),products=getProducts();
  totalOrders.textContent=orders.length;
  newOrders.textContent=orders.filter(o=>o.status==="New").length;
  totalProducts.textContent=products.length;
  emptyOrders.style.display=orders.length?"none":"block";
  ordersBody.innerHTML=orders.map(o=>{
    const productTotal=(o.unitPrice||0)*(o.qty||1);
    const shipping=o.shippingFee ?? getShippingFee(o.qty||1);
    const total=o.total ?? (productTotal+shipping);
    return `<tr>
      <td><strong>${esc(o.id)}</strong></td>
      <td>${esc(o.customer)}</td>
      <td>${esc(o.product)}</td>
      <td>${o.qty||1}</td>
      <td>${money(productTotal)}</td>
      <td>${money(shipping)}</td>
      <td><strong>${money(total)}</strong></td>
      <td>${new Date(o.date).toLocaleString()}</td>
      <td><button class="view-order-btn" onclick="viewOrderDetails('${escAttr(o.id)}')">View</button></td>
    </tr>`;
  }).join("");
  adminProducts.innerHTML=products.map(p=>{const photos=Array.isArray(p.images)&&p.images.length?p.images:(p.image?[p.image]:[]);const media=photos.length?'<div class="admin-product-photo-count">'+photos.length+' photo'+(photos.length>1?'s':'')+'</div><img src="'+photos[0]+'" alt="'+esc(p.name)+'">':'<div class="admin-product-placeholder">'+esc(p.category)+'</div>';return '<div class="admin-product">'+media+'<span class="tag">'+esc(p.category)+'</span><h3>'+esc(p.name)+'</h3><p class="muted">'+esc(p.description||'')+'</p><strong>৳ '+esc(p.price)+'</strong><div class="admin-product-actions"><button class="delete-btn" onclick="editProduct(\''+escAttr(p.id)+'\')">Edit</button><button class="delete-btn" onclick="deleteProduct(\''+escAttr(p.id)+'\')">Remove</button></div></div>'}).join('')
  renderVouchers();
}
function viewOrderDetails(id){
  const o=getOrders().find(v=>v.id===id);
  if(!o)return;
  const productTotal=(o.unitPrice||0)*(o.qty||1);
  const shipping=o.shippingFee ?? getShippingFee(o.qty||1);
  const total=o.total ?? (productTotal+shipping);
  const payment=(o.paymentMethod||"cod")==="bkash"?"bKash":(o.paymentMethod||"cod")==="nagad"?"Nagad":"Cash on Delivery";
  const paymentNumber=(o.paymentMethod||"cod")==="bkash"?(localStorage.getItem("ld_bkash_number")||"Not set"):(o.paymentMethod||"cod")==="nagad"?(localStorage.getItem("ld_nagad_number")||"Not set"):"—";
  const status=o.status||"New", paymentStatus=o.paymentStatus||"Pending";
  document.getElementById("orderDetailsTitle").textContent=`Order ${o.id}`;
  document.getElementById("orderDetailsContent").innerHTML=`
    <div class="detail-grid">
      <div><span>Customer</span><strong>${esc(o.customer||"—")}</strong></div>
      <div><span>Phone</span><strong>${esc(o.phone||"—")}</strong></div>
      <div class="full"><span>Delivery Address</span><strong>${esc(o.address||"—")}</strong></div>
      <div><span>Product</span><strong>${esc(o.product||"—")}</strong></div>
      <div><span>Quantity</span><strong>${o.qty||1}</strong></div>
      <div><span>Product Price</span><strong>${money(productTotal)}</strong></div>
      <div><span>Shipping Fee</span><strong>${money(shipping)}</strong></div>
      <div><span>Total</span><strong>${money(total)}</strong></div>
      <div><span>Order Date</span><strong>${new Date(o.date).toLocaleString()}</strong></div>
      <div><span>Order Status</span><select onchange="changeStatus('${escAttr(o.id)}',this.value);viewOrderDetails('${escAttr(o.id)}')"><option ${status==="New"?"selected":""}>New</option><option ${status==="Processing"?"selected":""}>Processing</option><option ${status==="Shipped"?"selected":""}>Shipped</option><option ${status==="Delivered"?"selected":""}>Delivered</option><option ${status==="Cancelled"?"selected":""}>Cancelled</option></select></div>
      <div><span>Payment Method</span><strong>${payment}</strong></div>
      <div><span>Payment Number</span><strong>${esc(paymentNumber)}</strong></div>
      <div><span>Transaction ID</span><strong>${esc(o.paymentTransactionId||"—")}</strong></div>
      <div><span>Voucher</span><strong>${esc(o.voucherCode||"—")}</strong></div>
      <div><span>Voucher Discount</span><strong>${o.voucherDiscount?money(o.voucherDiscount):"—"}</strong></div>
      <div><span>Payment Status</span><select onchange="changePaymentStatus('${escAttr(o.id)}',this.value);viewOrderDetails('${escAttr(o.id)}')"><option ${paymentStatus==="Pending"?"selected":""}>Pending</option><option ${paymentStatus==="Paid"?"selected":""}>Paid</option><option ${paymentStatus==="Unpaid"?"selected":""}>Unpaid</option><option ${paymentStatus==="Failed"?"selected":""}>Failed</option></select></div>
    </div>
    <div class="detail-actions"><button class="delete-btn" onclick="deleteOrder('${escAttr(o.id)}');closeOrderDetails()">Delete Order</button></div>`;
  const modal=document.getElementById("orderDetailsModal");modal.classList.add("open");modal.setAttribute("aria-hidden","false");
}
function closeOrderDetails(){const modal=document.getElementById("orderDetailsModal");modal.classList.remove("open");modal.setAttribute("aria-hidden","true")}

function changeStatus(id,status){const o=getOrders(),x=o.find(v=>v.id===id);if(x)x.status=status;localStorage.setItem("ld_orders",JSON.stringify(o));render()}
function changePaymentStatus(id,status){const o=getOrders(),x=o.find(v=>v.id===id);if(x)x.paymentStatus=status;localStorage.setItem("ld_orders",JSON.stringify(o));render()}
function deleteOrder(id){if(confirm("Delete this order?")){localStorage.setItem("ld_orders",JSON.stringify(getOrders().filter(o=>o.id!==id)));render()}}
document.getElementById("productForm").addEventListener("submit",async e=>{e.preventDefault();const files=[...document.getElementById("pImages").files];const images=await Promise.all(files.map(file=>new Promise(resolve=>readFile(file,resolve))));const product={id:"p"+Date.now(),name:pName.value.trim(),category:pCategory.value,price:pPrice.value.trim(),image:images[0]||"",images:images.filter(Boolean),description:pDescription.value.trim(),details:document.getElementById("pDetails").value.trim(),specs:document.getElementById("pSpecs").value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean),color:document.getElementById("pColor").value.trim(),size:document.getElementById("pSize").value.trim(),weight:document.getElementById("pWeight").value.trim()};const list=getProducts();list.push(product);saveProducts(list);e.target.reset();render();alert("Product added with customizable details and photos.")});
function editProduct(id){const p=getProducts().find(x=>x.id===id);if(!p)return;document.getElementById("editProductId").value=p.id;document.getElementById("editName").value=p.name||"";document.getElementById("editCategory").value=p.category||"Handmade";document.getElementById("editPrice").value=p.price||"";document.getElementById("editDescription").value=p.description||"";document.getElementById("editDetails").value=p.details||"";document.getElementById("editSpecs").value=Array.isArray(p.specs)?p.specs.join("\n"):(p.specs||"");document.getElementById("editColor").value=p.color||"";document.getElementById("editSize").value=p.size||"";document.getElementById("editWeight").value=p.weight||"";document.getElementById("editImages").value="";document.getElementById("replaceImages").checked=false;document.getElementById("productEditorModal").classList.add("open");document.getElementById("productEditorModal").setAttribute("aria-hidden","false")}
function closeProductEditor(){const m=document.getElementById("productEditorModal");m.classList.remove("open");m.setAttribute("aria-hidden","true")}
document.getElementById("editProductForm")?.addEventListener("submit",async e=>{e.preventDefault();const id=document.getElementById("editProductId").value;const list=getProducts();const i=list.findIndex(x=>x.id===id);if(i<0)return;const old=list[i],files=[...document.getElementById("editImages").files],newImages=await Promise.all(files.map(file=>new Promise(resolve=>readFile(file,resolve))));let images=Array.isArray(old.images)&&old.images.length?old.images:(old.image?[old.image]:[]);if(document.getElementById("replaceImages").checked)images=newImages.filter(Boolean);else if(newImages.length)images=[...images,...newImages.filter(Boolean)];list[i]={...old,name:document.getElementById("editName").value.trim(),category:document.getElementById("editCategory").value,price:document.getElementById("editPrice").value.trim(),description:document.getElementById("editDescription").value.trim(),details:document.getElementById("editDetails").value.trim(),specs:document.getElementById("editSpecs").value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean),color:document.getElementById("editColor").value.trim(),size:document.getElementById("editSize").value.trim(),weight:document.getElementById("editWeight").value.trim(),images,image:images[0]||""};saveProducts(list);closeProductEditor();render();alert("Product updated.")});
function deleteProduct(id){saveProducts(getProducts().filter(p=>p.id!==id));render()}
function exportOrders(){const o=getOrders(),rows=[["Order","Customer","Phone","Product","Qty","Product Price","Shipping Fee","Total","Address","Date","Status","Payment Method","Payment Transaction ID","Payment Status","Voucher","Voucher Discount"],...o.map(x=>[x.id,x.customer,x.phone,x.product,x.qty,(x.unitPrice||0)*x.qty,x.shippingFee ?? getShippingFee(x.qty || 1),x.total ?? ((x.unitPrice||0)*x.qty+(x.shippingFee ?? getShippingFee(x.qty || 1))),x.address,new Date(x.date).toLocaleString(),x.status,x.paymentMethod||"cod",x.paymentTransactionId||"",x.paymentStatus||"Pending",x.voucherCode||"",x.voucherDiscount||0]) ],csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n"),a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="little-daydream-orders.csv";a.click()}
document.getElementById("shippingFee").value=getShippingFee();const perQtyToggle=document.getElementById("shippingPerQty");perQtyToggle.checked=localStorage.getItem("ld_shipping_per_qty")==="1";perQtyToggle.addEventListener("change",()=>{localStorage.setItem("ld_shipping_per_qty",perQtyToggle.checked?"1":"0");render();});document.getElementById("shippingForm").addEventListener("submit",e=>{e.preventDefault();localStorage.setItem("ld_shipping_fee",String(Math.max(0,Number(shippingFee.value||0))));alert("Shipping fee saved!");render();});
function loadPaymentSettings(){const b=document.getElementById("bkashNumber"),n=document.getElementById("nagadNumber");if(b)b.value=localStorage.getItem("ld_bkash_number")||"";if(n)n.value=localStorage.getItem("ld_nagad_number")||""}
document.getElementById("paymentSettingsForm")?.addEventListener("submit",e=>{e.preventDefault();localStorage.setItem("ld_bkash_number",document.getElementById("bkashNumber").value.trim());localStorage.setItem("ld_nagad_number",document.getElementById("nagadNumber").value.trim());alert("Payment numbers saved!")});
document.getElementById("generateVoucherBtn")?.addEventListener("click",generateVoucherCode);
document.getElementById("voucherForm")?.addEventListener("submit",e=>{e.preventDefault();const code=document.getElementById("voucherCodeAdmin").value.trim().toUpperCase();if(!code)return alert("Enter or generate a voucher code.");if(!/^[A-Z0-9-]{3,30}$/.test(code))return alert("Use only letters, numbers and hyphens in the voucher code.");const list=getVouchers();if(list.some(v=>v.code===code))return alert("That voucher code already exists.");const type=document.getElementById("voucherDiscountType").value;const amount=Number(document.getElementById("voucherDiscountAmount").value||0);if(amount<=0)return alert("Discount amount must be greater than 0.");if(type==="percent"&&amount>100)return alert("Percentage discount cannot be more than 100%.");const maxUses=Math.max(0,Number(document.getElementById("voucherMaxUses").value||0));const perAccountLimit=Math.max(0,Number(document.getElementById("voucherPerAccount").value||0));const expiresAt=document.getElementById("voucherExpiry").value;const targetAccount=document.getElementById("voucherAccountSelect")?.value||"";list.unshift({id:"v"+Date.now(),code,type,amount,maxUses,perAccountLimit,expiresAt,active:document.getElementById("voucherActive").checked,usageCount:0,usage:{},assignedAccounts:targetAccount?[targetAccount]:[],createdAt:new Date().toISOString()});saveVouchers(list);e.target.reset();document.getElementById("voucherActive").checked=true;renderVouchers();alert(`Voucher ${code} created successfully.`)});
function resetDemo(){if(confirm("Reset products, orders and homepage settings?")){localStorage.removeItem("ld_orders");localStorage.removeItem("ld_products");localStorage.removeItem("ld_settings");localStorage.removeItem("ld_hero_image");localStorage.removeItem("ld_vouchers");loadSettings();render()}}
function logout(){localStorage.removeItem("ld_current_user");location.href="auth.html"}function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function getUsers(){return JSON.parse(localStorage.getItem("ld_users")||"[]")}
function saveUsers(u){localStorage.setItem("ld_users",JSON.stringify(u))}
function renderCustomers(){
  const body=document.getElementById("customersBody"),empty=document.getElementById("emptyCustomers"),q=(document.getElementById("customerSearch")?.value||"").trim().toLowerCase();
  const list=getUsers().filter(u=>!q||String(u.name||"").toLowerCase().includes(q)||String(u.email||"").toLowerCase().includes(q));
  empty.style.display=list.length?"none":"block";
  body.innerHTML=list.map(u=>`<tr><td><strong>${esc(u.name||"Unnamed")}</strong></td><td>${esc(u.email)}</td><td><span class="tag">${u.blocked?"Blocked":"Active"}</span></td><td>${u.createdAt?new Date(u.createdAt).toLocaleDateString():"—"}</td><td><button class="delete-btn" onclick="editCustomer('${escAttr(u.id||u.email)}')">Edit</button> <button class="delete-btn" onclick="toggleCustomer('${escAttr(u.id||u.email)}')">${u.blocked?"Unblock":"Block"}</button> <button class="delete-btn" onclick="resetCustomerPassword('${escAttr(u.id||u.email)}')">Reset Password</button> <button class="delete-btn" onclick="deleteCustomer('${escAttr(u.id||u.email)}')">Delete</button></td></tr>`).join("");
}
function escAttr(s){return String(s).replace(/\\/g,"\\\\").replace(/'/g,"\\'")}
function findCustomer(key){return getUsers().find(u=>(u.id||u.email)===key)}
function editCustomer(key){const users=getUsers(),i=users.findIndex(u=>(u.id||u.email)===key);if(i<0)return;const name=prompt("Customer name:",users[i].name||"");if(name===null)return;const email=prompt("Customer email:",users[i].email||"");if(email===null)return;const cleanEmail=email.trim();if(!cleanEmail)return alert("Email cannot be empty.");if(users.some((u,j)=>j!==i&&String(u.email).toLowerCase()===cleanEmail.toLowerCase()))return alert("That email is already used by another account.");users[i].name=name.trim()||users[i].name;users[i].email=cleanEmail;saveUsers(users);const cur=JSON.parse(localStorage.getItem("ld_current_user")||"null");if(cur&&(cur.id||cur.email)===key){cur.name=users[i].name;cur.email=users[i].email;localStorage.setItem("ld_current_user",JSON.stringify(cur))}renderCustomers();alert("Customer account updated.")}
function toggleCustomer(key){const users=getUsers(),i=users.findIndex(u=>(u.id||u.email)===key);if(i<0)return;users[i].blocked=!users[i].blocked;saveUsers(users);renderCustomers();alert(users[i].blocked?"Customer blocked.":"Customer unblocked.")}
function resetCustomerPassword(key){const users=getUsers(),i=users.findIndex(u=>(u.id||u.email)===key);if(i<0)return;const pass=prompt("Enter a new password (minimum 6 characters):");if(pass===null)return;if(pass.length<6)return alert("Password must be at least 6 characters.");users[i].password=pass;saveUsers(users);alert("Customer password reset.")}
function deleteCustomer(key){const users=getUsers(),i=users.findIndex(u=>(u.id||u.email)===key);if(i<0)return;if(!confirm("Delete this customer account permanently?"))return;const deleted=users[i];saveUsers(users.filter((_,j)=>j!==i));const cur=JSON.parse(localStorage.getItem("ld_current_user")||"null");if(cur&&(cur.id||cur.email)===(deleted.id||deleted.email))localStorage.removeItem("ld_current_user");renderCustomers()}
document.getElementById("customerSearch")?.addEventListener("input",renderCustomers);
const _render=render;render=function(){_render();renderCustomers()};

document.getElementById("voucherAccountSelect")?.addEventListener("change",renderVoucherAssignment);
document.getElementById("assignVoucherBtn")?.addEventListener("click",assignSelectedVoucher);

document.getElementById("adminLoginForm")?.addEventListener("submit",function(e){e.preventDefault();const email=document.getElementById("adminLoginEmail").value;const password=document.getElementById("adminLoginPassword").value;const error=document.getElementById("adminLoginError");if(adminLogin(email,password)){error.textContent="";this.reset()}else{error.textContent="Incorrect email or password. Please try again.";document.getElementById("adminLoginPassword").focus()}});
if(checkAdmin()){loadSettings();loadPaymentSettings();render()}
