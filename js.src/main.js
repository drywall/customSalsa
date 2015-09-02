/**
 * Use this file to configure how you'd like to deploy customSalsa
 * And to implement other custom javaScript
 *
 * Remember that jQ is jQuery 1.11.3 as loaded by customSalsa.initJQ();
 */

jQ(document).ready(function($) {

	customSalsa.addBodyClass();

	// do stuff once we have an action
	$(document).on('actionloaded', function() {
		customSalsa.placeholderLabels();
	});

	// we do this AFTER we declare any 'actionloaded' listeners
	customSalsa.watchAJAX();

	// put your stuff here. Implement mobilizr, a multistep donation form, or whatever!
	// @todo actually provide some examples...
	
});
