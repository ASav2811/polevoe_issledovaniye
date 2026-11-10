'use strict';
(function(){
  const sections=[...document.querySelectorAll('.chapter')];
  const links=[...document.querySelectorAll('.nav-link')];
  const progress=document.getElementById('read-progress');
  const sidebar=document.getElementById('sidebar');
  const toggle=document.getElementById('nav-toggle');
  const backdrop=document.getElementById('nav-backdrop');
  const modal=document.getElementById('media-modal');
  const viewer=document.getElementById('viewer');
  const title=document.getElementById('modal-title');
  const caption=document.getElementById('slide-caption');
  const counter=document.getElementById('slide-counter');
  const roomOrder=['Археология','Изба','Усадьбы','Салтыковка','Фабрика','Школа','Военный период','Советский период','Зал природы'];
  let currentRoom=null,index=0,lastTrigger=null,touchX=0;
  function closeMenu(){sidebar.classList.remove('open');backdrop.classList.remove('active');toggle.setAttribute('aria-expanded','false')}
  function openMenu(){sidebar.classList.add('open');backdrop.classList.add('active');toggle.setAttribute('aria-expanded','true')}
  toggle.addEventListener('click',()=>sidebar.classList.contains('open')?closeMenu():openMenu());
  backdrop.addEventListener('click',closeMenu);
  links.forEach(link=>link.addEventListener('click',closeMenu));
  function onScroll(){const max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);progress.style.width=`${Math.min(100,scrollY/max*100)}%`}
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      for(const e of entries){if(e.isIntersecting){links.forEach(l=>l.classList.toggle('active',l.dataset.section===e.target.id))}}
    },{rootMargin:'-15% 0px -70% 0px',threshold:0});
    sections.forEach(s=>observer.observe(s));
  }
  function renderSlide(){
    const list=MEDIA[currentRoom]||[];
    if(!list.length){viewer.innerHTML='<p class="no-media">Для этого зала пока нет медиаматериалов.</p>';counter.textContent='';caption.textContent='';return}
    index=(index+list.length)%list.length;
    const m=list[index]; viewer.replaceChildren();
    if(m.type==='video'){
      const video=document.createElement('video');
      video.controls=true;video.playsInline=true;video.preload='metadata';video.setAttribute('aria-label',m.caption||'Видео экспозиции');
      const source=document.createElement('source');source.src=m.src;source.type='video/mp4';video.appendChild(source);
      video.append('Ваш браузер не поддерживает воспроизведение видео.');viewer.appendChild(video);
    }else{
      const img=document.createElement('img');img.src=m.src;img.alt=m.caption||m.original;img.loading='eager';viewer.appendChild(img);
    }
    caption.textContent=m.caption||m.original||'';
    counter.textContent=`${index+1} / ${list.length} · ${m.type==='video'?'ВИДЕО':'ФОТО'}`;
    document.getElementById('prev-media').disabled=list.length===1;
    document.getElementById('next-media').disabled=list.length===1;
  }
  function openGallery(room,trigger){
    if(!MEDIA[room])return;
    if(!modal.open){lastTrigger=trigger||document.activeElement;modal.showModal()}
    currentRoom=room; index=0; title.textContent=room;renderSlide();document.getElementById('modal-close').focus();
  }
  function closeGallery(){if(!modal.open)return;viewer.replaceChildren();modal.close();if(lastTrigger&&lastTrigger.isConnected)lastTrigger.focus()}
  document.querySelectorAll('[data-open-gallery]').forEach(btn=>btn.addEventListener('click',()=>openGallery(btn.dataset.openGallery,btn)));
  document.getElementById('modal-close').addEventListener('click',closeGallery);
  modal.addEventListener('click',e=>{if(e.target===modal)closeGallery()});
  modal.addEventListener('cancel',e=>{e.preventDefault();closeGallery()});
  document.getElementById('prev-media').addEventListener('click',()=>{index--;renderSlide()});
  document.getElementById('next-media').addEventListener('click',()=>{index++;renderSlide()});
  function changeRoom(direction){const at=roomOrder.indexOf(currentRoom);if(at<0)return;const next=(at+direction+roomOrder.length)%roomOrder.length;openGallery(roomOrder[next])}
  document.getElementById('prev-room').addEventListener('click',()=>changeRoom(-1));
  document.getElementById('next-room').addEventListener('click',()=>changeRoom(1));
  document.addEventListener('keydown',e=>{
    if(modal.open){if(e.key==='ArrowLeft'){e.preventDefault();index--;renderSlide()}else if(e.key==='ArrowRight'){e.preventDefault();index++;renderSlide()}}
    if(e.key==='Escape'&&sidebar.classList.contains('open'))closeMenu();
  });
  viewer.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX},{passive:true});
  viewer.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchX;if(Math.abs(dx)>65){index+=(dx<0?1:-1);renderSlide()}},{passive:true});
})();
