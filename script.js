/* Portfólio de Pedro Henrique Ferrante Prado
   JavaScript mínimo e sem dependências: destaque do índice, progresso de leitura,
   entrada dos blocos ao rolar e botão de copiar e-mail. */
(function () {
  "use strict";

  /* --- Destaque da seção atual no índice --- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var sections = links
    .map(function (link) {
      return document.getElementById(link.getAttribute("href").slice(1));
    })
    .filter(Boolean);

  function setCurrent(id) {
    links.forEach(function (link) {
      if (link.getAttribute("href") === "#" + id) {
        link.setAttribute("aria-current", "true");
        // Na barra horizontal (telas pequenas), mantém o link ativo visível.
        var list = link.closest("ul");
        if (list && list.scrollWidth > list.clientWidth) {
          list.scrollTo({ left: link.offsetLeft - 16, behavior: "smooth" });
        }
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  // No fim da página, a última seção (Contato) é curta demais para cruzar a faixa de leitura.
  function atBottom() {
    return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  }

  if ("IntersectionObserver" in window && sections.length) {
    var visible = {};
    var last = sections[sections.length - 1];

    var update = function () {
      if (atBottom()) {
        setCurrent(last.id);
        return;
      }
      // A primeira seção (em ordem de página) que está na faixa de leitura vira a atual.
      for (var i = 0; i < sections.length; i++) {
        if (visible[sections[i].id]) {
          setCurrent(sections[i].id);
          return;
        }
      }
    };

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          visible[entry.target.id] = entry.isIntersecting;
        });
        update();
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 }
    );
    sections.forEach(function (section) { observer.observe(section); });
    window.addEventListener("scroll", update, { passive: true });
    setCurrent(sections[0].id);
  }

  /* --- Movimento ao rolar ---
     O progresso de leitura vale para todos. A entrada dos blocos só roda se o navegador
     aceita IntersectionObserver e a pessoa não pediu movimento reduzido. Sem isso, a
     página fica completa e parada: nenhum conteúdo depende desta parte para aparecer. */
  var root = document.documentElement;
  var reduceMotion = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  var pending = []; // elementos ainda escondidos, à espera de entrar na tela
  var counters = []; // números que sobem ao entrar na tela (nota CVSS e indicadores)
  var io = null;
  var queued = 0;

  var RISE = [
    ".ficha__row", ".section__intro", ".duty", ".subhead", ".note",
    ".case h3", ".case__meta", ".case .measure", ".case h4", ".finding", ".phases li",
    ".case .plain", ".case .code", ".case__link", ".project",
    ".matrix tbody tr", ".job", ".degree", ".ledger li", ".contact__mail", ".contact .actions"
  ].join(",");

  function paint() {
    queued = 0;
    var max = root.scrollHeight - window.innerHeight;
    var read = max > 0 ? window.scrollY / max : 0;
    root.style.setProperty("--read", Math.min(1, Math.max(0, read)).toFixed(4));
    if (atBottom()) { flushVisible(); }
  }

  function onScroll() {
    if (!queued) { queued = window.requestAnimationFrame(paint); }
  }

  /* Números: o texto final fica no HTML (e numa cópia só para leitores de tela); o script
     troca o que aparece na tela por uma contagem. */
  function prepare(node, score, duration) {
    var target = node.textContent.trim();
    var dot = target.replace(",", ".").indexOf(".");
    var spoken = document.createElement("span");
    var shown = document.createElement("span");
    spoken.className = "sr-only";
    spoken.textContent = target;
    shown.setAttribute("aria-hidden", "true");
    shown.textContent = (0).toFixed(dot === -1 ? 0 : target.length - dot - 1);
    node.textContent = "";
    node.appendChild(spoken);
    node.appendChild(shown);
    node.setAttribute("data-n", String(counters.length));
    counters.push({
      node: node,
      shown: shown,
      target: target,
      value: parseFloat(target.replace(",", ".")),
      decimals: dot === -1 ? 0 : target.length - dot - 1,
      score: score,
      duration: duration,
      done: false
    });
  }

  // Ao terminar, o HTML volta a ser só o número final (sem a cópia para leitores de tela).
  function finish(item) {
    item.done = true;
    item.node.textContent = item.target;
    if (item.score) { item.score.style.setProperty("--p", "1"); }
  }

  function count(item, delay) {
    window.setTimeout(function () {
      if (item.done) { return; }
      var start = null;
      var tick = function (now) {
        if (item.done) { return; }
        if (start === null) { start = now; }
        var t = Math.min(1, (now - start) / item.duration);
        var eased = 1 - Math.pow(1 - t, 4);
        item.shown.textContent = (item.value * eased).toFixed(item.decimals);
        if (item.score) { item.score.style.setProperty("--p", eased.toFixed(4)); }
        if (t < 1) { window.requestAnimationFrame(tick); } else { finish(item); }
      };
      window.requestAnimationFrame(tick);
    }, delay);
  }

  function finishAll() {
    counters.forEach(finish);
  }

  function reveal(el, instant, delay) {
    el.classList.add("is-in");
    if (instant) { el.classList.add("is-done"); }
    Array.prototype.forEach.call(el.querySelectorAll("[data-n]"), function (node) {
      var item = counters[Number(node.getAttribute("data-n"))];
      if (instant) { finish(item); } else { count(item, delay); }
    });
    var at = pending.indexOf(el);
    if (at !== -1) { pending.splice(at, 1); }
    if (io) { io.unobserve(el); }
  }

  // Chegou ao fim da página: o que está na tela e ainda não entrou (a faixa de -10% não alcança).
  function flushVisible() {
    pending.slice().forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) { reveal(el, false, 150); }
    });
  }

  function onIntersect(entries) {
    var entering = entries
      .filter(function (entry) { return entry.isIntersecting; })
      .sort(function (a, b) {
        return (a.boundingClientRect.top - b.boundingClientRect.top) || (a.boundingClientRect.left - b.boundingClientRect.left);
      });
    // Quem entra junto sobe em sequência, com no máximo 5 passos de atraso.
    entering.forEach(function (entry, i) {
      var step = Math.min(i, 5) * 70;
      var el = entry.target;
      el.style.setProperty("--d", step + "ms");
      // No carregamento, os indicadores do resumo esperam o texto terminar de subir.
      var wait = el.classList.contains("stats") && window.performance && performance.now() < 1500 ? 700 : 250;
      reveal(el, false, step + wait);
    });
    // Elementos acima da tela (link direto, rolagem rápida) aparecem prontos, sem animar.
    entries.forEach(function (entry) {
      if (!entry.isIntersecting && entry.boundingClientRect.top < 0) { reveal(entry.target, true, 0); }
    });
  }

  function setupReveal() {
    if (reduceMotion.matches || !("IntersectionObserver" in window)) { return; }

    var marked = [];
    var mark = function (selector, cls) {
      Array.prototype.forEach.call(document.querySelectorAll(selector), function (el) {
        if (marked.indexOf(el) === -1) {
          el.classList.add(cls);
          marked.push(el);
        }
      });
    };
    mark(".section h2", "rv-head");
    mark(".section", "rv-line");
    mark(RISE, "rv");
    mark(".path, .attack, .stats", "rv-group");

    // Ordem das animações dentro de cada grupo
    Array.prototype.forEach.call(document.querySelectorAll(".path li"), function (li, i) {
      li.style.setProperty("--i", String(i));
    });
    var lit = 0;
    Array.prototype.forEach.call(document.querySelectorAll(".attack li.is-covered"), function (li) {
      li.style.setProperty("--i", String(lit));
      lit += 1;
    });

    Array.prototype.forEach.call(document.querySelectorAll(".score__num"), function (node) {
      prepare(node, node.closest(".score"), 1100);
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-count]"), function (node) {
      prepare(node, null, 1400);
    });

    try {
      io = new IntersectionObserver(onIntersect, { rootMargin: "0px 0px -10% 0px", threshold: 0 });
    } catch (e) {
      finishAll();
      return;
    }
    root.classList.add("reveal-ready");
    marked.forEach(function (el) {
      pending.push(el);
      io.observe(el);
    });
  }

  setupReveal();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  paint();

  // Se a pessoa ligar "reduzir movimento" com a página aberta, tudo aparece de uma vez.
  var onMotionChange = function () {
    if (!reduceMotion.matches) { return; }
    root.classList.remove("reveal-ready");
    finishAll();
  };
  if (reduceMotion.addEventListener) { reduceMotion.addEventListener("change", onMotionChange); }
  // Na impressão, os números aparecem completos.
  window.addEventListener("beforeprint", finishAll);

  /* --- Copiar e-mail --- */
  var button = document.getElementById("copy-email");
  var status = document.getElementById("copy-status");

  function announce(message) {
    if (status) { status.textContent = message; }
    if (button) {
      var original = button.getAttribute("data-label") || button.textContent;
      button.setAttribute("data-label", original);
      button.textContent = message;
      window.setTimeout(function () { button.textContent = original; }, 2000);
    }
  }

  function fallbackCopy(text) {
    var field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.className = "sr-only";
    document.body.appendChild(field);
    field.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(field);
    return ok;
  }

  if (button) {
    button.addEventListener("click", function () {
      var email = button.getAttribute("data-email");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(
          function () { announce("E-mail copiado"); },
          function () { announce(fallbackCopy(email) ? "E-mail copiado" : "Copie manualmente: " + email); }
        );
      } else {
        announce(fallbackCopy(email) ? "E-mail copiado" : "Copie manualmente: " + email);
      }
    });
  }
})();
