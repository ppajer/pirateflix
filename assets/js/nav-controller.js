var $navigation = $('#sidebar-nav'),
	$navToggle	= $('#btn-nav-toggle'),
	$root 		= $('html, body');

$navToggle.on('click', function(e) {
	e.preventDefault();
	e.stopPropagation();
	var isOpen 		= $navigation.hasClass('nav-open'),
		$blur 		= $('.nav-open-blur'),
		$active 	= $('.active'),
		isPlayer 	= ($active.attr('id') === 'player');

	if (isOpen) {

		if (isPlayer) {

			$active.find('#player-overlay').removeClass('overlay-show');
		}
		
		$blur.removeClass('nav-open-blur').off('click');
		$navigation.removeClass('nav-open');
		$root.css('background', '#fff');
	
	} else {

		$navigation.addClass('nav-open');

		if (isPlayer) {
			
			$active.find('#player-overlay').addClass('overlay-show');
			$active.find('#webchimera').addClass('nav-open-blur');
			$root.css('background', '#000'); // avoid ugly border leak with filter:blur()
			$navigation.on('click', function(e){
				$('#player-overlay').removeClass('overlay-show');
				$navigation.off('click');
			})
		
		} else {
			
			$active.addClass('nav-open-blur');
			$active.on('click', function(e) {
				$active.removeClass('nav-open-blur').off('click');
				$navigation.removeClass('nav-open');
				$root.css('background', '#fff');
			});
		}
		
		
	}
});