/* O Empório — navegação por âncoras + scrollspy do cardápio */
(function(){
var bar=document.querySelector('.catnav');if(!bar)return;
var links=[].slice.call(bar.querySelectorAll('a[href^="#"]'));
var map=links.map(function(a){return {a:a,el:document.querySelector(a.getAttribute('href'))};}).filter(function(x){return x.el;});
var fb=document.querySelector('.filters');
function spy(){var off=(fb?fb.offsetHeight:60)+60;var cur=map[0];map.forEach(function(m){if(m.el.getBoundingClientRect().top<=off)cur=m;});links.forEach(function(a){a.classList.remove('on');});if(cur)cur.a.classList.add('on');}
window.addEventListener('scroll',spy,{passive:true});window.addEventListener('resize',spy);spy();
})();
