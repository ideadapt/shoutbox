;
(function($) {
	$(document).ready(function() {
		/*
		 * the start of serverScript path is equal to the contao websitePath ($GLOBALS['TL_CONFIG']['websitePath'])
		 * for example if your backend url looks like this http://www.me.com/myproject/contao/main.php
		 * you should set tl_path to:
		 * /myproject/
		 * */
		var tl_path = "/contao-2.11/core/";
		
		$.iaShoutbox( {
			serverScript : 
				tl_path+'system/modules/shoutbox/shoutbox.php?BE_USER_AUTH=' + $.cookie('BE_USER_AUTH')
			});
		});
})(jQuery);