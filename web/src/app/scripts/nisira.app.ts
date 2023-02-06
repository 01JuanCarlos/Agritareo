
import * as $ from 'jquery';
// FIXME: mover de directorio a librerias/clases
export class NisiraApp {
  _transitionsDisabled() {
    $('body').addClass('no-transitions');
  }

  // Enable all transitions
  _transitionsEnabled() {
    $('body').removeClass('no-transitions');
  }

  // Resize main sidebar
  _sidebarMainResize() {

    // Flip 2nd level if menu overflows
    // bottom edge of browser window
    const revertBottomMenus = () => {
      // tslint:disable-next-line: deprecation
      $('.sidebar-main').find('.nav-sidebar').children('.nav-item-submenu').hover(function() {
        let totalHeight = 0;
        const $this = $(this);
        const navSubmenuClass = 'nav-group-sub';
        const navSubmenuReversedClass = 'nav-item-submenu-reversed';

        totalHeight += $this.find('.' + navSubmenuClass).filter(':visible').outerHeight();
        if ($this.children('.' + navSubmenuClass).length) {
          // tslint:disable-next-line:max-line-length
          if (($this.children('.' + navSubmenuClass).offset().top + $this.find('.' + navSubmenuClass).filter(':visible').outerHeight()) > document.body.clientHeight) {
            $this.addClass(navSubmenuReversedClass);
          } else {
            $this.removeClass(navSubmenuReversedClass);
          }
        }
      });
    };

    // If sidebar is resized by default
    if ($('body').hasClass('sidebar-xs')) {
      revertBottomMenus();
    }

    // Toggle min sidebar class
    $('.sidebar-main-toggle').on('click', e => {
      e.preventDefault();

      $('body').toggleClass('sidebar-xs').removeClass('sidebar-mobile-main');
      revertBottomMenus();
    });
  }

  // Toggle main sidebar
  _sidebarMainToggle() {
    $(document).on('click', '.sidebar-main-hide', e => {
      e.preventDefault();
      $('body').toggleClass('sidebar-main-hidden');
    });
  }

  // Toggle secondary sidebar
  _sidebarSecondaryToggle() {
    $(document).on('click', '.sidebar-secondary-toggle', e => {
      e.preventDefault();
      $('body').toggleClass('sidebar-secondary-hidden');
    });
  }

  // Show right, resize main
  _sidebarRightMainToggle() {
    $(document).on('click', '.sidebar-right-main-toggle', e => {
      e.preventDefault();

      // Right sidebar visibility
      $('body').toggleClass('sidebar-right-visible');

      // If visible
      if ($('body').hasClass('sidebar-right-visible')) {

        // Make main sidebar mini
        $('body').addClass('sidebar-xs');

        // Hide children lists if they are opened, since sliding animation adds inline CSS
        $('.sidebar-main .nav-sidebar').children('.nav-item').children('.nav-group-sub').css('display', '');
      } else {
        $('body').removeClass('sidebar-xs');
      }
    });
  }

  // Show right, hide main
  _sidebarRightMainHide() {
    $(document).on('click', '.sidebar-right-main-hide', e => {
      e.preventDefault();

      // Opposite sidebar visibility
      $('body').toggleClass('sidebar-right-visible');

      // If visible
      if ($('body').hasClass('sidebar-right-visible')) {
        $('body').addClass('sidebar-main-hidden');
      } else {
        $('body').removeClass('sidebar-main-hidden');
      }
    });
  }

  // Toggle right sidebar
  _sidebarRightToggle() {
    $(document).on('click', '.sidebar-right-toggle', e => {
      e.preventDefault();

      $('body').toggleClass('sidebar-right-visible');
    });
  }

