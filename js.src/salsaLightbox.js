/**
 * This file contains the code necessary to implement a "recurring prompt lightbox" on a donation form
 * It needs to be integrated into customSalsa.js but hasn't been yet.
 * As of now, it is not compiled by grunt into js.src for production...
 * Also, it should only be present/loaded if lightbox.css is present
 */

jQ(document).ready(function($) {

	//change form field types
	//can't use jQuery, see http://stackoverflow.com/questions/1544317/change-type-of-input-field-with-jquery
	if ( $('input[name="Email"]').length ) {
		$('input[name="Email"]').get(0).type = 'email';	//appears on both advocacy and donation
	}

	//only do these on touch devices, otherwise it looks funny
	//this little requires Modernizr running and testing for touch support
	if ($('html.touch').length) {
		$('input[name="amountOther"]').attr('step','0.01').get(0).type = 'number';
		$('input[name="cc"]').attr('step','1').get(0).type = 'number';
		$('input[name="CVV2"]').attr('step','1').get(0).type = 'number';
	}

	//set defaults
	lightbox = {
		active:   true,	//set to false on prod
		headline: 'Make a Bigger Impact — Give Monthly',
		intro:    '<p>Becoming a monthly donor is one of the most effective ways to help us make an impact. Your monthly gift can go a long way to help create peace.</p>',
		yes:      'YES!',
		yestext:  "Give $[amount] monthly instead",
		formula:  'Math.ceil(amount / 5)',
		no:       'No Thanks',
		notext:   "Just give $[amount] now",
		bg:       "",
		recurring_redirect: "",
		validate: false,
		max:      500,
		tracking: true // google analytics event tracking
	};

	//load up configuration
	//allows clients to define a lightbox_config object in their donation form WYSIWYG to change things.
	if (window.lightbox_config) $.extend( lightbox, window.lightbox_config );

	if (lightbox.active) {

		//create the lightbox mask
		$('body').addClass('not-ready').append('<div id="lightbox-mask" />');

		//create the lightbox
		$lightbox = $('<div id="lightbox-box" />');
		$lightbox
			.append('<a href="#" class="close">X</a>')
			.append('<h2>' + lightbox.headline + '</h2>')
			.append('<div class="lightbox-intro">' + lightbox.intro + '</div>')
			.append('<button class="yes" id="lightbox-yes">' + lightbox.yes + '<span></span></button>')
			.append('<button class="no" id="lightbox-no">' + lightbox.no + '<span></span></button>')
			.appendTo('body')
			.css('background', lightbox.bg);

		//set a background for the lightbox element, if specified
		if (lightbox.bg !== "") $lightbox.css('background', lightbox.bg);

		// store the 'recurring redirect' value in the body to facilitate global retrieval
		$('body').data('recurring_redirect', lightbox.recurring_redirect);

		//create the tracker
		updateTracking('start', lightbox.tracking );

		//attach behaviors to the buttons we just instantiated
		$('#lightbox-no').click(function() {
			$('body').removeClass('not-ready');
			// change tracking code
			updateTracking('no', lightbox.tracking );
			$('form[name="subform"]').submit();
		});

		$('#lightbox-yes').click(function() {
			//make recurring
			$('#recurring').prop('checked', true).val('1');
			//enter 'other' value
			$('input[name="amountOther"]').val( monthly );
			// set period, just in case it changed
			$('#donation_pay_periods').val('MONT');
			//remove blocker class
			$('body').removeClass('not-ready');
			//change tracking code
			updateTracking('yes', lightbox.tracking );
			//submit the form
			$('form[name="subform"]').submit();
		});

		$('#lightbox-box .close').click(function() {
			$('#lightbox-mask, #lightbox-box').fadeOut('fast');
			$('body').removeClass('not-ready').addClass('lb-closed');
			return false;
		});

		//attach intercepts to the form to trigger lightbox and validate
		$('.not-ready form[name="subform"]').on('submit', function() {

			//selector may return a false positive as this was attached while class existed
			if ( !$('body').hasClass('not-ready')) {
				if ($('body').hasClass('lb-closed')) updateTracking( 'closed' );
				return true;
			}

			//validate
			if ( lightbox.validate && !validateForm( $(this) )) return false;

			//check if recurring. if so, submit away!
			if ( $('#recurring').val() === '1' ) {
				updateTracking( 'initial-recur', lightbox.tracking  );
				return true;
			}

			//if not recurring, populate lightbox
			amount = 0;
			monthly = 0;

			amount = +$('input[name="amountOther"]').val() + +$('input[name="amount"]').val();
			amount = parseFloat(amount);	//just making sure

			//check if the gift is large
			if ( amount >= lightbox.max ) {
				updateTracking( 'large', lightbox.tracking  );
				return true;
			}

			monthly = eval(lightbox.formula);
			if (monthly < 3) monthly = 2;	//hard-coded min

			$('#lightbox-yes span').html(lightbox.yestext.replace('[amount]', monthly));
			$('#lightbox-no span').html(lightbox.notext.replace('[amount]', amount));

			//open it
			if ( $('#lightbox-box').outerHeight() + 150 < $(window).height() ) {
				$('#lightbox-box').css('top', $(window).scrollTop() + 150);
			} else {
				$('#lightbox-box').css('top', $(window).scrollTop() + 15);
			}
			$('#lightbox-mask:hidden, #lightbox-box:hidden').fadeIn('fast');
			//update tracking
			updateTracking('open', lightbox.tracking );

			return false;
		});
	}

	/**
	 * Perform (optional) basic form validation since we may not be on an actual donation page
	 */
	function validateForm( context ) {

		var empties = {
			'input[name="First_Name"]'  : "Please enter your first name",
			'input[name="Last_Name"]'   : "Please enter your last name",
			'input[name="Street"]'      : "Please enter your street",
			'input[name="City"]'        : "Please enter your street",
			'select[name="State"]'      : "Please select your state",
			'input[name="Zip"]'         : "Please enter your Zip Code",
			'input[name="Email"]'       : "Please enter your email address",
			'input[name="cc"]'          : "Please enter a credit card number",
			'select[name="ccExpMonth"]' : "Please choose an expiration month",
			'select[name="ccExpYear"]'  : "Please choose an expiration year",
			'input[name="CVV2"]'        : "Please enter your card's security code"
		};

		var numbers = {
			'input[name="cc"]'    : "Please enter a numeric credit card number",
			'input[name="CVV2"]'  : "Please enter a numeric security code"
		};

		var email_pattern        = /^[A-Z0-9._%-\+]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
			numeric_with_decimal_pattern = /^\d+\.?\d*$/,
			numeric_strict_pattern = /^\d+$/,
			false_already          = false,
			cvv_length             = 3,
			card_length            = 16;

		$.each(empties, function(element, message) {
			if ( $.trim( $(element, context).val() ) === '' ) {
				alert(message);
				$(element, context).focus();
				false_already = true;
				return false;
			}
		});

		if (false_already) return false;

		//email valid
		if ( !email_pattern.test( $('input[name="Email"]', context).val() ) ) {
			alert('Please enter a valid email address');
			$('input[name="Email"]', context).focus();
			return false;
		}

		//numeric (skipping zip due to Canada, eh)
		$.each(numbers, function(element, message) {
			if ( !numeric_strict_pattern.test( $(element, context).val() ) ) {
				alert(message);
				$(element, context).focus();
				false_already = true;
				return false;
			}
		});

		//TO DO: check card # length and CVV length
		//check card field length
		if ( $('input[name="cc_type"]:checked').val() === 'american express' ) {
			cvv_length = 4;
			card_length = 15;
		}

		if ( $('input[name="cc"]').val().length !== card_length ) {
			alert('Please enter a ' + card_length +'-digit card number');
			$('input[name="cc"]', context).focus();
			return false;
		}

		if ( $('input[name="CVV2"]').val().length !== cvv_length ) {
			alert('Please enter a ' + cvv_length +'-digit security code');
			$('input[name="CVV2"]', context).focus();
			return false;
		}

		if (false_already) return false;
		return true;

	} // end validator

	function updateTracking( event, do_tracking ) {

		//don't track if it's disabled
		if ( !do_tracking ) return false;

		//add the tracking field if not already present
		if ( $('#salsa-tracker').length === 0 ) {
			$('<input type="hidden" name="Donation_Tracking_Code" value="recurring_lightbox_page" id="salsa-tracker" />').appendTo( $('form[name="subform"]') );
		}

		var $tracker = $('#salsa-tracker'),
			form_id = $('[name="donate_page_KEY"]').val();

		//update things based on our event
		switch (event) {
			case "start":         // initialization
				$tracker.val( 'recurring_lightbox_present' ).attr('name', 'Donation_Tracking_Code');	//should never go into Salsa
				break;
			case "initial-recur": // end-user chose recurring before submission and never got the lightbox
				$tracker.val( 'recurring_prechecked' ).attr('name', 'Note');	//should never go into Salsa
				if ($('body').data('recurring_redirect') !== '') $('input[name="redirect"]').val( $('body').data('recurring_redirect') );
				break;
			case "open":          // lightbox was presented to the user
				if ( typeof _gaq !== 'undefined' ) _gaq.push(['_trackEvent', 'Donations', 'Lightbox Open', form_id]);
				if ( typeof ga === 'function' ) ga('send', 'event', 'Donations', 'Lightbox Open', form_id);
				$tracker.val( 'recurring_lightbox_open' ).attr('name', 'Donation_Tracking_Code');	//should never go into Salsa
				break;
			case "closed":        // user used lightbox 'close' button and then proceeded to submit form
				if ( typeof _gaq !== 'undefined' ) _gaq.push(['_trackEvent', 'Donations', 'Lightbox Closed', form_id]);
				if ( typeof ga === 'function' ) ga('send', 'event', 'Donations', 'Lightbox Closed', form_id);
				$tracker.val( 'recurring_lightbox_closed' ).attr('name', 'Donation_Tracking_Code');	//will only go into Salsa if user closes lightbox and then submits
				break;
			case "large":         // user's gift amount excedded the lightbox max and thus no lightbox was triggered
				if ( typeof _gaq !== 'undefined' ) _gaq.push(['_trackEvent', 'Donations', 'Lightbox Bypassed (Large Gift)', form_id]);
				if ( typeof ga === 'function' ) ga('send', 'event', 'Donations', 'Lightbox Bypassed (Large Gift)', form_id);
				$tracker.val( 'recurring_lightbox_bypassed_large' ).attr('name', 'Donation_Tracking_Code');	//will only go into Salsa if user's initial gift is >=max
				break;
			case "yes":           // user was presented with the lightbox and agreed to give monthly
				if ( typeof _gaq !== 'undefined' ) _gaq.push(['_trackEvent', 'Donations', 'Lightbox Yes', form_id]);
				if ( typeof ga === 'function' ) ga('send', 'event', 'Donations', 'Lightbox Yes', form_id);
				$tracker.val( 'recurring_lightbox_yes' ).attr('name', 'Note');
				if ($('body').data('recurring_redirect') !== '') $('input[name="redirect"]').val( $('body').data('recurring_redirect') );
				break;
			case "no":            // user was presented the lightbox but chose to give a one-time gift
				if ( typeof _gaq !== 'undefined' ) _gaq.push(['_trackEvent', 'Donations', 'Lightbox No', form_id]);
				if ( typeof ga === 'function' ) ga('send', 'event', 'Donations', 'Lightbox No', form_id);
				$tracker.val( 'recurring_lightbox_no' ).attr('name', 'Donation_Tracking_Code');
				break;
		}
		//no need to return anything
	}

});