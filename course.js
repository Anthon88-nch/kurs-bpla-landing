(() => {
  const METRIKA_ID = 112543150;
  const CONSENT_COOKIE = 'bpla_course_analytics';
  const CONSENT_MAX_AGE = 7 * 24 * 60 * 60;

  const menuButton = document.querySelector('.menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');
  const cookieNotice = document.querySelector('.cookie-notice');
  const cookieAccept = document.querySelector('[data-cookie-accept]');
  const cookieDecline = document.querySelector('[data-cookie-decline]');

  const readCookie = (name) => {
    const prefix = `${name}=`;
    const item = document.cookie
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(prefix));
    return item ? decodeURIComponent(item.slice(prefix.length)) : '';
  };

  let analyticsConsent = readCookie(CONSENT_COOKIE);
  let metrikaLoaded = false;

  const loadMetrika = () => {
    if (metrikaLoaded || analyticsConsent !== 'granted') return;
    metrikaLoaded = true;

    window.ym = window.ym || function () {
      (window.ym.a = window.ym.a || []).push(arguments);
    };
    window.ym.l = window.ym.l || Date.now();

    const tagUrl = `https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_ID}`;
    if (!document.querySelector(`script[src="${tagUrl}"]`)) {
      const script = document.createElement('script');
      script.async = true;
      script.src = tagUrl;
      document.head.append(script);
    }

    window.ym(METRIKA_ID, 'init', {
      ssr: true,
      webvisor: true,
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      referrer: document.referrer,
      url: location.href
    });
  };

  const saveConsent = (value) => {
    analyticsConsent = value;
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(value)}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
    if (value === 'granted') loadMetrika();
    if (cookieNotice) cookieNotice.hidden = true;
  };

  const reachGoal = (goal) => {
    if (analyticsConsent !== 'granted') return;
    loadMetrika();
    window.ym?.(METRIKA_ID, 'reachGoal', goal);
  };

  if (analyticsConsent === 'granted') loadMetrika();
  if (cookieNotice) cookieNotice.hidden = analyticsConsent === 'granted' || analyticsConsent === 'denied';
  cookieAccept?.addEventListener('click', () => saveConsent('granted'));
  cookieDecline?.addEventListener('click', () => saveConsent('denied'));

  const closeMenu = () => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Открыть меню');
    mobileMenu.hidden = true;
    document.body.classList.remove('menu-open');
  };

  menuButton?.addEventListener('click', () => {
    if (!mobileMenu) return;
    const opening = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(opening));
    menuButton.setAttribute('aria-label', opening ? 'Закрыть меню' : 'Открыть меню');
    mobileMenu.hidden = !opening;
    document.body.classList.toggle('menu-open', opening);
  });

  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1050) closeMenu();
  });

  document.querySelectorAll('[data-goal]').forEach((link) => {
    link.addEventListener('click', () => reachGoal(link.dataset.goal));
  });

  document.querySelectorAll('.faq-list details').forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open && item.dataset.goalSent !== 'true') {
        item.dataset.goalSent = 'true';
        reachGoal('course_faq_open');
      }
    });
  });
})();
