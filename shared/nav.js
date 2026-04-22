(function () {
  var root = document.getElementById('header-root');
  if (!root) return;

  var activeTab = root.getAttribute('data-active') || 'blog';
  var DASHES = '--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------';

  var tabs = [
    { id: 'cli',       label: 'CLI',       href: '/cli' },
    { id: 'portfolio', label: 'Companies', href: '/companies' },
    { id: 'blog',      label: 'Blog',      href: '/blog' },
    { id: 'team',      label: 'Team',      href: '/team' },
    { id: 'about',     label: 'About',     href: '/about' },
  ];

  /* Inject CSS */
  if (!document.getElementById('shared-header-style')) {
    var s = document.createElement('style');
    s.id = 'shared-header-style';
    s.textContent =
      '.shared-rrw{position:fixed;top:20px;right:20px;z-index:1000;border-radius:1rem;cursor:pointer;transition:transform 0.2s ease;}' +
      '.shared-rrw:hover{transform:scale(1.05);}' +
      '.shared-rrw img{width:220px;height:auto;}' +
      '.shared-logo{font-size:14px;}' +
      '.shared-logo p{margin:0;padding:0;line-height:0;}' +
      '.shared-logo a{display:block;text-decoration:none;}' +
      '.shared-nav-container{margin-top:1.5rem;margin-bottom:2rem;padding-bottom:0.5rem;position:relative;}' +
      '.shared-nav-container::after{content:"' + DASHES + '";position:absolute;bottom:0;left:-12px;right:-12px;width:calc(100vw + 24px);white-space:nowrap;overflow:hidden;color:rgba(200,208,242,0.3);pointer-events:none;line-height:1;font-size:inherit;}' +
      '.shared-nav{display:inline-flex;flex-direction:row;gap:2rem;align-items:center;padding-bottom:16px;padding-left:18px;padding-right:2ch;}' +
      '.shared-nav-item{color:rgba(200,208,242,0.35);text-decoration:none;cursor:default;transition:color 0.25s ease;user-select:none;}' +
      'a.shared-nav-item{cursor:pointer;}' +
      '.shared-nav-item:hover{color:rgba(200,208,242,0.6);}' +
      '.shared-nav-item.active{color:#c8d0f2;}' +
      '#shared-tab-indicator{position:absolute;bottom:0;height:1em;line-height:1;overflow:hidden;white-space:nowrap;color:#c8d0f2;font-size:inherit;font-family:inherit;pointer-events:none;z-index:1;}' +
      '#shared-tab-indicator::after{content:"' + DASHES + '";position:absolute;left:0;top:0;}';
    document.head.appendChild(s);
  }

  /* Inject RRW button into body before .container */
  if (!document.querySelector('.shared-rrw')) {
    var rrw = document.createElement('a');
    rrw.href = 'https://www.redriverwest.com';
    rrw.className = 'shared-rrw';
    rrw.innerHTML = '<img src="/ButtonWebSitev2.png" alt="Part of Red River West" />';
    var container = document.querySelector('.container');
    if (container && container.parentNode) {
      container.parentNode.insertBefore(rrw, container);
    } else {
      document.body.insertBefore(rrw, document.body.firstChild);
    }
  }

  /* Build tab items */
  var tabsHtml = tabs.map(function (t) {
    var isActive = t.id === activeTab;
    var cls = 'shared-nav-item' + (isActive ? ' active' : '');
    if (isActive) {
      return '<span class="' + cls + '" id="shared-tab-' + t.id + '">' + t.label + '</span>';
    }
    return '<a href="' + t.href + '" class="' + cls + '" id="shared-tab-' + t.id + '">' + t.label + '</a>';
  }).join('');

  /* Render logo + nav */
  root.innerHTML =
    '<div class="shared-logo">' +
      '<a href="/">' +
        '<p>' +
          '<span class="red" style="display:inline-block;font-family:monospace;line-height:1.2;">' +
            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_&nbsp;_&nbsp;&nbsp;<br>' +
            '&nbsp;__&nbsp;&nbsp;___&nbsp;___&nbsp;&nbsp;_&nbsp;__&nbsp;___&nbsp;&nbsp;_&nbsp;__&nbsp;___&nbsp;&#40;_&#41;&nbsp;&#124;_&nbsp;<br>' +
            '&nbsp;&#92;&nbsp;&#92;&#47;&nbsp;__&#47;&nbsp;_&nbsp;&#92;&#124;&nbsp;&#39;_&nbsp;&#96;&nbsp;_&nbsp;&#92;&#124;&nbsp;&#39;_&nbsp;&#96;&nbsp;_&nbsp;&#92;&#124;&nbsp;&#124;&nbsp;&nbsp;_&#124;<br>' +
            '&nbsp;&#47;&nbsp;&#47;&nbsp;&#40;_&#124;&nbsp;&#40;_&#41;&nbsp;&#124;&nbsp;&#124;&nbsp;&#124;&nbsp;&#124;&nbsp;&#124;&nbsp;&#124;&nbsp;&#124;&nbsp;&#124;&nbsp;&#124;&nbsp;&#124;&nbsp;&#124;&nbsp;&#124;&nbsp;&#124;_&nbsp;<br>' +
            '&#47;_&#47;&nbsp;&#92;___&#92;___&#47;&#124;_&#124;&nbsp;&#124;_&#124;&nbsp;&#124;_&#124;_&#124;&nbsp;&#124;_&#124;&nbsp;&#124;_&#124;_&#124;&#92;__&#124;' +
          '</span>' +
        '</p>' +
      '</a>' +
    '</div>' +
    '<div class="shared-nav-container">' +
      '<div class="shared-nav">' + tabsHtml + '</div>' +
      '<div id="shared-tab-indicator"></div>' +
    '</div>';

  /* Position indicator under active tab */
  requestAnimationFrame(function () {
    var indicator = document.getElementById('shared-tab-indicator');
    var activeEl = document.getElementById('shared-tab-' + activeTab);
    var navContainer = root.querySelector('.shared-nav-container');
    if (!indicator || !activeEl || !navContainer) return;
    var containerRect = navContainer.getBoundingClientRect();
    var elRect = activeEl.getBoundingClientRect();
    indicator.style.left = (elRect.left - containerRect.left) + 'px';
    indicator.style.width = elRect.width + 'px';
  });
})();
