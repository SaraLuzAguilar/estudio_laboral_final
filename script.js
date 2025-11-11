/* script.js - lógica compartida para index.html y quiz.html */
document.addEventListener('DOMContentLoaded', ()=>{

  // Navegación lateral
  document.querySelectorAll('.topic').forEach(t => {
    t.addEventListener('click', () => {
      const id = t.dataset.topic || t.getAttribute('data-topic');
      const el = document.getElementById(id);
      if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });

  // Buscar
  const buscar = document.getElementById('buscar'), clear = document.getElementById('clear');
  if(buscar){
    buscar.addEventListener('input', ()=> {
      const q = buscar.value.trim().toLowerCase();
      document.querySelectorAll('.section').forEach(s => {
        s.style.display = q === '' || s.innerText.toLowerCase().includes(q) ? 'block' : 'none';
      });
    });
  }
  if(clear){
    clear.addEventListener('click', ()=> { if(buscar){ buscar.value=''; buscar.dispatchEvent(new Event('input')); }});
  }

  // Print
  const btnPrint = document.getElementById('btnPrint');
  if(btnPrint) btnPrint.addEventListener('click', ()=> window.print());

  // Deep toggles (tarjeta expandible dentro del bloque)
  document.querySelectorAll('.deepBtn').forEach(btn=>{
    btn.addEventListener('click', ()=> {
      const target = btn.dataset.target;
      const el = document.getElementById(target);
      if(!el) return;
      el.classList.toggle('show');
      if(el.classList.contains('show')) el.scrollIntoView({behavior:'smooth', block:'center'});
    });
  });

  // Init quiz page if corresponde
  if(document.body.id === 'page-quiz') initQuizPage();
});

/* --------------------- QUIZ: 50 preguntas --------------------- */
/* Preguntas cubren todos los temas. Cada item: q, options[], correct(index), topic */
const QUESTIONS = [
  {q:"¿Qué artículo define el contrato de trabajo en la LCT?", options:["Art.21","Art.23","Art.90"], correct:0, topic:"Contrato"},
  {q:"¿Qué artículo presume existencia de relación laboral?", options:["Art.21","Art.23","Art.140"], correct:1, topic:"Presunción"},
  {q:"¿Cuál es el principio que favorece al trabajador en caso de duda?", options:["Primacía de la forma","Indubio pro operario","Autonomía de la voluntad"], correct:1, topic:"Principios"},
  {q:"¿Cuáles son dos elementos esenciales del contrato (elige la opción que los contiene)?", options:["Sujeto y objeto","Objeto y jurisdicción","Forma y jurisdicción"], correct:0, topic:"Contrato"},
  {q:"Caracteres del contrato: ¿cuál es uno de ellos?", options:["Personal","Unilateral","Instantáneo"], correct:0, topic:"Caracteres"},
  {q:"¿Qué fuente es la de mayor jerarquía para derechos laborales?", options:["Convenio colectivo","Constitución Nacional","Costumbre"], correct:1, topic:"Fuentes"},
  {q:"¿Cuál NO es fuente formal del derecho laboral?", options:["Doctrina","Jurisprudencia","Opinión personal del empleador"], correct:2, topic:"Fuentes"},
  {q:"Forma de determinar remuneración: ¿cuál es una de las 6?", options:["Por amistad","Por producción","Por azar"], correct:1, topic:"Remuneración"},
  {q:"¿Qué concepto suele ser no remunerativo si está comprobado?:", options:["Viáticos con comprobantes","Horas extras","Comisiones"], correct:0, topic:"Remuneración"},
  {q:"¿Cuál es la jornada ordinaria máxima diaria?", options:["8 h","10 h","6 h"], correct:0, topic:"Jornada"},
  {q:"¿Cuál es el límite semanal ordinario estándar?", options:["40 h","48 h","56 h"], correct:1, topic:"Jornada"},
  {q:"¿Horas nocturnas horario comúnmente considerado nocturno?", options:["21–6","20–5","22–7"], correct:0, topic:"Jornada"},
  {q:"¿Qué significa 'primacía de la realidad'?", options:["Primacía del contrato escrito","Prevalece la situación fáctica","Primacía del convenio"], correct:1, topic:"Principios"},
  {q:"¿Qué debe contener el recibo de sueldo?", options:["Solo el neto","Detalle de haberes y descuentos","Solo la firma del empleado"], correct:1, topic:"Prueba"},
  {q:"Vacaciones para menos de 5 años de antigüedad:", options:["14 días","21 días","28 días"], correct:0, topic:"Vacaciones"},
  {q:"Vacaciones para 7 años de antigüedad:", options:["14 días","21 días","28 días"], correct:1, topic:"Vacaciones"},
  {q:"SAC corresponde a:", options:["50% del mejor sueldo del semestre","25% del sueldo mensual","100% de la jornada"], correct:0, topic:"SAC"},
  {q:"Período de prueba típico:", options:["3 meses","1 año","1 mes"], correct:0, topic:"Período de prueba"},
  {q:"¿Cuál es una forma válida de contrato?", options:["Plazo fijo","Contrato eterno","Contrato por telegrama"], correct:0, topic:"Contratos"},
  {q:"Si se abusa de contratos a plazo, puede ocurrir:", options:["Se mantiene plazo fijo","Conversión a indeterminado","Sanción al trabajador"], correct:1, topic:"Contratos"},
  {q:"Horas extras recargo típico en día hábil:", options:["+25%","+50%","+100%"], correct:1, topic:"Horas extras"},
  {q:"Horas extras en domingo/feriado recargo típico:", options:["+25%","+50%","+100%"], correct:2, topic:"Horas extras"},
  {q:"Descanso mínimo entre jornadas:", options:["8 h","12 h","24 h"], correct:1, topic:"Descansos"},
  {q:"Descanso semanal mínimo habitual:", options:["24 h","35 h","48 h"], correct:1, topic:"Descansos"},
  {q:"Estabilidad por embarazo hasta:", options:["3 meses después","7.5 meses después","1 año después"], correct:1, topic:"Maternidad"},
  {q:"Licencia por maternidad (días más comunes):", options:["90 días","30 días","45 días"], correct:0, topic:"Maternidad"},
  {q:"Excedencia por cuidado del hijo (sin sueldo) suele ser:", options:["3 meses","6 meses","12 meses"], correct:1, topic:"Maternidad"},
  {q:"Preaviso del trabajador al renunciar (típico):", options:["15 días","1 mes","3 meses"], correct:0, topic:"Extinción"},
  {q:"Preaviso del empleador (mínimo frecuente):", options:["15 días","1 mes (<5 años) / 2 meses (>5 años)","6 meses"], correct:1, topic:"Extinción"},
  {q:"Si el empleador no da preaviso corresponde:", options:["Nada","Indemnización sustitutiva","Sanción penal"], correct:1, topic:"Extinción"},
  {q:"Renuncia produce:", options:["Indemnización","Extinción sin indemnización (salvo pactos)","Conversion automática en despido"], correct:1, topic:"Extinción"},
  {q:"Despido sin justa causa obliga a:", options:["Nada","Indemnización por antigüedad","Solo preaviso"], correct:1, topic:"Extinción"},
  {q:"Característica 'personal' del contrato significa:", options:["Puede delegarse","Lo realiza el trabajador en persona","Es opcional"], correct:1, topic:"Caracteres"},
  {q:"La LCT es complemento de:", options:["Convenios colectivos y Constitución","Reglas de etiqueta","Normas escolares"], correct:0, topic:"Fuentes"},
  {q:"Qué elemento demuestra subordinación:", options:["Control horario y órdenes","Factura emitida","Publicidad online"], correct:0, topic:"Contrato"},
  {q:"¿Qué es la 'primacía de la realidad' aplicada en recibos? ", options:["Se mira solo el recibo","Se observa la práctica real","Se ignora todo"], correct:1, topic:"Prueba"},
  {q:"La antigüedad sirve para:", options:["Calcular indemnización y adicionales","Solo para vacaciones","Nada"], correct:0, topic:"Antigüedad"},
  {q:"Trabajo insalubre suele implicar:", options:["Topes y adicionales","Solo descanso","Menos derechos"], correct:0, topic:"Jornada"},
  {q:"¿Qué debe hacer el empleador al finalizar relación?", options:["Dar liquidación final y preaviso o indemnización","No hacer nada","Solo borrar registros"], correct:0, topic:"Extinción"},
  {q:"¿Qué es la irrenunciabilidad?", options:["Pérdida voluntaria de derechos","No poder renunciar a derechos mínimos","Sanción disciplinaria"], correct:1, topic:"Principios"},
  {q:"Convenios colectivos sirven para:", options:["Mejorar condiciones por sobre la ley","Eliminar la ley","Enviar comunicados"], correct:0, topic:"Fuentes"},
  {q:"Qué se considera remuneración por producción:", options:["Paga por pieza","Pago por asistencia","Pago social"], correct:0, topic:"Remuneración"},
  {q:"Qué elemento figura en recibo para probar antigüedad:", options:["Fecha de ingreso","Solo la firma","Solo el nombre del empleador"], correct:0, topic:"Prueba"},
  {q:"Cuál es la duración típica de vacaciones si tienes >20 años antigüedad:", options:["28 días","35 días","21 días"], correct:1, topic:"Vacaciones"},
  {q:"¿Qué ocurre si se pagan viáticos sin comprobantes?", options:["Siempre son no remunerativos","Pueden ser considerados remunerativos","No afectan nada"], correct:1, topic:"Remuneración"},
  {q:"¿Cuál es la consecuencia de trabajo no registrado descubierto?", options:["Sanciones, pago de aportes e indemnizaciones","Solo multa al empleado","Nada"], correct:0, topic:"Prueba"}
];

/* Init quiz page: crea 50 preguntas al azar (o repetidas si pool menor) */
function initQuizPage(){
  const container = document.getElementById('quizContainer');
  if(!container) return;
  // Preparamos pool de 50
  let pool = QUESTIONS.slice();
  while(pool.length < 50) pool = pool.concat(QUESTIONS.slice());
  pool = shuffle(pool).slice(0,50);
  window._QUIZ_POOL = pool;

  container.innerHTML = '';
  pool.forEach((it, idx) => {
    const qdiv = document.createElement('div');
    qdiv.className = 'q';
    qdiv.innerHTML = `<p><strong>${idx+1})</strong> ${it.q}</p>`;
    it.options.forEach((opt, k) => {
      const id = `q${idx}_opt${k}`;
      const label = document.createElement('label');
      label.innerHTML = `<input type="radio" name="q${idx}" value="${k}" id="${id}"> ${opt}`;
      qdiv.appendChild(label);
    });
    container.appendChild(qdiv);
  });

  document.getElementById('btnCheck').addEventListener('click', checkQuiz);
  document.getElementById('btnShowAnswers').addEventListener('click', showAnswers);
  document.getElementById('btnReset').addEventListener('click', ()=> {
    document.querySelectorAll('input[type=radio]').forEach(i=> i.checked=false);
    document.getElementById('result').textContent = '';
  });
}

/* helpers */
function shuffle(a){ const r=a.slice(); for(let i=r.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [r[i],r[j]]=[r[j],r[i]];} return r; }

function checkQuiz(){
  const pool = window._QUIZ_POOL; if(!pool) return;
  let correct=0; const wrongTopics={};
  pool.forEach((it, idx) => {
    const sel = document.querySelector(`input[name="q${idx}"]:checked`);
    const chosen = sel ? parseInt(sel.value) : null;
    if(chosen === it.correct) correct++;
    else { wrongTopics[it.topic] = (wrongTopics[it.topic]||0)+1; }
  });
  const total = pool.length; const pct = Math.round((correct/total)*100);
  const result = document.getElementById('result');
  result.textContent = `Resultado: ${correct}/${total} (${pct}%)`;
  const topics = Object.entries(wrongTopics).sort((a,b)=>b[1]-a[1]);
  if(topics.length){
    const rec = topics.slice(0,4).map(t=>`${t[0]} (${t[1]})`).join(', ');
    result.textContent += ` — Repasar: ${rec}`;
  } else result.textContent += ' — ¡Excelente!';

  // marca visual
  pool.forEach((it, idx) => {
    const qDiv = document.querySelectorAll('.q')[idx];
    if(!qDiv) return;
    qDiv.style.border = '1px solid rgba(255,255,255,0.03)';
    qDiv.querySelectorAll('label').forEach(l=> l.style.background='transparent');
    const sel = document.querySelector(`input[name="q${idx}"]:checked`);
    const chosen = sel ? parseInt(sel.value) : null;
    if(chosen === it.correct){
      if(sel && sel.parentNode) sel.parentNode.style.background = 'linear-gradient(90deg, rgba(120,200,80,0.12), transparent)';
    } else {
      if(sel && sel.parentNode) sel.parentNode.style.background = 'linear-gradient(90deg, rgba(255,80,80,0.12), transparent)';
      const correctInput = document.querySelector(`input[name="q${idx}"][value="${it.correct}"]`);
      if(correctInput && correctInput.parentNode) correctInput.parentNode.style.background = 'linear-gradient(90deg, rgba(80,180,240,0.12), transparent)';
    }
  });
}

function showAnswers(){
  const pool = window._QUIZ_POOL; if(!pool) return;
  pool.forEach((it, idx) => {
    const correctInput = document.querySelector(`input[name="q${idx}"][value="${it.correct}"]`);
    if(correctInput && correctInput.parentNode) correctInput.parentNode.style.background = 'linear-gradient(90deg, rgba(80,180,240,0.12), transparent)';
  });
}

/* expose for console if needed */
window.checkQuiz = checkQuiz; window.showAnswers = showAnswers; window.initQuizPage = initQuizPage;
