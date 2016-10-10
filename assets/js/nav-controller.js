var $navigation = $('#sidebar-nav'),
	$navToggle	= $('#btn-nav-toggle'),
	$root 		= $('html, body');

$navToggle.on('click', function(e) {
	e.preventDefault();
	e.stopPropagation();
	var isOpen 	= $navigation.hasClass('nav-open'),
		$blur 	= $('.nav-open-blur'),
		$active = $('.active');

	if (isOpen) {
		$blur.removeClass('nav-open-blur').off('click');
		$navigation.removeClass('nav-open');
		$root.css('background', '#fff');
	} else {
		$active.addClass('nav-open-blur');
		$navigation.addClass('nav-open');
		if ($active.is('#player')) $root.css('background', '#000'); // avoid ugly border leak with filter:blur()
		$active.on('click', function(e) {
			$active.removeClass('nav-open-blur').off('click');
			$navigation.removeClass('nav-open');
			$root.css('background', '#fff');
		});
	}
});