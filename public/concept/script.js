const menu=document.querySelector('.menu-button');const navigation=document.querySelector('#navigation');menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');navigation.classList.toggle('open',open)});navigation.addEventListener('click',e=>{if(e.target.closest('a')){navigation.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation')}});document.addEventListener('keydown',e=>{if(e.key==='Escape'){navigation.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation')}});
document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});document.querySelectorAll('.tool-card').forEach(card=>{card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter})}));
const rates={bengaluru:[1700,2400,3500],mumbai:[2200,3200,4500],delhi:[1800,2600,3800],chennai:[1600,2200,3200],hyderabad:[1700,2400,3400],pune:[1900,2700,3800],tier2:[1400,1900,2700]};const city=document.querySelector('#city'),area=document.querySelector('#area');function updateBudget(){const size=Number(area.value);if(!area.validity.valid||!size){document.querySelector('#estimate').textContent='Enter a valid area';document.querySelector('#rate-note').textContent='Choose an area from 100 to 50,000 sq ft.';return}const rate=rates[city.value][Number(document.querySelector('input[name="quality"]:checked').value)];document.querySelector('#estimate').textContent='₹'+(size*rate/100000).toFixed(2)+' lakh';document.querySelector('#rate-note').textContent=size.toLocaleString('en-IN')+' sq ft × ₹'+rate.toLocaleString('en-IN')+' / sq ft'}city.addEventListener('change',updateBudget);area.addEventListener('input',updateBudget);document.querySelectorAll('input[name="quality"]').forEach(input=>input.addEventListener('change',updateBudget));
const regions={india:{code:'IN / 01',title:'Build with a local perspective.',description:'Construction budgets, interiors, material quantities, home loan EMI, and regional land conversions.'},usa:{code:'US / 02',title:'Give your next project perspective.',description:'Explore tools for remodeling, home additions, outdoor projects, property taxes, and rent-versus-buy planning.'},uae:{code:'AE / 03',title:'Understand the costs of your next move.',description:'Explore Dubai property acquisition costs, including transfer fees, mortgage registration, and ongoing community service charges.'}};const regionTabs=[...document.querySelectorAll('[data-region]')];function setRegion(button){regionTabs.forEach(tab=>{tab.setAttribute('aria-selected',String(tab===button));tab.tabIndex=tab===button?0:-1});const region=regions[button.dataset.region],panel=document.querySelector('#region-content');panel.setAttribute('aria-labelledby',button.id);panel.querySelector('.region-number').textContent=region.code;panel.querySelector('h3').textContent=region.title;panel.querySelector('p').textContent=region.description}regionTabs.forEach((tab,index)=>{tab.addEventListener('click',()=>setRegion(tab));tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%3;if(event.key==='ArrowLeft')next=(index+2)%3;if(event.key==='Home')next=0;if(event.key==='End')next=2;if(next!==undefined){event.preventDefault();setRegion(regionTabs[next]);regionTabs[next].focus()}})});

