/* O Empório — listagem, busca, paginação e detalhe de Novidades (CMS) */
(function(){
var POSTS=[{"slug": "cervejaria-do-mes-dois-corvos", "eyebrow": "Cervejaria do mês", "cat": "Mostra de cerveja", "titulo": "Dois Corvos na torneira", "sub": "Quatro rótulos exclusivos da cervejaria lisboeta durante todo o mês de outubro.", "data": "2025-10-02", "foto": "amb_balcao_tap", "corpo": ["Em outubro, as nossas torneiras vestem-se de Dois Corvos. Trouxemos quatro rótulos da icónica cervejaria de Marvila, de uma Pale Ale fácil a uma Imperial Stout encorpada.", "## O que esperar", "Cada cerveja foi escolhida a dedo pela equipa para acompanhar o nosso cardápio de comfort food. Pergunte ao staff pela harmonização recomendada do dia.", "A seleção é limitada e roda enquanto durarem os barris — venha cedo para provar todas."]}, {"slug": "novo-burger-beef", "eyebrow": "Novo no cardápio", "cat": "Cardápio", "titulo": "Chegou o Burger BEEF", "sub": "Hambúrguer de vaca no pão da casa com a marca “O”, bacon e queijo derretido.", "data": "2025-09-28", "foto": "food_burger", "corpo": ["O nosso novo Burger BEEF chega com um pão assinado: estampado com o símbolo do O Empório, feito localmente.", "Carne de vaca suculenta, bacon estaladiço, queijo derretido e o molho da casa. Acompanha na perfeição uma das nossas craft beers locais."]}, {"slug": "beericeira-2025", "eyebrow": "Estamos no", "cat": "Evento · Ericeira", "titulo": "BEERiceira 2025", "sub": "O O Empório marca presença no maior encontro de cerveja artesanal da vila — três dias de torneiras especiais, collabs e muita gente boa.", "data": "2025-10-05", "foto": "amb_outsite_noite", "rot": "coral", "corpo": ["O maior festival de cerveja artesanal da Ericeira está de volta — e o O Empório não podia ficar de fora. Durante três dias, a vila enche-se de cervejeiros, música de rua e o melhor que a cena craft portuguesa tem para oferecer.", "Este ano preparámos algo especial: uma collab exclusiva criada a quatro mãos com uma cervejaria parceira, disponível apenas durante o festival e, enquanto durar, nas nossas torneiras.", "## A nossa collab exclusiva", "Uma cerveja pensada para a Ericeira: leve, cítrica e com um toque salino que lembra o mar. Foi desenhada para acompanhar o nosso comfort food e para se beber à mesa, sem pressa, entre amigos.", "Veja como foi a edição do ano passado:", {"video": "aqz-KE-bpKQ"}, "## O ambiente do festival", "Da fachada à noite ao balcão a postos, é assim que vivemos o BEERiceira. Um registo dos momentos que tornam estes dias únicos.", {"gallery": ["amb_outsite_noite", "amb_balcao_tap", "amb_balcao_view", "food_costela", "food_burger", "food_kafta"]}, "## Onde nos encontrar", "Estaremos com um espaço próprio durante todo o evento, além das torneiras especiais aqui no pub. Siga o nosso Instagram para o mapa, os horários e a programação completa — e venha brindar connosco."]}, {"slug": "workshop-prova-as-cegas", "eyebrow": "Workshop cervejeiro", "cat": "Workshop", "titulo": "Prova às cegas de IPAs", "sub": "Uma noite para treinar o paladar e descobrir o que distingue cada estilo de IPA.", "data": "2025-09-21", "foto": null, "tone": "g2", "corpo": ["Conduzido pela nossa equipa, este workshop leva-o por uma viagem às cegas pelo universo das IPAs — da West Coast à Hazy.", "Vagas limitadas. Inclui provas, fichas de degustação e um petisco para acompanhar."]}, {"slug": "costela-na-cerveja", "eyebrow": "Novo no cardápio", "cat": "Cardápio", "titulo": "Costela na Cerveja", "sub": "Costela desfiada, cozida lentamente na nossa cerveja, servida com pão.", "data": "2025-09-15", "foto": "food_costela", "corpo": ["Horas de cozedura lenta na nossa cerveja para uma costela que se desfaz ao toque do garfo.", "Servida com pão fresco para não desperdiçar nem uma gota do molho. Um clássico de conforto da casa."]}, {"slug": "horario-feriado-outubro", "eyebrow": "Comunicado", "cat": "Comunicado", "titulo": "Horário especial de feriado", "sub": "Confira os nossos horários durante a semana do feriado.", "data": "2025-10-04", "foto": null, "tone": "g3", "corpo": ["Durante a semana do feriado, ajustamos o nosso horário para receber melhor quem nos visita.", "## Funcionamento", "Abrimos mais cedo nos dias de maior movimento. Recomendamos reserva para grupos. Qualquer dúvida, fale connosco pelo Instagram."]}, {"slug": "wine-tasting-ribeirinha", "eyebrow": "Evento", "cat": "Evento", "titulo": "Wine Tasting: Quinta da Ribeirinha", "sub": "Uma noite dedicada aos vinhos da região, para variar do lúpulo.", "data": "2025-11-08", "foto": "amb_balcao_view", "corpo": ["Nem só de cerveja vive o O Empório. Recebemos a Quinta da Ribeirinha para uma prova guiada de vinhos da região.", "Lugares limitados, com harmonização de petiscos incluída."]}, {"slug": "tap-takeover-fermentage", "eyebrow": "Tap takeover", "cat": "Mostra de cerveja", "titulo": "Fermentage assume as torneiras", "sub": "Por uma noite, a cervejaria do Porto toma conta de todas as torneiras da casa.", "data": "2025-09-12", "foto": null, "tone": "g1", "corpo": ["Um tap takeover completo: todas as torneiras dedicadas à Fermentage por uma só noite.", "Da Sea Salt Gose a edições especiais, é a oportunidade de provar a cervejaria em profundidade."]}, {"slug": "kafta-no-menu", "eyebrow": "Novo no cardápio", "cat": "Cardápio", "titulo": "Kafta do Empório", "sub": "Espetadas de kafta grelhada sobre rúcula, com queijo fresco.", "data": "2025-08-30", "foto": "food_kafta", "corpo": ["Tempero da casa, grelha no ponto e uma cama de rúcula fresca com queijo. O nosso novo petisco para partilhar.", "Pede uma cerveja local e está feito o par perfeito."]}, {"slug": "aniversario-o-emporio", "eyebrow": "Festa", "cat": "Evento", "titulo": "1 ano de O Empório", "sub": "Celebramos o nosso primeiro aniversário com uma noite especial. Venha brindar connosco.", "data": "2025-11-22", "foto": null, "tone": "g2", "rot": "coral", "corpo": ["Um ano a juntar gente boa à volta de boa cerveja. Para celebrar, preparámos uma noite especial com surpresas na torneira e na cozinha.", "## Como participar", "Entrada livre. Siga o nosso Instagram para os detalhes da programação e das edições comemorativas."]}];
var NAVHTML="<nav class=\"nav\"><div class=\"nav-inner\">\n      <a class=\"brand\" href=\"index.html\"><img class=\"lockup\" src=\"\" data-img=\"lockup_neg\" alt=\"O Emp\u00f3rio \u2014 Comfort Food &amp; Craft Beer\"></a>\n      <div class=\"nav-links\"><a href=\"index.html\">In\u00edcio</a><a href=\"cardapio.html\">Card\u00e1pio</a><a href=\"novidades.html\">Novidades</a><a href=\"index.html#visit\">Visite-nos</a></div>\n      <div class=\"nav-right\"><div class=\"lang\"><span class=\"on\">PT</span><span>EN</span></div><button class=\"btn btn-accent\" type=\"button\" data-open=\"modal20\">20% OFF</button></div>\n    </div></nav>";
var M={};try{M=JSON.parse(document.getElementById('imgmap').textContent)}catch(e){}
var MES=['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
var MESL=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
var PER=6,page=1,q='';
var sec=document.querySelector('.novp'),grid=document.getElementById('np-grid'),pager=document.getElementById('np-pager'),count=document.getElementById('np-count'),detail=document.getElementById('np-detail'),qin=document.getElementById('np-q');
function esc(s){return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function dchip(iso){var d=new Date(iso);return MES[d.getMonth()]+'<b>'+d.getDate()+'</b>';}
function dfull(iso){var d=new Date(iso);return d.getDate()+' de '+MESL[d.getMonth()]+' de '+d.getFullYear();}
function tone(p,i){return p.foto?'':(p.tone||['g1','g2','g3'][i%3]);}
function card(p,i){
 var ph=(p.foto&&M[p.foto])?'<div class="ph" style="background-image:url(\''+M[p.foto]+'\')"></div>':'<div class="ph '+tone(p,i)+'"></div>';
 return '<a class="artcard" href="#/'+p.slug+'">'+ph+'<div class="scrim"></div><div class="frame"></div>'+
 '<div class="top"><span class="rotulo '+(p.rot||'')+'">'+esc(p.cat)+'</span></div>'+
 '<div class="datechip">'+dchip(p.data)+'</div>'+
 '<div class="bottom"><div class="sup">'+esc(p.eyebrow)+'</div><h4>'+esc(p.titulo)+'</h4><div class="sb">'+esc(p.sub)+'</div></div></a>';
}
function filtered(){var s=q.trim().toLowerCase();if(!s)return POSTS;return POSTS.filter(function(p){return (p.titulo+' '+p.sub+' '+p.cat+' '+p.eyebrow+' '+(p.corpo||[]).join(' ')).toLowerCase().indexOf(s)>=0;});}
function renderList(){
 var arr=filtered();var pages=Math.max(1,Math.ceil(arr.length/PER));if(page>pages)page=pages;
 count.textContent=arr.length+(arr.length===1?' novidade':' novidades');
 var sl=arr.slice((page-1)*PER,page*PER);
 grid.innerHTML=sl.length?sl.map(card).join(''):'<div class="np-empty">Nenhuma novidade encontrada para “'+esc(q)+'”.</div>';
 var h='';h+='<button '+(page<=1?'disabled':'')+' data-pg="'+(page-1)+'">‹</button>';
 for(var i=1;i<=pages;i++)h+='<button class="'+(i===page?'on':'')+'" data-pg="'+i+'">'+i+'</button>';
 h+='<button '+(page>=pages?'disabled':'')+' data-pg="'+(page+1)+'">›</button>';
 pager.innerHTML=pages>1?h:'';
}
function blocks(arr){return (arr||[]).map(function(b){
 if(typeof b==='string'){return b.indexOf('## ')===0?'<h3>'+esc(b.slice(3))+'</h3>':'<p>'+esc(b)+'</p>';}
 if(b.video){return '<div class="npd-video"><iframe src="https://www.youtube-nocookie.com/embed/'+b.video+'" title="Vídeo" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe></div>';}
 if(b.gallery){return '<div class="npd-gallery">'+b.gallery.map(function(k){return M[k]?'<img src="'+M[k]+'" alt="" data-lb="'+M[k]+'">':'';}).join('')+'</div>';}
 return '';}).join('');}
function openDetail(slug){
 var p=null;for(var i=0;i<POSTS.length;i++){if(POSTS[i].slug===slug){p=POSTS[i];break;}}
 if(!p){sec.classList.remove('detail');return;}
 var photo=(p.foto&&M[p.foto])?'<div class="npd-photo-wrap"><img class="npd-photo" src="'+M[p.foto]+'" alt=""></div>':'';
 var url=encodeURIComponent(location.href),t=encodeURIComponent(p.titulo+' — O Empório');
 var share='<div class="npd-share"><span class="lbl">Partilhar:</span>'+
   '<button type="button" data-copy>Copiar link</button>'+
   '<a href="https://wa.me/?text='+t+'%20'+url+'" target="_blank" rel="noopener">WhatsApp</a>'+
   '<a href="https://www.facebook.com/sharer/sharer.php?u='+url+'" target="_blank" rel="noopener">Facebook</a>'+
   '<a href="https://twitter.com/intent/tweet?text='+t+'&url='+url+'" target="_blank" rel="noopener">X</a>'+
   '<a href="mailto:?subject='+t+'&body='+url+'">E-mail</a></div>';
 var others=POSTS.filter(function(x){return x.slug!==p.slug;}).slice(0,3);
 var more='<section class="npd-more"><div class="wrap"><span class="kicker">Mais novidades</span><div class="np-grid nov-grid">'+others.map(function(x,i){return card(x,i);}).join('')+'</div></div></section>';
 var end='<div class="npd-end"><button class="btn" type="button" data-all>Ver todas as novidades →</button></div>';
 detail.innerHTML='<div class="npd-hero">'+NAVHTML+'<div class="wrap">'+
   
   '<div class="npd-eye">'+esc(p.eyebrow)+'</div>'+
   '<div class="npd-meta"><span class="rotulo '+(p.rot||'')+'">'+esc(p.cat)+'</span><span class="npd-date">'+dfull(p.data)+'</span></div>'+
   '<h1>'+esc(p.titulo)+'</h1><p class="npd-sub">'+esc(p.sub)+'</p></div></div>'+
   photo+'<div class="npd-body">'+blocks(p.corpo)+'</div>'+share+more+end;
 detail.querySelectorAll('img[data-img]').forEach(function(im){im.src=M[im.dataset.img];});
 var cp=detail.querySelector('[data-copy]');if(cp)cp.addEventListener('click',function(){try{navigator.clipboard.writeText(location.href);cp.textContent='Link copiado!';setTimeout(function(){cp.textContent='Copiar link';},1800);}catch(e){}});
 var al=detail.querySelector('[data-all]');if(al)al.addEventListener('click',function(){location.hash='';});
 sec.classList.add('detail');window.scrollTo(0,0);
}
function route(){var h=location.hash;if(h.indexOf('#/')===0){openDetail(decodeURIComponent(h.slice(2)));}else{sec.classList.remove('detail');window.scrollTo(0,0);}}
pager.addEventListener('click',function(e){var b=e.target.closest('button');if(b&&b.getAttribute('data-pg')){page=parseInt(b.getAttribute('data-pg'),10);renderList();window.scrollTo(0,0);}});
if(qin){qin.addEventListener('input',function(){q=qin.value;page=1;renderList();});}
var lb=document.getElementById('npd-lb'),lbimg=document.getElementById('npd-lb-img');
document.addEventListener('click',function(e){var g=e.target.closest&&e.target.closest('[data-lb]');if(g){lbimg.src=g.getAttribute('data-lb');lb.classList.add('open');return;}if((e.target.closest&&e.target.closest('[data-lbclose]'))||e.target===lb){lb.classList.remove('open');}});
window.addEventListener('hashchange',route);
renderList();route();
})();
