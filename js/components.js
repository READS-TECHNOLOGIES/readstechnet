/**
 * READS Technologies — Shared Web Components
 * reads-nav   : site-wide header + navigation
 * reads-footer: site-wide footer
 *
 * Usage in any page:
 *   <reads-nav></reads-nav>
 *   <reads-footer></reads-footer>
 *
 * Active link is auto-detected from window.location.pathname.
 * Theme preference is read/written via localStorage.
 * Blog pages pass a depth attribute for asset paths:
 *   <reads-nav depth="1"></reads-nav>  (one folder deep)
 */

/* ─────────────────────────────────────────
   NAV COMPONENT
───────────────────────────────────────── */
class ReadsNav extends HTMLElement {
  connectedCallback() {
    /* depth="1" means the page is one folder deep (e.g. /blog/) */
    const depth  = parseInt(this.getAttribute('depth') || '0', 10);
    const root   = depth > 0 ? '../'.repeat(depth) : '';
    const prefix = depth > 0 ? '../'.repeat(depth) : '';

    /* Build nav links — add new pages HERE only */
    const links = [
      { href: `${prefix}index.html`,          label: 'Home' },
      { href: `${prefix}about.html`,          label: 'About' },
      { href: `${prefix}features.html`,       label: 'Features' },
      { href: `${prefix}team.html`,           label: 'Team' },
      { href: `${prefix}token.html`,          label: 'Token' },
      { href: `${prefix}tokenomics.html`,     label: 'Tokenomics' },
      { href: `${prefix}whitepaper.html`,     label: 'Whitepaper' },
      { href: `${prefix}blog.html`,           label: 'Blog' },
      { href: `${prefix}partner.html`,        label: 'Partners' },
      { href: `${prefix}contact.html`,        label: 'Contact' },
    ];

    const liHTML = links.map(l =>
      `<li><a href="${l.href}"${l.cta ? ' class="nav-cta-link"' : ''}>${l.label}</a></li>`
    ).join('\n        ');

    this.innerHTML = `
<header>
  <nav class="navbar">
    <div class="menu-toggle" id="readsMenuToggle">
      <span></span><span></span><span></span>
    </div>
    <a href="${prefix}index.html">
      <img src="${prefix}assets/reads-logo.png" alt="$READS Logo" class="logo"/>
    </a>
    <div class="theme-switch-wrapper">
      <label class="theme-switch" for="readsThemeToggle">
        <input type="checkbox" id="readsThemeToggle"/>
        <div class="slider round"></div>
      </label>
    </div>
    <ul class="nav-links" id="readsNavLinks">
      ${liHTML}
    </ul>
  </nav>
</header>`;

    this._init();
  }

  _init() {
    /* ── Active link detection ── */
    const page = window.location.pathname.split('/').pop() || 'index.html';
    this.querySelectorAll('.nav-links a').forEach(a => {
      const href = a.getAttribute('href').split('/').pop();
      if (href === page || (page === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });

    /* ── Theme ── */
    const toggle = this.querySelector('#readsThemeToggle');
    const html   = document.documentElement;

    const applyTheme = theme => {
      html.setAttribute('data-theme', theme);
      if (toggle) toggle.checked = (theme === 'dark');
    };

    const saved = localStorage.getItem('reads-theme');
    if (saved) {
      applyTheme(saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      applyTheme('dark');
    } else {
      applyTheme('light');
    }

    if (toggle) {
      toggle.addEventListener('change', () => {
        const t = toggle.checked ? 'dark' : 'light';
        applyTheme(t);
        localStorage.setItem('reads-theme', t);
      });
    }

    /* ── Mobile hamburger ── */
    const btn   = this.querySelector('#readsMenuToggle');
    const links = this.querySelector('#readsNavLinks');

    if (btn && links) {
      btn.addEventListener('click', () => {
        links.classList.toggle('active');
        btn.classList.toggle('active');
      });
      links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          links.classList.remove('active');
          btn.classList.remove('active');
        });
      });
    }
  }
}

/* ─────────────────────────────────────────
   FOOTER COMPONENT
───────────────────────────────────────── */
class ReadsFooter extends HTMLElement {
  connectedCallback() {
    const depth  = parseInt(this.getAttribute('depth') || '0', 10);
    const prefix = depth > 0 ? '../'.repeat(depth) : '';

    this.innerHTML = `
<footer>
  <div class="footer-container">

    <div class="footer-section">
      <img src="${prefix}assets/reads-logo.png" alt="$READS Logo" class="footer-logo"/>
      <p class="footer-brand-slogan">Empowering You To Study Smart.<br/>Learn. Earn. Excel.</p>
      <div class="footer-social-links">
        <a href="https://x.com/READS_TECH_NET?s=09" target="_blank" rel="noopener">
          <img src="${prefix}assets/twitter-icon.png" alt="X / Twitter"/>
        </a>
        <a href="https://t.me/readstoken" target="_blank" rel="noopener">
          <img src="${prefix}assets/telegram-icon.png" alt="Telegram"/>
        </a>
        <a href="https://www.linkedin.com/in/reads-technologies-39a947377" target="_blank" rel="noopener">
          <img src="${prefix}assets/linkedin-icon.png" alt="LinkedIn"/>
        </a>
      </div>
    </div>

    <div class="footer-section">
      <h4>Platform</h4>
      <ul>
        <li><a href="${prefix}index.html">Home</a></li>
        <li><a href="${prefix}about.html">About Us</a></li>
        <li><a href="${prefix}features.html">Features</a></li>
        <li><a href="${prefix}team.html">Team</a></li>
        <li><a href="${prefix}blog.html">Blog</a></li>
        <li><a href="${prefix}partner.html">Partnerships</a></li>
      </ul>
    </div>

    <div class="footer-section">
      <h4>Token</h4>
      <ul>
        <li><a href="${prefix}token.html">Token</a></li>
        <li><a href="${prefix}tokenomics.html">Tokenomics</a></li>
        <li><a href="${prefix}whitepaper.html">Whitepaper</a></li>
        <li><a href="${prefix}presale.html">Presale</a></li>
      </ul>
    </div>

    <div class="footer-section">
      <h4>Legal</h4>
      <ul>
        <li><a href="${prefix}privacy-policy.html">Privacy Policy</a></li>
        <li><a href="${prefix}terms-of-service.html">Terms of Service</a></li>
        <li><a href="${prefix}disclaimer.html">Disclaimer</a></li>
      </ul>
    </div>

    <div class="footer-section">
      <h4>Support</h4>
      <ul>
        <li><a href="${prefix}faq.html">FAQ</a></li>
        <li><a href="${prefix}contact.html">Contact Us</a></li>
      </ul>
    </div>

  </div>
  <div class="footer-bottom">
    <p>© 2026 $READS Technologies. All rights reserved. | Not financial advice. Crypto investments carry risk.</p>
  </div>
</footer>`;
  }
}

/* ─────────────────────────────────────────
   REGISTER
───────────────────────────────────────── */
customElements.define('reads-nav',    ReadsNav);
customElements.define('reads-footer', ReadsFooter);
