// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, {threshold:0.15});
reveals.forEach(el=>io.observe(el));

// Artworks / Artists tabs (Explore Art page)
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// Cart — persists across pages via localStorage
const cartCountEl = document.getElementById('cartCount');
function getCartCount(){ return parseInt(localStorage.getItem('gh_cart_count') || '0', 10); }
function setCartCount(n){ localStorage.setItem('gh_cart_count', n); if(cartCountEl) cartCountEl.textContent = n; }
setCartCount(getCartCount());

document.querySelectorAll('.add-btn[data-name]').forEach(btn=>{
  const name = btn.dataset.name;
  if(localStorage.getItem('gh_added_' + name)){
    btn.textContent = 'Added ✓';
    btn.classList.add('added');
  }
  btn.addEventListener('click', ()=>{
    if(btn.classList.contains('added')) return;
    setCartCount(getCartCount() + 1);
    localStorage.setItem('gh_added_' + name, '1');
    btn.textContent = 'Added ✓';
    btn.classList.add('added');
  });
});

// Mobile nav toggle
const menuBtn = document.querySelector('.menu-btn');
const links = document.querySelector('nav.links');
if(menuBtn && links){
  menuBtn.addEventListener('click', ()=>{
    const open = links.style.display === 'flex';
    links.style.display = open ? 'none' : 'flex';
    links.style.cssText += open ? '' : 'position:absolute; top:100%; left:0; right:0; flex-direction:column; background:var(--marble); padding:24px 32px; border-bottom:1px solid var(--stone-line); gap:20px;';
  });
}
