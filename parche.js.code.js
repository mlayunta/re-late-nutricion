/* ============================================================
   parche.js — Re-Late: recetas + alimentos combinables
   y creación de recetas propias (guardadas en el dispositivo).
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
  if(hint)hint.textContent='Toca un alimento en "Alimentos" o el botón 📖 Receta de cada comida: todo se combina en el mismo bloque.';

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

  /* ---- Comidas: UN solo bloque con alimentos + recetas ---- */
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
  renderMeals();recChips();recRender();
})();