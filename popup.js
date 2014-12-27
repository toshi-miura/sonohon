$(function() {	
	$('#goto_option').bind('click', function(){
		var option_url = chrome.extension.getURL("options.html"); 
		window.open(option_url);
	});
});