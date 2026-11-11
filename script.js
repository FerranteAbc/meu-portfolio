/* Portfólio de Pedro Henrique Ferrante Prado
   JavaScript mínimo e sem dependências: destaque do índice e botão de copiar e-mail. */
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