  // Show right, hide secondary
  _sidebarRightSecondaryToggle() {
    $(document).on('click', '.sidebar-right-secondary-toggle', e => {
      e.preventDefault();

      // Opposite sidebar visibility
      $('body').toggleClass('sidebar-right-visible');

      // If visible
      if ($('body').hasClass('sidebar-right-visible')) {
        $('body').addClass('sidebar-secondary-hidden');
      } else {
        $('body').removeClass('sidebar-secondary-hidden');
      }
    });
  }

  // Toggle content sidebar
  _sidebarComponentToggle() {
    $(document).on('click', '.sidebar-component-toggle', e => {
      e.preventDefault();
      $('body').toggleClass('sidebar-component-hidden');
    });
  }


  //
  // On mobile
  //

  // Expand sidebar to full screen on mobile
  _sidebarMobileFullscreen() {
    $('.sidebar-mobile-expand').on('click', function(e) {
      e.preventDefault();
      const $sidebar = $(this).parents('.sidebar');
      const sidebarFullscreenClass = 'sidebar-fullscreen';

      if (!$sidebar.hasClass(sidebarFullscreenClass)) {
        $sidebar.addClass(sidebarFullscreenClass);
      } else {
        $sidebar.removeClass(sidebarFullscreenClass);
      }
    });
  }


  // Toggle main sidebar on mobile
  _sidebarMobileMainToggle() {
    $('.sidebar-mobile-main-toggle').on('click', e => {
      e.preventDefault();
      $('body').toggleClass('sidebar-mobile-main').removeClass('sidebar-mobile-secondary sidebar-mobile-right');

      if ($('.sidebar-main').hasClass('sidebar-fullscreen')) {
        $('.sidebar-main').removeClass('sidebar-fullscreen');
      }
    });
  }

  // Toggle secondary sidebar on mobile
  _sidebarMobileSecondaryToggle() {
    $('.sidebar-mobile-secondary-toggle').on('click', e => {
      e.preventDefault();
      $('body').toggleClass('sidebar-mobile-secondary').removeClass('sidebar-mobile-main sidebar-mobile-right');

      // Fullscreen mode
      if ($('.sidebar-secondary').hasClass('sidebar-fullscreen')) {
        $('.sidebar-secondary').removeClass('sidebar-fullscreen');
      }
    });
  }



  // Toggle right sidebar on mobile
  _sidebarMobileRightToggle() {
    $('.sidebar-mobile-right-toggle').on('click', e => {
      e.preventDefault();
      $('body').toggleClass('sidebar-mobile-right').removeClass('sidebar-mobile-main sidebar-mobile-secondary');

      // Hide sidebar if in fullscreen mode on mobile
      if ($('.sidebar-right').hasClass('sidebar-fullscreen')) {
        $('.sidebar-right').removeClass('sidebar-fullscreen');
      }
    });
  }

  // Toggle component sidebar on mobile
  _sidebarMobileComponentToggle() {
    $('.sidebar-mobile-component-toggle').on('click', e => {
      e.preventDefault();
      $('body').toggleClass('sidebar-mobile-component');
    });
  }


  // Navigations
  // -------------------------

