/**
 * File navigation-search.js.
 *
 * Handles toggling the navigation menu search
 */
( function() {
	const searchDesktop = document.getElementsByClassName( 'search-desktop' )[ 0 ];

	// Return early if the header doesn't exist.
	if ( ! searchDesktop ) {
		return;
	}

	const button = searchDesktop.getElementsByClassName( 'search-toggle' )[ 0 ];
	
	// Return early if the button doesn't exist.
	if ( 'undefined' === typeof button ) {
		return;
	}

	// Toggle the .toggled class and the aria-expanded value each time the button is clicked.
	button.addEventListener( 'click', function() {
		searchDesktop.classList.toggle( 'toggled' );

		if ( button.getAttribute( 'aria-expanded' ) === 'true' ) {
			button.setAttribute( 'aria-expanded', 'false' );
		} else {
			button.setAttribute( 'aria-expanded', 'true' );
		}
	} );

	// Remove the .toggled class and set aria-expanded to false when the user clicks outside the navigation.
	document.addEventListener( 'click', function( event ) {
		const isClickInside = searchDesktop.contains( event.target );
		const isClickOpenBtn = button.contains( event.target );

		if ( ! isClickInside && ! isClickOpenBtn ) {
			searchDesktop.classList.remove( 'toggled' );
			button.setAttribute( 'aria-expanded', 'false' );
		}
	} );
})();
