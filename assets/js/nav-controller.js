var $navigation = $('#sidebar-nav'),
	$navToggle	= $('#btn-nav-toggle');

$navToggle.on('click', function(e) {
	e.preventDefault();
	e.stopPropagation();
	var isOpen 	= $navigation.hasClass('nav-open'),
		$blur 	= $('.nav-open-blur'),
		$active = $('.active');

	if (isOpen) {
		$blur.removeClass('nav-open-blur').off('click');
		$navigation.removeClass('nav-open');
	} else {
		$active.addClass('nav-open-blur');
		$navigation.addClass('nav-open');
		$active.on('click', function(e) {
			$active.removeClass('nav-open-blur').off('click');
			$navigation.removeClass('nav-open');
		});
	}
});