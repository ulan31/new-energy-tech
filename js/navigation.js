( function( $ ) {

	function initMainNavigation( container ) {
		// Add dropdown toggle that display child menu items.
		container.find( '.menu-item-has-children > a' ).after( '<button class="dropdown-toggle" aria-expanded="false"><span>expand<span></button>' );

		// Toggle buttons and submenu items with active children menu items.
		container.find( '.current-menu-ancestor > button' ).addClass( 'toggle-on' );
		container.find( '.current-menu-ancestor > .sub-menu' ).addClass( 'toggled-on' );

		container.find( '.dropdown-toggle' ).on( 'click', function( e ) {
			var _this = $( this );
			e.preventDefault();
			_this.toggleClass( 'toggle-on' );
			_this.next( '.children, .sub-menu' ).toggleClass( 'toggled-on' );
			_this.attr( 'aria-expanded', _this.attr( 'aria-expanded' ) === 'false' ? 'true' : 'false' );
		} );
	}

	initMainNavigation( $( '.main-navigation' ) );

  const siteNav = $( '#site-navigation' );
	const button = $( '.site-header' ).find( '.menu-toggle' );

	// Enable menu toggle for small screens.
	( function() {
		var menu;

		if ( ! siteNav.length || ! button.length ) {
			return;
		}

		// Hide button if there are no widgets and the menus are missing or empty.
		menu    = siteNav.find( '.nav-menu' );

		if ( ! menu.length || ! menu.children().length ) {
			button.hide();
			return;
		}

		button.on( 'click', function() {
			siteNav.toggleClass( 'toggled-on' );
			siteNav.trigger( 'resize' );
			$( this ).toggleClass( 'toggled-on' );
			if ( $( this, siteNav ).hasClass( 'toggled-on' ) ) {
				$( this ).attr( 'aria-expanded', 'true' );
				siteNav.attr( 'aria-expanded', 'true' );
			} else {
				$( this ).attr( 'aria-expanded', 'false' );
				siteNav.attr( 'aria-expanded', 'false' );
			}
		} );
	} )();

} )( jQuery );