'use strict';
const menus = Array.from(document.querySelectorAll('.services-menu, .mobile-nav'));
menus.forEach(menu => {
  menu.addEventListener('toggle', () => {
    if (menu.open) menus.forEach(other => { if (other !== menu) other.open = false; });
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') menus.forEach(menu => {
    if (menu.open) { menu.open = false; menu.querySelector('summary').focus(); }
  });
});
document.addEventListener('click', event => {
  menus.forEach(menu => { if (menu.open && !menu.contains(event.target)) menu.open = false; });
});
const form = document.getElementById('enquiry');
if (form) {
  const service = document.getElementById('service');
  const requested = new URLSearchParams(window.location.search).get('service');
  if (Array.from(service.options).some(option => option.value === requested)) service.value = requested;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const organisation = document.getElementById('organisation').value.trim();
    const brief = document.getElementById('brief').value.trim();
    const subject = 'Palisade enquiry: ' + service.value;
    const body = 'Requirement: ' + service.value + '\nOrganisation: ' + organisation + '\n\n' + brief;
    window.location.href = 'mailto:info@palisadeprotectivesecurity.co.uk?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    document.getElementById('email-status').textContent = 'Email draft requested. If your email application did not open, use the direct email link. No enquiry has been sent by this page.';
  });
}

const header = document.querySelector('.header');
if (header) {
  if (typeof ResizeObserver !== 'undefined') {
    const headerSize = new ResizeObserver(() => document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px'));
    headerSize.observe(header);
  }
  const desktopPointer = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1201px)');
  let previousScroll = window.scrollY;
  let pointerInHeader = false;
  let pointerAtEdge = false;
  const showNavigation = () => header.classList.remove('nav-hidden');
  const protectedNavigation = () => pointerInHeader || pointerAtEdge || header.contains(document.activeElement) || menus.some(menu => menu.open);
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (!desktopPointer.matches || currentScroll < header.offsetHeight || currentScroll < previousScroll || protectedNavigation()) {
      showNavigation();
    } else if (currentScroll > previousScroll) {
      header.classList.add('nav-hidden');
    }
    previousScroll = currentScroll;
  }, { passive: true });
  document.addEventListener('pointermove', event => {
    pointerAtEdge = event.clientY <= 20;
    if (pointerAtEdge) showNavigation();
  }, { passive: true });
  header.addEventListener('pointerenter', () => { pointerInHeader = true; showNavigation(); });
  header.addEventListener('pointerleave', () => { pointerInHeader = false; });
  document.addEventListener('pointerleave', () => { pointerAtEdge = false; pointerInHeader = false; });
  header.addEventListener('focusin', showNavigation);
  menus.forEach(menu => menu.addEventListener('toggle', () => { if (menu.open) showNavigation(); }));
  desktopPointer.addEventListener('change', showNavigation);
}

const imageDisclosures = Array.from(document.querySelectorAll('.image-disclosure'));
imageDisclosures.forEach(disclosure => {
  const loadImages = () => {
    disclosure.querySelectorAll('template.disclosure-image').forEach(template => {
      template.replaceWith(template.content.cloneNode(true));
    });
  };
  disclosure.addEventListener('toggle', () => {
    if (!disclosure.open) return;
    loadImages();
    const group = disclosure.closest('.disclosure-group');
    if (group) group.querySelectorAll('.image-disclosure').forEach(other => {
      if (other !== disclosure) other.open = false;
    });
  });
  if (disclosure.open) loadImages();
});

const knowledgeWidgets = Array.from(document.querySelectorAll('.box-knowledge'));
knowledgeWidgets.forEach(widget => {
  const controls = widget.querySelector('.boxswitch');
  if (!controls) return;
  const buttons = Array.from(controls.querySelectorAll('button'));
  const figure = widget.querySelector('.box-figure');
  const note = widget.querySelector('.box-note');
  const fallback = widget.querySelector('.knowledge-fallback');
  if (!figure || !note || !fallback || buttons.length !== 3) return;
  const selectLevel = index => {
    const button = buttons[index];
    if (!['black', 'grey', 'white'].includes(button.dataset.level)) return;
    figure.dataset.level = button.dataset.level;
    note.textContent = button.textContent + '. ' + button.dataset.explanation;
    buttons.forEach((other, position) => other.setAttribute('aria-pressed', String(position === index)));
  };
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => selectLevel(index));
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
      else if (event.key === 'ArrowLeft') next = (index + buttons.length - 1) % buttons.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = buttons.length - 1;
      else return;
      event.preventDefault();
      selectLevel(next);
      buttons[next].focus();
    });
  });
  selectLevel(0);
  controls.hidden = false;
  note.hidden = false;
  fallback.hidden = true;
});

Array.from(document.querySelectorAll('.assurance-journey')).forEach(widget => {
  const controls = widget.querySelector('.assurance-stages');
  if (!controls) return;
  const tabs = Array.from(controls.querySelectorAll('a[href^="#assurance-"]'));
  const panels = tabs.map(tab => widget.querySelector(tab.getAttribute('href')));
  if (tabs.length !== 6 || panels.some(panel => !panel)) return;
  controls.setAttribute('role', 'tablist');
  controls.setAttribute('aria-orientation', 'horizontal');
  const selectStage = index => {
    tabs.forEach((tab, position) => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panels[position].id);
      tab.setAttribute('aria-selected', String(position === index));
      tab.tabIndex = position === index ? 0 : -1;
      panels[position].hidden = position !== index;
      panels[position].setAttribute('role', 'tabpanel');
      panels[position].setAttribute('aria-labelledby', tab.id);
      panels[position].tabIndex = 0;
    });
    panels[index].querySelectorAll('template.disclosure-image').forEach(template => {
      template.replaceWith(template.content.cloneNode(true));
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', event => { event.preventDefault(); selectStage(index); });
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else if (event.key === 'Enter' || event.key === ' ') next = index;
      else return;
      event.preventDefault();
      selectStage(next);
      tabs[next].focus();
    });
  });
  const initialStage = tabs.findIndex(tab => tab.getAttribute('href') === window.location?.hash);
  selectStage(initialStage >= 0 ? initialStage : 0);
});

Array.from(document.querySelectorAll('.blueprint-study')).forEach(widget => {
  const button = widget.querySelector('.blueprint-trigger');
  const marker = widget.querySelector('animateMotion');
  if (!button || !marker || typeof marker.beginElement !== 'function') return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const updateMotion = () => {
    widget.classList.remove('is-tracing');
    button.hidden = reducedMotion.matches;
  };
  button.addEventListener('click', () => {
    if (reducedMotion.matches) return;
    widget.classList.remove('is-tracing');
    void widget.offsetWidth;
    widget.classList.add('is-tracing');
    marker.beginElement();
  });
  reducedMotion.addEventListener('change', updateMotion);
  updateMotion();
});
