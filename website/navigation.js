const header = document.querySelector('.header');
const shell = header.querySelector('.nav-shell');
const trigger = document.querySelector('#nav-toggle');
const desktopContent = document.querySelector('#desktop-navigation');
const menu = document.querySelector('#mobile-menu');
const closeButton = menu.querySelector('.menu-close');
const desktop = matchMedia('(min-width: 801px) and (hover: hover) and (pointer: fine)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let introTimer, leaveTimer, menuAnimation, closingMenu;
let restoringFocus = false;
let menuScrollY = 0;

function unlockPage() {
  document.documentElement.classList.remove('menu-open');
  document.documentElement.style.removeProperty('--nav-scroll-top');
  window.scrollTo({ top: menuScrollY, behavior: 'instant' });
}

function stopIntro() { clearTimeout(introTimer); }
function focusTrigger() {
  restoringFocus = true;
  trigger.focus({ preventScroll: true });
  restoringFocus = false;
}
function setExpanded(expanded) {
  header.dataset.expanded = String(expanded);
  desktopContent.inert = !desktop.matches || !expanded;
  trigger.setAttribute('aria-expanded', String(expanded));
  trigger.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
  trigger.title = expanded ? 'Close navigation' : 'Open navigation';
}
function collapseDesktop(restoreFocus = false) {
  stopIntro();
  clearTimeout(leaveTimer);
  if (restoreFocus || desktopContent.contains(document.activeElement)) focusTrigger();
  setExpanded(false);
}
function animateMenu(opening) {
  menuAnimation?.cancel();
  if (reducedMotion.matches) return Promise.resolve();
  menuAnimation = menu.animate([
    { transform: `translateY(${opening ? '-102%' : '0'})`, borderRadius: opening ? '0 0 48px 48px' : '0' },
    { transform: `translateY(${opening ? '0' : '-102%'})`, borderRadius: opening ? '0' : '0 0 48px 48px' },
  ], { duration: opening ? 560 : 360, easing: 'cubic-bezier(.22,1,.36,1)' });
  return menuAnimation.finished.catch(() => {});
}
function openMenu() {
  if (menu.open || closingMenu) return;
  stopIntro();
  menuScrollY = scrollY;
  document.documentElement.style.setProperty('--nav-scroll-top', `${-menuScrollY}px`);
  document.documentElement.classList.add('menu-open');
  menu.showModal();
  setExpanded(true);
  menu.dataset.visible = '';
  animateMenu(true);
}
async function closeMenu(restoreFocus = true) {
  if (closingMenu) return closingMenu;
  if (!menu.open) return;
  menu.removeAttribute('data-visible');
  closingMenu = (async () => {
    await animateMenu(false);
    menu.close();
    unlockPage();
    setExpanded(false);
    if (restoreFocus) focusTrigger();
  })();
  await closingMenu;
  closingMenu = null;
}
function configureNavigation(intro = false) {
  stopIntro();
  clearTimeout(leaveTimer);
  if (menu.open) {
    menuAnimation?.cancel();
    menu.close();
    menu.removeAttribute('data-visible');
    unlockPage();
    focusTrigger();
  }
  trigger.setAttribute('aria-controls', desktop.matches ? 'desktop-navigation' : 'mobile-menu');
  if (desktop.matches) trigger.removeAttribute('aria-haspopup');
  else trigger.setAttribute('aria-haspopup', 'dialog');
  const reveal = intro && desktop.matches && !reducedMotion.matches;
  setExpanded(reveal);
  if (reveal) introTimer = setTimeout(() => {
    if (!shell.matches(':hover') && !shell.contains(document.activeElement)) collapseDesktop();
  }, 1200);
}

trigger.hidden = false;
header.dataset.navReady = '';
configureNavigation(true);
desktop.addEventListener('change', () => configureNavigation());
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
    stopIntro();
    menuAnimation?.finish();
    if (!menu.open) collapseDesktop();
  }
});
trigger.addEventListener('click', () => {
  stopIntro();
  if (!desktop.matches) return openMenu();
  if (header.dataset.expanded === 'true') collapseDesktop(true);
  else setExpanded(true);
});
shell.addEventListener('pointerenter', event => {
  if (!desktop.matches || event.pointerType === 'touch') return;
  stopIntro();
  clearTimeout(leaveTimer);
  setExpanded(true);
});
shell.addEventListener('pointerleave', () => {
  if (!desktop.matches) return;
  leaveTimer = setTimeout(() => {
    const active = document.activeElement;
    if (!(shell.contains(active) && active.matches(':focus-visible'))) collapseDesktop();
  }, 180);
});
shell.addEventListener('focusin', event => {
  if (desktop.matches && !restoringFocus && event.target.matches(':focus-visible')) {
    stopIntro();
    clearTimeout(leaveTimer);
    setExpanded(true);
  }
});
shell.addEventListener('focusout', () => {
  requestAnimationFrame(() => {
    if (desktop.matches && !shell.contains(document.activeElement) && !shell.matches(':hover')) collapseDesktop();
  });
});
header.addEventListener('keydown', event => {
  if (event.key === 'Escape' && desktop.matches) {
    event.preventDefault();
    collapseDesktop(true);
  }
});
closeButton.addEventListener('click', () => closeMenu());
menu.addEventListener('cancel', event => { event.preventDefault(); closeMenu(); });
menu.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const controls = [...menu.querySelectorAll('a[href],button:not([disabled])')].filter(element => element.getClientRects().length);
  const destination = event.shiftKey && document.activeElement === controls[0] ? controls.at(-1)
    : !event.shiftKey && document.activeElement === controls.at(-1) ? controls[0] : null;
  if (destination) { event.preventDefault(); destination.focus(); }
});

// Finish the curtain before moving to a section, then hand keyboard focus to that section.
async function navigate(event) {
  const link = event.target.closest('a');
  if (!link) return;
  const href = link.getAttribute('href');
  if (!href.startsWith('#') || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const target = document.querySelector(href === '#' ? '#main' : href);
  if (!target) return;
  event.preventDefault();
  if (menu.open) await closeMenu(false);
  else collapseDesktop();
  history.pushState(null, '', href);
  const hadTabIndex = target.hasAttribute('tabindex');
  if (!hadTabIndex) {
    target.tabIndex = -1;
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
  }
  target.focus({ preventScroll: true });
  target.scrollIntoView({ block: 'start', behavior: reducedMotion.matches ? 'instant' : 'smooth' });
}
desktopContent.addEventListener('click', navigate);
menu.addEventListener('click', navigate);