  // Sidebar navigation
  _navigationSidebar() {

    // Define default class names and options
    const navClass = 'nav-sidebar';
    const navItemClass = 'nav-item';
    const navItemOpenClass = 'nav-item-open';
    const navLinkClass = 'nav-link';
    const navSubmenuClass = 'nav-group-sub';
    const navSlidingSpeed = 250;

    // Configure collapsible functionality
    $('.' + navClass).each(function() {
      // tslint:disable-next-line:max-line-length
      $(this).find('.' + navItemClass).has('.' + navSubmenuClass).children('.' + navItemClass + ' > ' + '.' + navLinkClass).not('.disabled').on('click', function(e) {
        e.preventDefault();

        // Simplify stuff
        const $target = $(this);
        // tslint:disable-next-line:max-line-length
        const $navSidebarMini = $('.sidebar-xs').not('.sidebar-mobile-main').find('.sidebar-main .' + navClass).children('.' + navItemClass);

        // Collapsible
        if ($target.parent('.' + navItemClass).hasClass(navItemOpenClass)) {
          // tslint:disable-next-line:max-line-length
          $target.parent('.' + navItemClass).not($navSidebarMini).removeClass(navItemOpenClass).children('.' + navSubmenuClass).slideUp(navSlidingSpeed);
        } else {
          // tslint:disable-next-line:max-line-length
          $target.parent('.' + navItemClass).not($navSidebarMini).addClass(navItemOpenClass).children('.' + navSubmenuClass).slideDown(navSlidingSpeed);
        }

        // Accordion
        if ($target.parents('.' + navClass).data('nav-type') === 'accordion') {
          // tslint:disable-next-line:max-line-length
          $target.parent('.' + navItemClass).not($navSidebarMini).siblings(':has(.' + navSubmenuClass + ')').removeClass(navItemOpenClass).children('.' + navSubmenuClass).slideUp(navSlidingSpeed);
        }
      });
    });

    // Disable click in disabled navigation items
    $(document).on('click', '.' + navClass + ' .disabled', e => {
      e.preventDefault();
    });

    // Scrollspy navigation
    // tslint:disable-next-line:max-line-length
    $('.nav-scrollspy').find('.' + navItemClass).has('.' + navSubmenuClass).children('.' + navItemClass + ' > ' + '.' + navLinkClass).off('click');
  }

  // Navbar navigation
  _navigationNavbar() {

    // Prevent dropdown from closing on click
    $(document).on('click', '.dropdown-content', e => {
      e.stopPropagation();
    });

    // Disabled links
    $('.navbar-nav .disabled a, .nav-item-levels .disabled').on('click', e => {
      e.preventDefault();
      e.stopPropagation();
    });

    // Show tabs inside dropdowns
    // tslint:disable-next-line:only-arrow-functions
    $('.dropdown-content a[data-toggle="tab"]').on('click', function(e) {
      // $(this).tab('show'); // TODO: plugin Tab
    });
  }


  // Components
  // -------------------------
  // Popover
  _componentPopover() {
    // TODO: popover plugin
    // $('[data-popup="popover"]').popover();
  }


  // Card actions
  // -------------------------

  // Reload card (uses BlockUI extension)
  _cardActionReload() {
    $('.card [data-action=reload]:not(.disabled)').on('click', function(e) {
      e.preventDefault();
      // const $target = $(this);
      // const block = $target.closest('.card');
      // TODO: Plugin block or blockui
      // Block card
      // $(block).block({
      //   message: '<i class="icon-spinner2 spinner"></i>',
      //   overlayCSS: {
      //     backgroundColor: '#fff',
      //     opacity: 0.8,
      //     cursor: 'wait',
      //     'box-shadow': '0 0 0 1px #ddd'
      //   },
      //   css: {
      //     border: 0,
      //     padding: 0,
      //     backgroundColor: 'none'
      //   }
      // });

      // For demo purposes
      //   window.setTimeout(function () {
      //     $(block).unblock();
      //   }, 2000);
    });
  }
  // Collapse card
  _cardActionCollapse() {
    const $cardCollapsedClass = $('.card-collapsed');

    // Hide if collapsed by default
    $cardCollapsedClass.children('.card-header').nextAll().hide();

    // Rotate icon if collapsed by default
    $cardCollapsedClass.find('[data-action=collapse]').addClass('rotate-180');

    // Collapse on click
    $('.card [data-action=collapse]:not(.disabled)').on('click', function(e) {
      const $target = $(this);
      const slidingSpeed = 150;

      e.preventDefault();
      $target.parents('.card').toggleClass('card-collapsed');
      $target.toggleClass('rotate-180');
      $target.closest('.card').children('.card-header').nextAll().slideToggle(slidingSpeed);
    });
  }

