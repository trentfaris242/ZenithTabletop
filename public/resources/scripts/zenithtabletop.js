$(document).ready(function() {
	$('body').css('padding-top', parseInt($('.navbar').css('height')) + 10 + 'px');
	
	$(window).resize(function() {
		$('body').css('padding-top', parseInt($('.navbar').css('height')) + 10 + 'px');
	});

});