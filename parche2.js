/* ============================================================
   parche.js v2 — Re-Late: recetas + alimentos combinables,
   recetas propias y PLATOS PREPARADOS ampliados (55 platos).
   USO: guarda este archivo JUNTO a index.html y añade esta
   línea justo antes de </body> en index.html:
   <script src="parche.js"></script>
   ============================================================ */
(function(){
  /* ---- CSS extra ---- */
  var st=document.createElement('style');
  st.textContent=
  '.mini-btn{background:var(--primary);color:#fff;border:none;border-radius:8px;font-size:.66rem;font-weight:700;padding:5px 9px;cursor:pointer;margin-left:6px}'+
  '.mini-btn.alt{background:var(--accent);color:var(--primary-dark);border:1.5px solid var(--primary)}'+
  '.mini-btn:active{transform:scale(.94)}'+
  '.meal-actions{display:flex;align-items:center}'+
  '.pi-ic{margin-right:4px}'+
  '.pick-item{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-bottom:1px solid var(--border);cursor:pointer}'+
  '.pick-item:hover{background:var(--accent)}'+
  '.rf-row{margin:8px 0}'+
  '.rf-row label{display:block;font-size:.74rem;font-weight:600;color:var(--text-light);margin-bottom:3px}'+
  '.rf-row input,.rf-row select,.rf-row textarea{width:100%;padding:9px 12px;border:2px solid var(--border);border-radius:8px;background:var(--card);color:var(--text);font-size:.88rem;font-family:inherit}'+
  '.rf-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:10px 0}'+
  '.rf-grid label{font-size:.64rem;color:var(--text-light);display:block;margin-bottom:2px}'+
  '.rf-grid input{width:100%;padding:8px 4px;border:2px solid var(--border);border-radius:8px;background:var(--card);color:var(--text);font-size:.85rem;text-align:center}'+
  '.rc-err{color:var(--danger);font-size:.78rem;min-height:16px;margin:6px 0}'+
  '.rec-del{width:100%;margin-top:8px;padding:9px;border:1.5px solid var(--danger);border-radius:12px;background:transparent;color:var(--danger);font-weight:600;font-size:.78rem;cursor:pointer}';
  document.head.appendChild(st);

  /* ---- Inyectar UI nueva (botón + modales) ---- */
  var btn=document.createElement('button');
  btn.className='btn btn-primary btn-block';btn.id='openRecipeCreator';
  btn.style.marginBottom='8px';btn.textContent='➕ Crear receta nueva';
  var rs=document.getElementById('recipeSearch');
  rs.parentNode.insertBefore(btn,rs);

  var hint=document.querySelector('#tab-plate .card p.muted');
  if(hint)hint.textContent='Toca un alimento en "Alimentos", un plato preparado o el botón 📖 Receta: todo se combina en el mismo bloque.';

  var wrap=document.createElement('div');
  wrap.innerHTML=
  '<div class="modal-overlay" id="recipePickModal"><div class="modal">'+
  '<h3 id="rpTitle">📖 Añadir receta</h3>'+
  '<p class="muted">Toca una receta para elegir raciones y comida.</p>'+
  '<input class="search-box" id="rpSearch" placeholder="Buscar receta o ingrediente..." style="margin:10px 0">'+
  '<div class="food-list" id="rpList" style="max-height:340px"></div>'+
  '<button class="btn btn-outline btn-block" id="rpClose">Cerrar</button>'+
  '</div></div>'+
  '<div class="modal-overlay" id="recipeEditModal"><div class="modal">'+
  '<h3>➕ Crear receta nueva</h3>'+
  '<p class="muted">Se guarda solo en tu dispositivo (RGPD) y aparece junto al recetario.</p>'+
  '<div class="rf-row"><label>Nombre *</label><input id="rcName" placeholder="Ej: Bowl de salmón y mango"></div>'+
  '<div class="rf-row"><label>Tipo</label><select id="rcCat">'+
  '<option value="desayunos">☕ Desayuno</option><option value="comidas">🍽️ Comida</option>'+
  '<option value="cenas">🌙 Cena</option><option value="aperitivos">🥂 Aperitivo / Media</option></select></div>'+
  '<div class="rf-row"><label>Ingredientes (uno por línea)</label><textarea id="rcIng" rows="4"></textarea></div>'+
  '<div class="rf-row"><label>Elaboración (un paso por línea)</label><textarea id="rcSteps" rows="4"></textarea></div>'+
  '<div class="rf-row"><label>Consejo cardio (opcional)</label><input id="rcTip"></div>'+
  '<div class="rf-grid">'+
  '<div><label>kcal *</label><input type="number" id="rcKcal" min="1"></div>'+
  '<div><label>Proteína g</label><input type="number" step="0.1" id="rcProt"></div>'+
  '<div><label>H.C. g</label><input type="number" step="0.1" id="rcCarbs"></div>'+
  '<div><label>Azúcares g</label><input type="number" step="0.1" id="rcSugars"></div>'+
  '<div><label>Grasa g</label><input type="number" step="0.1" id="rcFat"></div>'+
  '<div><label>Saturada g</label><input type="number" step="0.1" id="rcSat"></div>'+
  '<div><label>Fibra g</label><input type="number" step="0.1" id="rcFiber"></div>'+
  '<div><label>Sodio mg</label><input type="number" id="rcSodium"></div></div>'+
  '<p class="rc-err" id="rcErr"></p>'+
  '<button class="btn btn-primary btn-block" id="rcSave">💾 Guardar receta</button>'+
  '<button class="btn btn-outline btn-block" id="rcCancel">Cancelar</button>'+
  '</div></div>';
  document.body.appendChild(wrap);

  /* ---- Estado extra: recetas propias + persistencia ---- */
  var customRecipes=[];
  try{customRecipes=JSON.parse(localStorage.getItem('relate_custom')||'[]');}catch(e){customRecipes=[];}
  var _save=save;
  save=function(){_save();localStorage.setItem('relate_custom',JSON.stringify(customRecipes));};

  var REC_MEAL={desayunos:'breakfast',comidas:'lunch',cenas:'dinner',aperitivos:'snack'};
  function getRecipes(){return RECIPE_FLAT.concat(customRecipes.map(function(r){return Object.assign({},r);}));}

  /* ============================================================
     PLATOS PREPARADOS AMPLIADOS (49 nuevos → 55 en total)
     Valores por ración: kcal / proteína g / grasa g / HC g
     Semáforo: green=recomendado, yellow=moderación
     ============================================================ */
  var NUEVOS=[
    /* Desayunos y dulces sanos */
    {n:'Tostada integral de tomate y AOVE',k:190,p:5,f:10,car:22,light:'green'},
    {n:'Porridge de avena con fruta',k:310,p:11,f:8,car:46,light:'green'},
    {n:'Yogur natural con nueces y arándanos',k:175,p:8,f:10,car:14,light:'green'},
    {n:'Batido de frutas y avena',k:230,p:8,f:5,car:38,light:'green'},
    {n:'Tortilla francesa de verduras',k:180,p:14,f:12,car:4,light:'green'},
    {n:'Revuelto de setas y espinacas',k:210,p:16,f:14,car:6,light:'green'},
    {n:'Yogur griego con semillas y fresas',k:190,p:16,f:6,car:16,light:'green'},
    {n:'Compota de manzana con canela y nueces',k:140,p:3,f:7,car:18,light:'green'},
    {n:'Flan de huevo casero sin azúcar',k:160,p:9,f:11,car:6,light:'green'},
    {n:'Arroz con leche desnatado con canela',k:220,p:9,f:5,car:34,light:'yellow'},
    /* Legumbres y bowls */
    {n:'Bowl de quinoa con verduras asadas',k:340,p:12,f:12,car:44,light:'green'},
    {n:'Garbanzos salteados con espinacas',k:330,p:15,f:8,car:46,light:'green'},
    {n:'Potaje de judías con calabaza',k:290,p:14,f:4,car:48,light:'green'},
    {n:'Cocido ligero (garbanzos, verdura y pollo)',k:420,p:32,f:10,car:44,light:'green'},
    {n:'Arroz integral con verduras y tofu',k:380,p:16,f:10,car:54,light:'green'},
    {n:'Pasta integral con pesto de almendras',k:390,p:13,f:14,car:52,light:'yellow'},
    {n:'Cous-cous con legumbres y verduras',k:360,p:15,f:8,car:54,light:'green'},
    {n:'Lentejas con verduras y cúrcuma',k:300,p:17,f:4,car:46,light:'green'},
    {n:'Espinacas salteadas con garbanzos',k:290,p:14,f:8,car:40,light:'green'},
    {n:'Hummus con crudités y pan integral',k:280,p:10,f:12,car:32,light:'green'},
    /* Cremas y sopas */
    {n:'Crema de calabacín con jengibre',k:140,p:4,f:7,car:14,light:'green'},
    {n:'Sopa de miso con tofu',k:95,p:8,f:4,car:6,light:'green'},
    {n:'Puré de boniato con leche desnatada',k:160,p:5,f:2,car:30,light:'green'},
    /* Pescados y mariscos */
    {n:'Salmón a la plancha con ensalada',k:340,p:28,f:18,car:8,light:'green'},
    {n:'Atún al horno con pimientos',k:250,p:30,f:8,car:10,light:'green'},
    {n:'Merluza al horno con patata y cebolla',k:280,p:26,f:8,car:26,light:'green'},
    {n:'Bacalao al horno con tomate',k:240,p:28,f:8,car:10,light:'green'},
    {n:'Dorada a la espalda con verduras',k:230,p:26,f:9,car:6,light:'green'},
    {n:'Sardinas a la plancha con pan integral',k:320,p:22,f:18,car:18,light:'green'},
    {n:'Calamares a la plancha con alioli ligero',k:220,p:24,f:9,car:6,light:'green'},
    {n:'Gambas al ajilimón',k:150,p:22,f:6,car:2,light:'green'},
    {n:'Tostada de salmón ahumado con queso batido',k:240,p:20,f:10,car:18,light:'yellow'},
    /* Aves y carnes magras */
    {n:'Pollo al horno con boniato',k:350,p:32,f:12,car:26,light:'green'},
    {n:'Pavo guisado con setas',k:250,p:32,f:8,car:6,light:'green'},
    {n:'Conejo al romero con verduras',k:230,p:30,f:7,car:8,light:'green'},
    {n:'Albóndigas de ternera magra en salsa de tomate',k:300,p:28,f:14,car:12,light:'yellow'},
    {n:'Estofado de ternera magra con verduras',k:340,p:32,f:14,car:16,light:'yellow'},
    /* Ensaladas completas */
    {n:'Ensalada de pollo y garbanzos',k:340,p:28,f:12,car:28,light:'green'},
    {n:'Ensalada templada de lentillas',k:300,p:16,f:8,car:40,light:'green'},
    {n:'Ensalada de arroz integral con atún',k:360,p:24,f:10,car:46,light:'green'},
    {n:'Ensalada de quinoa con aguacate',k:330,p:11,f:14,car:38,light:'green'},
    /* Verduras como plato principal */
    {n:'Wok de tofu con brócoli',k:250,p:16,f:10,car:20,light:'green'},
    {n:'Huevos pochados sobre crema de guisantes',k:220,p:15,f:14,car:10,light:'green'},
    {n:'Pimientos rellenos de atún y arroz integral',k:310,p:22,f:10,car:32,light:'green'},
    {n:'Berenjena al horno con tomate y orégano',k:160,p:5,f:9,car:14,light:'green'},
    {n:'Champiñones rellenos de queso fresco',k:170,p:12,f:10,car:6,light:'green'},
    /* Bocados salados */
    {n:'Sándwich integral de pavo, aguacate y tomate',k:330,p:22,f:14,car:30,light:'green'},
    {n:'Wrap integral de pollo y verduras',k:340,p:26,f:12,car:34,light:'green'},
    {n:'Guacamole con totopos de maíz horneados',k:240,p:5,f:14,car:24,light:'yellow'}
  ];
  PREPARED.push.apply(PREPARED,NUEVOS);

  /* ---- Buscador de platos preparados ---- */
  var prepSearch=document.createElement('input');
  prepSearch.className='search-box';prepSearch.id='prepSearch';
  prepSearch.placeholder='Buscar entre los '+PREPARED.length+' platos preparados...';
  prepSearch.style.marginTop='8px';
  var pl=document.getElementById('preparedList');
  pl.parentNode.insertBefore(prepSearch,pl);
  prepSearch.addEventListener('input',renderPrepList);

  function openPrepared(p){
    pendingFood=Object.assign({},p,{ref:1,unit:'ud',t:'dish',_calc:{k:p.k,p:p.p,f:p.f,car:p.car,qty:1,unit:' ración'}});
    pendingMeal='lunch';
    document.getElementById('qtyTitle').textContent='🥗 '+p.n;
    document.getElementById('qtyInput').value=1;
    document.getElementById('qtyUnit').value='ud';
    document.getElementById('qtyUnit').disabled=true;
    document.getElementById('qtyInput').disabled=true;
    document.getElementById('qtyKcal').textContent=fmt(p.k)+' kcal';
    document.getElementById('qtyMacro').textContent=fmt(p.p)+' g proteína · '+fmt(p.f)+' g grasa · '+fmt(p.car)+' g hidratos';
    renderMealChips();
    document.getElementById('qtyModal').classList.add('show');
  }
  function renderPrepList(){
    var q=(document.getElementById('prepSearch').value||'').toLowerCase().trim();
    var out='';
    PREPARED.forEach(function(p,i){
      if(q&&p.n.toLowerCase().indexOf(q)<0)return;
      out+='<div class="food-item" data-i="'+i+'"><span class="food-name">'+lightDot(p.light)+p.n+'</span>'+
      '<span class="food-kcal">'+p.k+' kcal · '+p.p+'P · '+p.f+'G · '+p.car+'C</span></div>';
    });
    var list=document.getElementById('preparedList');
    list.innerHTML=out||'<p class="muted" style="padding:12px">Sin resultados.</p>';
    Array.prototype.forEach.call(list.querySelectorAll('.food-item'),function(el){
      el.onclick=function(){openPrepared(PREPARED[+el.dataset.i]);};
    });
  }
  renderPrepared=function(){renderPrepList();};
  Array.prototype.forEach.call(document.querySelectorAll('#tab-plate h3'),function(h){
    if(h.textContent.indexOf('Platos preparados')>=0)h.textContent='🥗 Platos preparados (cardiosaludables · '+PREPARED.length+')';
  });

  /* ---- Comidas: UN solo bloque con alimentos + platos + recetas ---- */
  renderMeals=function(){
    document.getElementById('mealsWrap').innerHTML=MEALS.map(function(m){
      var arr=meals[m.id],t=mealTotals(arr);
      var items=arr.length?arr.map(function(it,i){
        var ic=(it.t==='recipe'||it.unit===' rac')?'📖':(it.t==='dish'?'🍽️':'🥗');
        return '<div class="plate-item">'+
          '<button class="remove-btn" data-m="'+m.id+'" data-i="'+i+'">✕</button>'+
          '<div class="p-name"><span class="pi-ic">'+ic+'</span>'+it.name+'</div>'+
          '<div class="p-qty">'+it.qty+it.unit+'</div>'+
          '<div class="p-kcal">'+fmt(it.k)+' kcal</div></div>';
      }).join(''):'<p class="muted">Sin alimentos ni recetas todavía.</p>';
      return '<div class="meal-section">'+
        '<div class="meal-head"><h4>'+m.label+'</h4><div class="meal-actions">'+
        '<button class="mini-btn" data-addf="'+m.id+'">➕ Alimento</button>'+
        '<button class="mini-btn alt" data-addr="'+m.id+'">📖 Receta</button>'+
        '<span class="meal-kcal">'+fmt(t.k)+' kcal</span></div></div>'+
        '<div class="meal-plate">'+items+'</div></div>';
    }).join('');
    document.querySelectorAll('.remove-btn').forEach(function(b){b.onclick=function(){meals[b.dataset.m].splice(+b.dataset.i,1);save();renderMeals();};});
    document.querySelectorAll('[data-addf]').forEach(function(b){b.onclick=function(){switchTab('tab-foods');toast('Elige un alimento y su comida');};});
    document.querySelectorAll('[data-addr]').forEach(function(b){b.onclick=function(){openRecipePicker(b.dataset.addr);};});
    var tot=dayTotals();
    document.getElementById('nutriSummary').innerHTML=
      '<div class="nutri-box"><div class="value">'+fmt(tot.k)+'</div><div class="label">kcal</div></div>'+
      '<div class="nutri-box"><div class="value">'+fmt(tot.p)+'</div><div class="label">Proteína</div></div>'+
      '<div class="nutri-box"><div class="value">'+fmt(tot.f)+'</div><div class="label">Grasa</div></div>'+
      '<div class="nutri-box"><div class="value">'+fmt(tot.car)+'</div><div class="label">Hidratos</div></div>';
    var pct=goal?Math.min(tot.k/goal*100,100):0;
    document.getElementById('progFill').style.width=pct+'%';
    document.getElementById('progFill').classList.toggle('over',tot.k>goal);
    document.getElementById('progText').textContent=fmt(tot.k)+' de '+goal+' kcal · '+Math.round(tot.k/goal*100)+'% del objetivo';
    var d={};MEALS.forEach(function(m){d[m.id]=mealTotals(meals[m.id]).k;});
    diary[todayKey()]=d;save();renderDiary();
  };

  /* ---- Selector de recetas (combinar desde Comidas) ---- */
  var pickMeal='lunch';
  function openRecipePicker(mealId){
    pickMeal=mealId||'lunch';
    var m=MEALS.find(function(x){return x.id===pickMeal;});
    document.getElementById('rpTitle').textContent='📖 Añadir receta a '+(m?m.label:'la comida');
    document.getElementById('rpSearch').value='';
    renderPickList();
    document.getElementById('recipePickModal').classList.add('show');
  }
  function renderPickList(){
    var q=(document.getElementById('rpSearch').value||'').toLowerCase().trim();
    var list=getRecipes().filter(function(r){return !q||r.name.toLowerCase().includes(q)||r.ingredients.some(function(i){return i.toLowerCase().includes(q);});});
    document.getElementById('rpList').innerHTML=list.length?list.map(function(r){
      return '<div class="pick-item" data-rp="'+r.id+'"><span class="food-name">'+(r.custom?'⭐ ':'📖 ')+r.name+'</span>'+
      '<span class="food-kcal">'+r.nutrition.kcal+' kcal · '+r.nutrition.protein+' g P</span></div>';
    }).join(''):'<p class="muted" style="padding:12px">Sin recetas.</p>';
    document.querySelectorAll('#rpList .pick-item').forEach(function(el){el.onclick=function(){
      var r=getRecipes().find(function(x){return x.id===el.dataset.rp;});
      document.getElementById('recipePickModal').classList.remove('show');
      recOpen(r,pickMeal);
    };});
  }

  /* ---- Overrides del recetario (incluye recetas propias) ---- */
  recOpen=function(r,mealOverride){
    if(!r)return;
    pendingRecipe=r;pendingFood=null;
    document.getElementById('qtyTitle').textContent='🍽️ '+r.name;
    document.getElementById('qtyInput').value=1;document.getElementById('qtyInput').disabled=false;
    document.getElementById('qtyUnit').value='ud';document.getElementById('qtyUnit').disabled=true;
    pendingMeal=mealOverride||r.meal;
    renderMealChips();recPreview();
    document.getElementById('qtyModal').classList.add('show');
  };
  recQuickAdd=function(r,rac){
    var n=r.nutrition,tgt=pendingMeal||r.meal;
    try{
      if(!meals[tgt])meals[tgt]=[];
      meals[tgt].push({name:r.name,k:n.kcal*rac,p:n.protein*rac,f:n.fat*rac,car:n.carbs*rac,qty:rac,unit:' rac',t:'recipe'});
      save();renderMeals();toast('Receta añadida ✅');switchTab('tab-plate');
    }catch(e){toast('No se pudo añadir la receta');}
  };
  recChips=function(){
    var ch=[{key:'Todas',label:'Todas',emoji:'📚',n:getRecipes().length}]
      .concat(RECIPE_CATS.map(function(c){return {key:c.key,label:c.label,emoji:c.emoji,n:RECIPE_DB[c.key].length};}))
      .concat([{key:'mias',label:'Mis recetas',emoji:'⭐',n:customRecipes.length}]);
    document.getElementById('recipeChips').innerHTML=ch.map(function(c){
      return '<button class="rchip'+(c.key===recCat?' active':'')+'" data-rc="'+c.key+'">'+c.emoji+' '+c.label+' · '+c.n+'</button>';
    }).join('');
    document.querySelectorAll('#recipeChips .rchip').forEach(function(b){b.onclick=function(){recCat=b.dataset.rc;recChips();recRender();};});
  };
  recFiltered=function(){
    var q=(document.getElementById('recipeSearch').value||'').toLowerCase().trim();
    return getRecipes().filter(function(r){
      return (recCat==='Todas'?true:(recCat==='mias'?!!r.custom:r.cat===recCat))&&
      (!q||r.name.toLowerCase().includes(q)||r.ingredients.some(function(i){return i.toLowerCase().includes(q);})||r.tip.toLowerCase().includes(q));
    });
  };
  recCard=function(r){
    var c=RECIPE_CATS.find(function(x){return x.key===r.cat;});
    var open=openRec===r.id;
    var h='<article class="rec-card'+(open?' open':'')+'">';
    h+='<button class="rec-head" data-toggle="'+r.id+'"><span class="rec-emoji">'+(c?c.emoji:'🍽️')+'</span>'+
      '<span class="rec-tt"><span class="rec-name">'+recEsc(r.name)+'</span>'+
      '<span class="rec-meta">'+r.nutrition.kcal+' kcal · '+r.nutrition.protein+' g prot · '+r.nutrition.fiber+' g fibra · '+r.nutrition.sodium+' mg sodio</span></span>'+
      '<span class="rec-chev">'+(open?'▲':'▼')+'</span></button>';
    if(open){
      h+='<div class="rec-body"><div class="rec-tip">💡 '+recEsc(r.tip)+'</div>';
      h+='<div class="rec-sec">🥗 Ingredientes</div><ul class="rec-ul">'+r.ingredients.map(function(i){return '<li>'+recEsc(i)+'</li>';}).join('')+'</ul>';
      h+='<div class="rec-sec">👨‍🍳 Elaboración</div><ol class="rec-ol">'+r.steps.map(function(s){return '<li>'+recEsc(s)+'</li>';}).join('')+'</ol>';
      h+='<div class="rec-sec">📊 Nutrientes por ración</div>'+recBadges(r.nutrition)+recAlerts(r.nutrition);
      if(r.custom)h+='<button class="rec-del" data-del="'+r.id+'">🗑 Eliminar esta receta</button>';
      h+='<button class="rec-add" data-add="'+r.id+'">➕ Añadir a mis comidas</button></div>';
    }
    return h+'</article>';
  };
  recRender=function(){
    var list=recFiltered();
    document.getElementById('recipeList').innerHTML=list.length?list.map(recCard).join(''):'<div class="rec-empty">🔍 Sin resultados. Prueba: avena, salmón, garbanzos…</div>';
    document.querySelectorAll('#recipeList .rec-head').forEach(function(b){b.onclick=function(){openRec=(openRec===b.dataset.toggle)?null:b.dataset.toggle;recRender();};});
    document.querySelectorAll('#recipeList .rec-add').forEach(function(b){b.onclick=function(){recOpen(getRecipes().find(function(r){return r.id===b.dataset.add;}));};});
    document.querySelectorAll('#recipeList .rec-del').forEach(function(b){b.onclick=function(){
      customRecipes=customRecipes.filter(function(r){return r.id!==b.dataset.del;});
      save();recChips();recRender();toast('Receta eliminada');
    };});
  };

  /* ---- Creador de recetas propias ---- */
  function openRecipeCreator(){
    ['rcName','rcIng','rcSteps','rcTip','rcKcal','rcProt','rcCarbs','rcSugars','rcFat','rcSat','rcFiber','rcSodium'].forEach(function(id){document.getElementById(id).value='';});
    document.getElementById('rcCat').value='comidas';
    document.getElementById('rcErr').textContent='';
    document.getElementById('recipeEditModal').classList.add('show');
  }
  document.getElementById('rcSave').onclick=function(){
    var name=document.getElementById('rcName').value.trim(),kcal=+document.getElementById('rcKcal').value||0;
    if(!name||!kcal){document.getElementById('rcErr').textContent='⚠️ El nombre y las kcal son obligatorios.';return;}
    var cat=document.getElementById('rcCat').value;
    customRecipes.push({id:'u'+Date.now(),name:name,custom:true,cat:cat,meal:REC_MEAL[cat],
      ingredients:document.getElementById('rcIng').value.split('\n').map(function(s){return s.trim();}).filter(Boolean),
      steps:document.getElementById('rcSteps').value.split('\n').map(function(s){return s.trim();}).filter(Boolean),
      tip:document.getElementById('rcTip').value.trim()||'Receta personalizada.',
      nutrition:{kcal:kcal,protein:+document.getElementById('rcProt').value||0,carbs:+document.getElementById('rcCarbs').value||0,
        sugars:+document.getElementById('rcSugars').value||0,fat:+document.getElementById('rcFat').value||0,
        satFat:+document.getElementById('rcSat').value||0,fiber:+document.getElementById('rcFiber').value||0,
        sodium:+document.getElementById('rcSodium').value||0}});
    save();recCat=cat;recChips();recRender();
    document.getElementById('recipeEditModal').classList.remove('show');
    toast('Receta creada ⭐');
  };
  document.getElementById('rcCancel').onclick=function(){document.getElementById('recipeEditModal').classList.remove('show');};
  document.getElementById('openRecipeCreator').onclick=openRecipeCreator;
  document.getElementById('rpClose').onclick=function(){document.getElementById('recipePickModal').classList.remove('show');};
  document.getElementById('rpSearch').addEventListener('input',renderPickList);

  /* ---- Añadir alimentos/platos marcándolos con su tipo ---- */
  document.getElementById('qtyAdd').onclick=function(){
    if(pendingRecipe&&!pendingFood)return; /* lo gestiona el listener original */
    if(!pendingFood||!pendingFood._calc)return;
    var c=pendingFood._calc;
    meals[pendingMeal].push({name:pendingFood.n,k:c.k,p:c.p,f:c.f,car:c.car,qty:c.qty,unit:c.unit,t:(c.unit===' ración')?'dish':'food'});
    save();renderMeals();document.getElementById('qtyModal').classList.remove('show');
    toast('Añadido ✅');switchTab('tab-plate');
  };

  /* ---- Refrescar vistas con la nueva lógica ---- */
  renderMeals();recChips();recRender();renderPrepList();
})();