  // Remove card
  _cardActionRemove() {
    $('.card [data-action=remove]').on('click', function(e) {
      e.preventDefault();
      const $target = $(this);
      const slidingSpeed = 150;

      // If not disabled
      if (!$target.hasClass('disabled')) {
        $target.closest('.card').slideUp({
          duration: slidingSpeed,
          start: () => {
            $target.addClass('d-block');
          },
          complete: () => {
            $target.remove();
          }
        });
      }
    });
  }

  // Card fullscreen mode
  _cardActionFullscreen() {
    $('.card [data-action=fullscreen]').on('click', function(e) {
      e.preventDefault();

      // Define vars
      const $target = $(this);
      const cardFullscreen = $target.closest('.card');
      const overflowHiddenClass = 'overflow-hidden';
      const collapsedClass = 'collapsed-in-fullscreen';
      const fullscreenAttr = 'data-fullscreen';

      // Toggle classes on card
      cardFullscreen.toggleClass('fixed-top h-100 rounded-0');

      // Configure
      if (!cardFullscreen.hasClass('fixed-top')) {
        $target.removeAttr(fullscreenAttr);
        cardFullscreen.children('.' + collapsedClass).removeClass('show');
        $('body').removeClass(overflowHiddenClass);
        $target.siblings('[data-action=move], [data-action=remove], [data-action=collapse]').removeClass('d-none');
      } else {
        $target.attr(fullscreenAttr, 'active');
        cardFullscreen.removeAttr('style').children('.collapse:not(.show)').addClass('show ' + collapsedClass);
        $('body').addClass(overflowHiddenClass);
        $target.siblings('[data-action=move], [data-action=remove], [data-action=collapse]').addClass('d-none');
      }
    });
  }


  // Misc
  // -------------------------

  // Dropdown submenus. Trigger on click
  _dropdownSubmenu() {

    // All parent levels require .dropdown-toggle class
    $('.dropdown-menu').find('.dropdown-submenu').not('.disabled').find('.dropdown-toggle').on('click', function(e) {
      e.stopPropagation();
      e.preventDefault();

      // Remove "show" class in all siblings
      $(this).parent().siblings().removeClass('show').find('.show').removeClass('show');

      // Toggle submenu
      $(this).parent().toggleClass('show').children('.dropdown-menu').toggleClass('show');

      // Hide all levels when parent dropdown is closed
      $(this).parents('.show').on('hidden.bs.dropdown', () => {
        $('.dropdown-submenu .show, .dropdown-submenu.show').removeClass('show');
      });
    });
  }

  // Header elements toggler
  _headerElements() {

    // Toggle visible state of header elements
    $('.header-elements-toggle').on('click', function(e) {
      e.preventDefault();
      $(this).parents('[class*=header-elements-]').find('.header-elements').toggleClass('d-none');
    });

    // Toggle visible state of footer elements
    $('.footer-elements-toggle').on('click', function(e) {
      e.preventDefault();
      $(this).parents('.card-footer').find('.footer-elements').toggleClass('d-none');
    });
  }


  initApp() {
    // Initialize all sidebars
    // On desktop
    // this._sidebarMainResize();
    // this._sidebarMainToggle();
    // this._sidebarSecondaryToggle();
    // this._sidebarRightMainToggle();
    // this._sidebarRightMainHide();
    // this._sidebarRightToggle();
    // this._sidebarRightSecondaryToggle();
    // this._sidebarComponentToggle();

    // On mobile
    // this._sidebarMobileFullscreen();
    // this._sidebarMobileMainToggle();
    // this._sidebarMobileSecondaryToggle();
    // this._sidebarMobileRightToggle();
    // this._sidebarMobileComponentToggle();

    // Initialize all navigations
    // this._navigationSidebar();
    // this._navigationNavbar();


    // Initialize all components
    this._componentPopover();

    // Initialize all card actions
    this._cardActionReload();
    this._cardActionCollapse();
    this._cardActionRemove();
    this._cardActionFullscreen();

    // Dropdown submenu
    this._dropdownSubmenu();

    this._headerElements();
  }

}