// Progressive enhancement: all content and links work without the animation engine.
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  const motion = gsap.matchMedia();
  const header = document.querySelector('header');
  ScrollTrigger.create({start:1,end:'max',onUpdate:self=>header.classList.toggle('scrolled',self.scroll()>40)});
  gsap.to('.scroll-progress',{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:true}});

  motion.add('(prefers-reduced-motion: no-preference)',()=>{
    const intro = gsap.timeline({defaults:{ease:'power3.out',duration:1.1}});
    intro.from('.hero-image',{scale:1.09,duration:1.9},0)
      .from('.hero-eyebrow',{y:15,autoAlpha:0,duration:.8},.1)
      .from('.hero-line > span',{yPercent:115,stagger:.12},.2)
      .from('.hero-description, .hero-actions',{y:25,autoAlpha:0,stagger:.12,duration:.8},.65)
      .from('.hero-project-card',{y:50,autoAlpha:0,rotation:4,duration:1},.8)
      .from('.hero-bottom',{autoAlpha:0,duration:.8},1);
    gsap.to('.hero-media',{yPercent:18,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    gsap.to('.hero-copy',{y:70,opacity:.25,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    const statement = document.querySelector('.manifesto-text');
    // Keep spaces and inline emphasis intact while revealing words through scroll.
    const walker=document.createTreeWalker(statement,NodeFilter.SHOW_TEXT);const texts=[];
    while(walker.nextNode())texts.push(walker.currentNode);
    texts.forEach(node=>{const fragment=document.createDocumentFragment();node.textContent.split(/(\s+)/).forEach(part=>{if(!part.trim())fragment.append(document.createTextNode(part));else{const span=document.createElement('span');span.className='word';span.textContent=part;fragment.append(span)}});node.replaceWith(fragment)});
    gsap.fromTo(statement.querySelectorAll('.word'),{opacity:.2},{opacity:1,stagger:.08,ease:'none',scrollTrigger:{trigger:'.manifesto',start:'top 75%',end:'bottom 65%',scrub:1}});
    gsap.from('.intro-strip>div',{y:20,autoAlpha:0,stagger:.12,duration:.8,scrollTrigger:{trigger:'.intro-strip',start:'top 88%',once:true}});
    const reveals=document.querySelectorAll('.section-heading, .budget-copy, .plans-copy, .region-layout>div:first-child, .pro-header, .faq-layout>div:first-child, .final-cta>div');
    reveals.forEach(el=>gsap.from(el,{y:45,autoAlpha:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}}));
    document.querySelectorAll('.steps article, .pro-benefits article').forEach(el=>gsap.from(el,{y:35,autoAlpha:0,duration:.9,scrollTrigger:{trigger:el,start:'top 90%',once:true}}));
    gsap.from('.tool-grid',{y:35,autoAlpha:0,duration:1,scrollTrigger:{trigger:'.tool-grid',start:'top 88%',once:true}});
    gsap.from('.budget-panel',{y:65,rotation:2,autoAlpha:0,duration:1.1,scrollTrigger:{trigger:'.budget-panel',start:'top 85%',once:true}});
    gsap.from('.mini-bars i, .finance-chart i',{scaleY:0,stagger:.06,duration:1,ease:'power2.out',scrollTrigger:{trigger:'.tool-grid',start:'top 75%',once:true}});
    gsap.from('.material-preview i',{scaleX:0,stagger:.1,duration:1,scrollTrigger:{trigger:'.tool-grid',start:'top 75%',once:true}});
    gsap.fromTo('.plan-background',{scale:1.1,yPercent:-4},{scale:1,yPercent:4,ease:'none',scrollTrigger:{trigger:'.plan-visual',start:'top bottom',end:'bottom top',scrub:1}});
    gsap.fromTo('.plan-sheet',{rotation:-10,y:55},{rotation:2,y:-25,ease:'none',scrollTrigger:{trigger:'.plan-visual',start:'top 90%',end:'bottom 20%',scrub:1}});
    gsap.to('.pro-orbit',{rotation:25,ease:'none',scrollTrigger:{trigger:'.pro-section',start:'top bottom',end:'bottom top',scrub:1}});
    gsap.from('.footer-statement',{y:50,autoAlpha:0,duration:1.1,scrollTrigger:{trigger:'.footer-statement',start:'top 92%',once:true}});
    return ()=>{statement.querySelectorAll('.word').forEach(span=>span.replaceWith(document.createTextNode(span.textContent)))};
  });

  motion.add('(min-width: 761px) and (prefers-reduced-motion: no-preference)',()=>{
    const journey=document.querySelector('.journey');journey.classList.add('is-animated');
    const scenes=[...journey.querySelectorAll('.journey-scene')],images=[...journey.querySelectorAll('.journey-image')],chapters=[...journey.querySelectorAll('.chapter')];
    gsap.set(scenes.slice(1),{autoAlpha:0,y:35});gsap.set(images.slice(1),{opacity:1,clipPath:'inset(0 100% 0 0)',scale:1.07});
    let previous=-1;
    const story=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{id:'home-story',trigger:journey,start:'top 83px',end:()=>'+='+innerHeight*2.8,pin:'.journey-stage',pinSpacing:true,scrub:.65,invalidateOnRefresh:true,onUpdate:self=>{
      const index=self.progress<.31?0:self.progress<.65?1:2;
      if(index!==previous){previous=index;chapters.forEach((chapter,i)=>{chapter.classList.toggle('active',i===index);if(i===index)chapter.setAttribute('aria-current','step');else chapter.removeAttribute('aria-current')});scenes.forEach((scene,i)=>{scene.inert=i!==index});journey.querySelector('.journey-counter').textContent='0'+(index+1)+' / 03'}
    }}});
    story.to(images[0],{scale:1.06,duration:1.2},0)
      .to(scenes[0],{autoAlpha:0,y:-25,duration:.24},.88)
      .to(images[1],{clipPath:'inset(0 0% 0 0)',scale:1,duration:.52,ease:'power2.inOut'},.88)
      .to(scenes[1],{autoAlpha:1,y:0,duration:.35},1.08)
      .to(images[1],{scale:1.04,duration:.8},1.5)
      .to(scenes[1],{autoAlpha:0,y:-25,duration:.24},2.08)
      .to(images[2],{clipPath:'inset(0 0% 0 0)',scale:1,duration:.52,ease:'power2.inOut'},2.08)
      .to(scenes[2],{autoAlpha:1,y:0,duration:.35},2.28)
      .to(images[2],{scale:1.04,duration:.8},2.7);
    // Chapter links double as direct scroll controls while the story is pinned.
    const handlers=chapters.map((chapter,index)=>{const handler=event=>{event.preventDefault();const trigger=story.scrollTrigger;window.scrollTo({top:trigger.start+(trigger.end-trigger.start)*[.12,.47,.84][index],behavior:'smooth'})};chapter.addEventListener('click',handler);return handler});
    return ()=>{journey.classList.remove('is-animated');scenes.forEach(s=>{s.inert=false});chapters.forEach((c,i)=>{c.removeEventListener('click',handlers[i]);c.classList.toggle('active',i===0);c.removeAttribute('aria-current')});journey.querySelector('.journey-counter').textContent='01 / 03'};
  });

  motion.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',()=>{
    const removers=[];
    document.querySelectorAll('.tool-card').forEach(card=>{const move=event=>{const box=card.getBoundingClientRect();card.style.setProperty('--mouse-x',(event.clientX-box.left)+'px');card.style.setProperty('--mouse-y',(event.clientY-box.top)+'px')};card.addEventListener('pointermove',move);removers.push(()=>card.removeEventListener('pointermove',move))});
    document.querySelectorAll('.hero-actions .button, .hero-project-card, .pro-bottom .button').forEach(button=>{const x=gsap.quickTo(button,'x',{duration:.5,ease:'power3.out'}),y=gsap.quickTo(button,'y',{duration:.5,ease:'power3.out'});const move=e=>{const b=button.getBoundingClientRect();x((e.clientX-b.left-b.width/2)*.08);y((e.clientY-b.top-b.height/2)*.08)};const leave=()=>{x(0);y(0)};button.addEventListener('pointermove',move);button.addEventListener('pointerleave',leave);removers.push(()=>{button.removeEventListener('pointermove',move);button.removeEventListener('pointerleave',leave)})});
    return ()=>removers.forEach(remove=>remove());
  });
  document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>ScrollTrigger.refresh()));
  document.querySelectorAll('details').forEach(detail=>detail.addEventListener('toggle',()=>ScrollTrigger.refresh()));
  document.fonts.ready.then(()=>ScrollTrigger.refresh());
  window.addEventListener('load',()=>ScrollTrigger.refresh(),{once:true});
  window.addEventListener('pageshow',()=>ScrollTrigger.refresh());
}
