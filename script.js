(function () {
  "use strict";

  /** May 2, 2026 at midnight (local time) */
  var WEDDING_TARGET = new Date(2026, 4, 2, 0, 0, 0, 0);

  /**
   * Optional: set to a YouTube embed URL, e.g. "https://www.youtube.com/embed/VIDEO_ID"
   * Leave empty to keep the elegant placeholder in the video section.
   */
  var VIDEO_EMBED_URL = "";

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tickCountdown() {
    var now = Date.now();
    var diff = WEDDING_TARGET.getTime() - now;

    var elDays = document.getElementById("cdDays");
    var elHours = document.getElementById("cdHours");
    var elMinutes = document.getElementById("cdMinutes");
    var elSeconds = document.getElementById("cdSeconds");
    if (!elDays || !elHours || !elMinutes || !elSeconds) return;

    if (diff <= 0) {
      elDays.textContent = "00";
      elHours.textContent = "00";
      elMinutes.textContent = "00";
      elSeconds.textContent = "00";
      return;
    }

    var s = Math.floor(diff / 1000);
    var days = Math.floor(s / 86400);
    s -= days * 86400;
    var hours = Math.floor(s / 3600);
    s -= hours * 3600;
    var minutes = Math.floor(s / 60);
    var seconds = s - minutes * 60;

    elDays.textContent = pad(Math.min(days, 9999));
    elHours.textContent = pad(hours);
    elMinutes.textContent = pad(minutes);
    elSeconds.textContent = pad(seconds);
  }

  function openGate() {
    var gate = document.getElementById("gate");
    var main = document.getElementById("mainContent");
    if (!gate || !main) return;

    gate.classList.add("is-hidden");
    gate.setAttribute("aria-hidden", "true");
    main.hidden = false;
    document.body.classList.add("gate-open");

    window.setTimeout(function () {
      main.focus();
    }, 100);

    if (window.sessionStorage) {
      try {
        sessionStorage.setItem("weddingGateOpen", "1");
      } catch (e) {
        /* ignore */
      }
    }
  }

  function initGate() {
    var gate = document.getElementById("gate");
    var main = document.getElementById("mainContent");
    if (!gate || !main) return;

    var skip =
      window.sessionStorage &&
      (function () {
        try {
          return sessionStorage.getItem("weddingGateOpen") === "1";
        } catch (e) {
          return false;
        }
      })();

    if (skip) {
      gate.classList.add("is-hidden");
      gate.setAttribute("aria-hidden", "true");
      main.hidden = false;
      document.body.classList.add("gate-open");
    }

    gate.addEventListener("click", openGate);
    gate.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openGate();
      }
    });
  }

  function initReveal() {
    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var nodes = document.querySelectorAll(".reveal");
    if (prefersReduced) {
      nodes.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    nodes.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initVideo() {
    if (!VIDEO_EMBED_URL || !String(VIDEO_EMBED_URL).trim()) return;

    var host = document.getElementById("videoHost");
    if (!host) return;

    host.classList.remove("video-frame__ratio--placeholder");
    host.innerHTML = "";
    var iframe = document.createElement("iframe");
    iframe.title = "Sara and Mohamed — wedding video";
    iframe.src = String(VIDEO_EMBED_URL).trim();
    iframe.setAttribute(
      "allow",
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    );
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute("loading", "lazy");
    host.appendChild(iframe);
  }

  function initRsvp() {
    var form = document.getElementById("rsvpForm");
    var status = document.getElementById("formStatus");
    if (!form || !status) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = (document.getElementById("guestName") || {}).value;
      var email = (document.getElementById("guestEmail") || {}).value;
      var guests = (document.getElementById("guests") || {}).value;
      var attendance = (document.getElementById("attendance") || {}).value;

      if (!name || !String(name).trim()) {
        status.textContent = "Please enter your name.";
        return;
      }
      if (!email || !String(email).trim()) {
        status.textContent = "Please enter your email.";
        return;
      }
      if (!attendance) {
        status.textContent = "Please let us know if you can attend.";
        return;
      }

      status.textContent =
        "Thank you, " +
        String(name).trim() +
        ". Your RSVP has been noted (" +
        guests +
        " guest(s), " +
        (attendance === "yes" ? "attending" : "not attending") +
        ").";

      form.reset();
      var guestsInput = document.getElementById("guests");
      if (guestsInput) guestsInput.value = "1";
    });
  }

  function init() {
    initGate();
    initVideo();
    tickCountdown();
    window.setInterval(tickCountdown, 1000);
    initReveal();
    initRsvp();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
