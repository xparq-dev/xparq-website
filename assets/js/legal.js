(function () {
  var params = new URLSearchParams(window.location.search);
  var lang = params.get("lang");
  if (lang !== "th") return;

  var thPath = window.location.pathname.replace(/\.html$/, ".th.html");
  if (thPath.endsWith(".th.th.html")) return;
  window.location.replace(thPath + window.location.hash);
})();
