var App = function () {
  // Tooltip
  var _componentTooltip = function () {

    // Initialize
    $('[data-popup="tooltip"]').tooltip();

    // Demo tooltips, remove in production
    var demoTooltipSelector = '[data-popup="tooltip-demo"]';
    if ($(demoTooltipSelector).is(':visible')) {
      $(demoTooltipSelector).tooltip('show');
      setTimeout(function () {
        $(demoTooltipSelector).tooltip('hide');
      }, 2000);
    }
  };

  return {
    initCore: function () {
      _componentTooltip();
    }
  }
}();

// When page is fully loaded
window.addEventListener('load', function() {
  $(function () {
    setTimeout(() => App.initCore(), 2e3);
  });
});