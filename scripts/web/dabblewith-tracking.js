/*
 * dabblewith.ai web tracking
 *
 * - Persists UTM + intent params in sessionStorage on first hit.
 * - Appends persisted params to internal CTA links + the bot WhatsApp number.
 * - Emits named GA events for CTAs that declare data-event="<name>".
 * - Emits a separate lead_intent_click when a CTA opens WhatsApp or email for
 *   submission, signup, community-bot setup, session interest, or partner interest.
 * - Sends only safe metadata: page path, CTA id, audience segment, link host,
 *   workflow category, lead type, and source/medium/campaign/content/intent when present.
 *
 * Privacy rules (must hold):
 * - Never store or send phone numbers, message bodies, emails, tokens, or PII.
 * - Truncate link text to 80 chars; do not capture form field values.
 */
(function () {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  var STORAGE_KEY = 'dw_attribution_v1';
  var BOT_WA_HOST = 'wa.me';
  var BOT_WA_NUMBER = '919566112518';
  var SITE_HOSTS = ['dabblewith.ai', 'www.dabblewith.ai'];
  var TRACKED_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'intent'];
  var ALLOWED_EVENTS = {
    workflow_view: true,
    workflow_explore_click: true,
    workflow_submit_start: true,
    workflow_submit_complete: true,
    newsletter_signup_click: true,
    community_bot_setup_click: true,
    challenge_join_click: true,
    partner_interest_click: true,
    build_public_metrics_view: true,
    audience_segment_click: true,
    share_nudge_click: true,
    lead_intent_click: true
  };

  function safeText(value) {
    if (value == null) return '';
    return String(value).replace(/\s+/g, ' ').trim().slice(0, 80);
  }

  function readStored() {
    try {
      var raw = window.sessionStorage && window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  function writeStored(record) {
    try {
      if (window.sessionStorage) {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(record));
      }
    } catch (_) { /* ignore */ }
  }

  function captureAttribution() {
    var existing = readStored();
    var url;
    try { url = new URL(window.location.href); } catch (_) { return existing || {}; }
    var fresh = {};
    TRACKED_PARAMS.forEach(function (key) {
      var v = url.searchParams.get(key);
      if (v) fresh[key] = safeText(v);
    });
    if (Object.keys(fresh).length === 0) {
      return existing || {};
    }
    fresh.captured_at = new Date().toISOString();
    fresh.first_path = url.pathname;
    if (existing && existing.captured_at && !url.searchParams.get('utm_source')) {
      // Keep the earliest first-touch when only intent (or similar) is added later.
      ['captured_at', 'first_path'].forEach(function (k) { fresh[k] = existing[k]; });
    }
    writeStored(fresh);
    return fresh;
  }

  function isInternalUrl(href) {
    if (!href) return false;
    if (href.charAt(0) === '#') return false;
    if (href.charAt(0) === '/') return true;
    try {
      var u = new URL(href, window.location.href);
      if (SITE_HOSTS.indexOf(u.hostname) !== -1) return true;
      if (u.hostname === BOT_WA_HOST && u.pathname.indexOf('/' + BOT_WA_NUMBER) === 0) return true;
      return false;
    } catch (_) {
      return false;
    }
  }

  function decorateLink(link, attribution) {
    if (!link || !attribution) return;
    var href = link.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;
    if (link.dataset && link.dataset.dwDecorated === '1') return;
    if (!isInternalUrl(href)) return;
    try {
      var u = new URL(href, window.location.href);
      TRACKED_PARAMS.forEach(function (key) {
        if (attribution[key] && !u.searchParams.get(key)) {
          u.searchParams.set(key, attribution[key]);
        }
      });
      // For internal pages, keep relative-ish hrefs; for WA links keep absolute.
      var nextHref;
      if (SITE_HOSTS.indexOf(u.hostname) !== -1 || href.charAt(0) === '/') {
        nextHref = u.pathname + u.search + u.hash;
      } else {
        nextHref = u.toString();
      }
      link.setAttribute('href', nextHref);
      if (link.dataset) link.dataset.dwDecorated = '1';
    } catch (_) { /* ignore malformed urls */ }
  }

  function decorateAll(attribution) {
    if (!attribution || Object.keys(attribution).length === 0) return;
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) decorateLink(links[i], attribution);
  }

  function eventPayload(link, attribution) {
    var payload = {
      cta_id: safeText(link.getAttribute('data-cta') || link.id || ''),
      cta_label: safeText(link.textContent || ''),
      audience_segment: safeText(link.getAttribute('data-audience') || ''),
      workflow_category: safeText(link.getAttribute('data-workflow-category') || ''),
      link_host: '',
      page_path: location.pathname
    };
    try {
      var u = new URL(link.href || link.getAttribute('href') || '', window.location.href);
      payload.link_host = u.protocol === 'mailto:' ? 'email' : (u.hostname || '');
    } catch (_) { /* ignore */ }
    if (attribution) {
      if (attribution.utm_source) payload.source = attribution.utm_source;
      if (attribution.utm_medium) payload.medium = attribution.utm_medium;
      if (attribution.utm_campaign) payload.campaign = attribution.utm_campaign;
      if (attribution.utm_content) payload.content = attribution.utm_content;
      if (attribution.intent) payload.intent = attribution.intent;
    }
    return payload;
  }

  function namedEvent(eventName, link, attribution, extra) {
    if (typeof window.gtag !== 'function') return;
    if (!ALLOWED_EVENTS[eventName]) return;
    var payload = eventPayload(link, attribution);
    if (extra && typeof extra === 'object') {
      Object.keys(extra).forEach(function (key) {
        if (extra[key] != null) payload[key] = safeText(extra[key]);
      });
    }
    try { window.gtag('event', eventName, payload); } catch (_) { /* ignore */ }
  }

  function leadTypeFor(link, eventName) {
    var href = link.getAttribute('href') || '';
    var ctaId = link.getAttribute('data-cta') || '';
    var joined = safeText([eventName, ctaId, link.textContent || '', href].join(' ')).toLowerCase();
    var isLeadDestination = /^mailto:/i.test(href) || /wa\.me\/919566112518/i.test(href);
    if (!isLeadDestination) return '';
    if (/community[_ -]?bot|bot[_ -]?setup|launch/.test(joined)) return 'community_bot_setup';
    if (/submit|workflow_submit/.test(joined)) return 'workflow_submission';
    if (/newsletter|subscribe/.test(joined)) return 'newsletter_signup';
    if (/session|signal|interest/.test(joined)) return 'session_interest';
    if (/partner|issue[-_ ]?swap/.test(joined)) return 'partner_interest';
    return '';
  }

  function handleClick(event) {
    var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!link) return;
    var attribution = readStored() || {};
    decorateLink(link, attribution);
    var eventName = link.getAttribute('data-event');
    if (eventName) namedEvent(eventName, link, attribution);
    var leadType = leadTypeFor(link, eventName || '');
    if (leadType) {
      namedEvent('lead_intent_click', link, attribution, {
        lead_type: leadType,
        source_event: eventName || 'cta_click'
      });
    }
  }

  function init() {
    var attribution = captureAttribution();
    decorateAll(attribution);
    document.addEventListener('click', handleClick, true);
  }

  // Public surface for inline scripts that want to fire a named event.
  window.dabblewithTrack = {
    event: function (name, extra) {
      if (typeof window.gtag !== 'function' || !ALLOWED_EVENTS[name]) return;
      var attribution = readStored() || {};
      var payload = { page_path: location.pathname };
      if (extra && typeof extra === 'object') {
        Object.keys(extra).forEach(function (k) {
          if (extra[k] != null) payload[k] = safeText(extra[k]);
        });
      }
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'intent'].forEach(function (k) {
        var key = k === 'utm_source' ? 'source'
                : k === 'utm_medium' ? 'medium'
                : k === 'utm_campaign' ? 'campaign'
                : k === 'utm_content' ? 'content'
                : 'intent';
        if (attribution[k] && payload[key] == null) payload[key] = attribution[k];
      });
      try { window.gtag('event', name, payload); } catch (_) { /* ignore */ }
    },
    attribution: function () { return readStored() || {}; },
    decorate: function () { decorateAll(readStored() || {}); }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
