// delete console;

/**
 * Our mega-amazing Salsa object
 */
var customSalsa = {

	/**
	 * various config options, overridable
	 */
	settings : {
		ajaxDelay: 50,
		ajaxDefaultEvent: 'salsaajax',
		bodyClasses: {
				'getLocal'              : 'lookup',
				'supporter/unsubscribe' : 'unsubscribe',
				'profile'               : 'profile',
				'blastContent'          : 'blasts',
				'/letter'               : 'letter-to-editor',
				'/event/'               : 'event',
				'/my/'                  : 'my-salsa',
				'/shop'                 : 'shop',
				'/signup'               : 'signup',
				'/tellafriend'          : 'tellafriend',
				'/thank_you_page'       : 'thankyou',
				'/questionnaire/'       : 'questionnaire',
				'/action3'              : 'action',
				'/viewCart.jsp'         : 'shop-cart',
				'/item.jsp'             : 'shop-item'
			},
		activeLabelSelector: 'input[type="radio"]',
		$inputsWithPlaceholders: jQuery('#left_container input, #credit_card_information input, .diaFields:not(.eventFields) input, .diaFields:not(.eventFields) textarea, .login input, .logincreate input, #questionnaireQuestions input, .event-page .tellafriend input, #honorof .textarea, .event-page .tellafriend textarea').not(".checkbox, .radio, :hidden"),
		placeholderLabelSpeed: 100,
		placeholderHideSelectLabels: true,
		mobilizeConversions: {
			Email:          'email',
			In_Honor_Email: 'email',
			Zip:            'number',
			cc:             'number',
			Employer_Zip:   'number',
			Phone:          'tel',
			Work_Phone:     'tel',
			Cell_Phone:     'tel',
			otheramt:       'number'
		},
		mobilizeBreak: 500,
		allowCanadianPostalCodes: false,
		regex: {
			zip: /^\d{5}(-\d{4})?$/,
			canadianPostal: /^(?!.*[DFIOQU])[A-VXY][0-9][A-Z] +?[0-9][A-Z][0-9]$/i, //http://my.safaribooksonline.com/9780596802837/id2991897
			email: /^[A-Z0-9._%-\+]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
			integer: /^\d+$/,
			decimal: /^\d+\.?\d*$/
		},
		lightboxDefaults: {
			headline:           'Want your gift to have even more impact?',
			intro:              '<p>Join our monthly giving program - and help us fight month by month for a better world.</p>',
			yes:                'YES!',
			yestext:            "I'll give a monthy donation of $[amount] instead",
			formula:            'Math.ceil(amount / 5)',
			no:                 'NO, THANKS',
			notext:             "Process my one-time gift of $[amount]",
			bg:                 "",
			recurring_redirect: "",
			validate:           false,
			max:                500,
			tracking:           true // google analytics event tracking
		},
		donationFormFields: {
			'input[name="First_Name"]'  : "Please enter your first name",
			'input[name="Last_Name"]'   : "Please enter your last name",
			'input[name="Street"]'      : "Please enter your street",
			'input[name="City"]'        : "Please enter your street",
			'select[name="State"]'      : "Please select your state",
			'input[name="Zip"]'         : "Please enter your Zip Code",
			'input[name="Email"]'       : "Please enter your email address",
			'input[name="cc"]'          : "Please enter a valid credit card number",
			'select[name="ccExpMonth"]' : "Please choose an expiration month",
			'select[name="ccExpYear"]'  : "Please choose an expiration year",
			'input[name="CVV2"]'        : "Please enter a valid card security code"
		}
	},

	/**
	 * We log method calls here so that various methods can know if other things have been run
	 */
	status : {
		initJQ : false,
		addBodyClass : false
	},

	/**
	 * Installs a new version of jQuery
	 */
	initJQ : function( version ) {

		version = typeof version !== 'undefined' ? version : '1.11.2';
		// inject it
		document.write('<scr' + 'ipt type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/'+version+'/jquery.min.js"></scr' + 'ipt>');
		// alias it and give it back
		document.write('<scr' + 'ipt>window.jQ = jQuery.noConflict( true );</scr' + 'ipt>');

		customSalsa.status.initJQ = true;

	}, // END initJQ


	/**
	 * Watches Salsa's AJAX calls and triggers events off them
	 */
	watchAJAX : function() {

		var actionName = this.settings.ajaxDefaultEvent;

		jQ(document).ajaxSuccess( function( event, xhr, settings ) {

			if ( settings.url.indexOf('actionJSON.sjs') !==  -1 ) {
				actionName = 'actionloaded';
			} else if ( settings.url.indexOf('targetJSON.sjs') !==  -1 ) {
				actionName = 'targetsloaded';
			} else if ( settings.url.indexOf('processAction2.jsp') !== -1 ) {
				actionName = 'actionprocessed';
			} else if ( settings.url.indexOf('blind_submit.sjs') !== -1 ) {
				actionName = 'actionsubmitted blindactionsubmitted';
			}
			// trigger the action
			setTimeout( jQ(document).trigger( actionName ), this.settings.ajaxDelay );
		});

		// If we have a blind action, there's no AJAX
		if ( jQ("form[action*='blind_submit.sjs']").length ) {
			jQ(document).trigger('actionloaded');
		}

	},  // END watchAJAX


	/**
	 * Adds a class to the body element based on the Salsa page type
	 */
	addBodyClass : function( classes ) {
		var
			page = window.location.pathname,
			addedClass = null;

		classes = typeof classes !== 'undefined' ? classes : this.settings.bodyClasses ;

		// loop thru and add to body
		// stop once we've hit one, as a page shouldn't be multiple
		jQ.each( classes, function( test, className ){
			if ( page.indexOf(test) > 1 ) {
				jQ('body').addClass(className);
				addedClass = className;
				return false;
			}
		});

		// if we're on an action page, let's try to figure out the action type
		if ( 'action' === addedClass ) {
			// blind targeted actions have a different form action
			$form = jQ('form[onsubmit]');
			if ( $form.length && $form.attr('action').indexOf('blind_submit') > 1 ) {
				jQ('body').addClass('action-blind');
			}
			// petitions have a petitionContent element
			// but it doesn't exist until after retrieveAllData has completed
			// which we can test with #sign-page's visibility
			else if ( jQ('#sign-page').is(':visible') ) {
				if ( jQ('.petitionContent').length ) {
					jQ('body').addClass('action-petition');
				} else {
					jQ('body').addClass('action-targeted-or-multi');
				}
			}
			// if #sign-page is still hidden, the XHR hasn't finished
			// let's listen in and then react!
			else {
				jQ(document).ajaxSuccess(function(event,xhr,settings) {
					// need to listen to the call that fetches the ajax
					if ( settings.url.indexOf('actionJSON.sjs') !==  -1 ) {
						// let's look for "Style":"Targeted","Petition" or "Multi-Content"
						if ( xhr.response.indexOf('"Style":"Targeted"') > 1 ) {
							jQ('body').addClass('action-targeted');
						} else if ( xhr.response.indexOf('"Style":"Petition"') > 1 ) {
							jQ('body').addClass('action-petition');
						} else if ( xhr.response.indexOf('"Style":"Multi-Content"') > 1 ) {
							jQ('body').addClass('action-multi');
						} else {
							jQ('body').addClass('action-unknown');
						}
					}
				});
			}
		} // end action special cases

		customSalsa.status.addBodyClass = true;

	}, // END addBodyClass()


	/**
	 * Sets label classes based on the state of the form input they relate to
	 * adds a class of 'active-label' to the label
	 * toggles the classes of checked/unchecked for the label
	 */
	activeLabels : function( selector ) {

		selector = typeof selector !== 'undefined' ? selector : this.settings.activeLabelSelector ;

		jQ( this.settings.activeLabelSelector ).each(function() {
			var $radio = jQ(this),
				$label = jQ("label[for='" + this.id + "']" ),
				group = jQ(this).attr('name');

			$label.addClass('active-label group-' + group);

			//setup classes
			if ( $radio.prop('checked') ) {
				$label.addClass('checked');
			} else {
				$label.addClass('unchecked');
			}

			//setup triggers
			jQ("input[name='" + group + "']").on('change', function() {
				jQ('label.group-' + group).removeClass('checked').addClass('unchecked');
				jQ("label[for='" + this.id + "']" ).addClass('checked');
			});
		});
	}, // END activeLabels


	/**
	 * Makes 'label' elements mimic behavior of 'placeholder' text on inputs
	 */
	placeholderLabels : function( speed ) {

		speed = typeof speed !== 'undefined' ? speed : 100;

		// Add a CSS class to labels that will act like placeholders, so we can style/target
		this.settings.$inputsWithPlaceholders
			.siblings('label').addClass('placeholder')
			.siblings('input, textarea').addClass('with-placeholder');

		// Make label.placeholder act like a placeholder, appearing/disappearing as needed
		jQ('.with-placeholder')
			.focus(function() {
				if ( jQ(this).val() !== '' ) {
					jQ(this).siblings('.placeholder:visible').fadeTo( speed, 0);
				} else {
					jQ(this).siblings('.placeholder:visible').fadeTo( speed, 0.2 );
				}
			})
			.keyup(function() {
				if ( jQ(this).val() !== '' ) {
					jQ(this).siblings('.placeholder:visible').fadeOut( speed, 0);
				} else {
					jQ(this).siblings('.placeholder:hidden').fadeTo( speed, 0.2 );
				}
			})
			.change(function() {
				if ( jQ(this).val() !== '' ) {
					jQ(this).siblings('.placeholder:visible').fadeOut( speed, 0);
				} else {
					jQ(this).siblings('.placeholder:hidden').fadeTo( speed, 0.2 );
				}
			})
			.blur(function() {
				if ( jQ(this).val() === '' ) jQ(this).siblings('.placeholder').fadeTo( speed, 1 );
			});

		//Make placeholders hide labels when pre-filled
		jQ('.with-placeholder').each(function( i ) {
			if ( jQ(this).val() !== '' ) {
				jQ(this).trigger('change');
			}
		});

		if ( this.settings.placeholderHideSelectLabels ) {
			this.hideSelectLabels();
		}
	}, // END placeholderLabelss


	/**
	 * Hides Labels for select elements
	 */
	hideSelectLabels : function() {

		jQ('.formRow select').each(function() {
			$(this).closest('.formRow').find('label').addClass('hidden');
		});

	}, // END hideSelectLabels


	/**
	 * Misc CSS helper classes and such
	 */
	addCSSHelpers : function() {
		jQ("#CVV2").parents('.formRow').addClass('cvv-field');
		jQ("#ccExpMonth").parents('.formRow').addClass('expires-field');

		//smarter markup for required fields (maybe make smarter by using input name=required value?)
		$("span.required").parent('label').next('input, select').attr('required','required');

		customSalsa.status.addCSSHelpers = true;
	}, // END addCSSHelpers

	/**
	 * Adds type=text to inputs lacking it
	 */
	addMissingInputTypes : function( $elements ) {

		if ( !arguments.length ) {
			$elements = jQ('input[id]').not('[type]');
		}

		jQ.each( $elements, function(index, $element) {
			var id = $(this).attr('id');
			if ( !id ) return true; //move on to the next

			// for security(?) reasons using jQuery to change the type doesn't always work
			document.getElementById( id ).type = 'text';
		});

	},

	/**
	 * looks at an input/select and tries to determine what sort of validation would be appropriate
	 * @param field: object - a jQuery object of the field
	 * @return string field validation type, one of: empty | zip | email | integer | decimal
	 * @todo add types for : creditcard | aba | phone
	 */
	getFieldValidationType : function( $field ) {

		var fieldType;

		switch ( $field.attr('name') ) {
			case 'Email' :
				fieldType = 'email';
				break;
			case 'Zip' :
				fieldType = 'zip';
				break;
			case 'Phone' : //unlikely, need to check on this
				fieldType = 'phone';
				break;
			case 'cc':
			case 'CVV2':
				fieldType = 'integer';
				break;
			default:
				fieldType = 'empty';
		}

		return fieldType;

	}, // END getFieldValidationType


	/**
	 * Validates the value of a form field
	 * @param value: string - the value of the field
	 * @param type: string - the field type
	 * @return boolean whether it passes validation
	 */
	validateField : function( value, type ) {

		// first, cleanup
		value = value.trim();

		// it's empty
		if ( ! value || 0 === value.length ) return false;

		// done with emptiness tests. If that's all, we're done here
		if ( 'empty' === type ) return true;

		// validate zipcodes. allow 5-digit, zip+4
		// @todo : Canadian postal codes? Check against this.allowCanadianPostalCodes
		if ( 'zip' === type ) {
			var isValidZip =  this.settings.regex.zip.test( value );

			if ( isValidZip ) return true;

			if ( this.settings.allowCanadianPostalCodes ) {
				return this.settings.regex.canadianPostal.test( value );
			} else {
				return false;
			}
		}

		// validate email
		if ( 'email' === type ) {
			return this.settings.regex.email.test( value );
		}

		// validate numeric
		if ( 'integer' === type ) {
			return this.settings.regex.integer.test( value );
		}

		// validate numeric
		if ( 'decimal' === type ) {
			return this.settings.regex.decimal.test( value );
		}

		// unknown type. Let's assume it's okay
		return true;

	}, // END validateField

	/**
	 * ACTION-SPECIFIC STUFF
	 */
	advocacy : {

		// Validates all required fields in an action.
		// Typically attached to an event listener such as submit to initiate validation
		validateSupporterFields : function() {

			var $fields = this.getRequiredFields(),
				wasValid = true;

			jQ.each( $fields, function( index, $element ) {

				var validationType = customSalsa.getFieldValidationType( $element );
				var isValid = customSalsa.validateField( $element.val(), validationType );

				if ( !isValid ) {
					var message = "Please enter a valid value";
					if ( "email" === validationType ) {
						message = "Please enter a valid email address";
					} else if ( "zip" === validationType ) {
						message = "Please enter a valid postal code";
					} else if ( "First_Name" === $element.attr('name') ) {
						message = "Please enter a first name";
					} else if ( "Last_Name" === $element.attr('name') ) {
						message = "Please enter a last name";
					}
					$element.focus();
					alert( message );
					wasValid = false;
					return false;
				}
			});

			return wasValid;

		}, // END validateSupporterFields

		/**
		 * Gets fields required by advocacy form
		 */
		getRequiredFields : function() {

			var requiredFields = [];

			// if we called addCSSHelpers, this should be easy
			jQ("[required='required']").each( function() {
				requiredFields.push( jQ(this) );
			});

			// manually check just to be sure
			jQ('.required').each( function() {
				var $requiredInput = jQ(this).closest('.formRow').find('input, select');
				if ( jQ.inArray( $requiredInput, requiredFields ) === -1 ) {
					requiredFields.push( $requiredInput );
				}
			});

			return requiredFields;
		}, // END validateSupporterFields

	}, // END advocacy


	/**
	 * DONATION-SPECIFIC STUFF
	 */
	donation : {

		/**
		 * Set the value of the credit card type based on the numeric value entered
		 */
		magicSetCCtype : function( ccNum, setElement ) {

			var
				tests = {
					'visa' : /^4\d{15}$/,
					'mc'	 : /^5[1-5]\d{14}$/,
					'amex' : /^3[47]\d{13}$/,
					'disc' : /^6(?:011\d\d|5\d{4}|4[4-9]\d{3}|22(?:1(?:2[6-9]|[3-9]\d)|[2-8]\d\d|9(?:[01]\d|2[0-5])))\d{10}$/
				},
				returnVal = false;

			ccNum = typeof ccNum !== 'string' ? ccNum : jQ('#cc_number').val();
			setElement = typeof setElement !== 'string' ? setElement : '#cc_type';

			jQ.each( tests, function( key, value ) {
				if ( ccNum.match( value ) !== null ) {
					returnVal = key;
					jQ(setElement).val( key );
					return false;
				}
			});

			return returnVal;
		}, // END donation.magicSetCCtype

		/**
		 * Perform the Luhn algorithm to verify a credit card number
		 */
		isValidLuhn : function( value ) {

			var arr = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];
			value = typeof value !== 'string' ? value : jQ('#cc_number').val();

			return function() {
				var
					len = value.length,
					bit = 1,
					sum = 0,
					val;

				while (len) {
					val = parseInt( value.charAt(--len), 10 );
					sum += (bit ^= 1) ? arr[val] : val;
				}

				return sum && sum % 10 === 0;
			};
		}, // END donation.luhnCheck

		/**
		 * function to test if a given value (string/int) passes a basic ABA routing number checksum
		 */
		isValidABA : function( value ) {
			var numericRegex = /^\d{9}$/,
				total = null;

			// just in cases
			value = value.toString();

			// make sure it's numeric and of length 9
			if ( !numericRegex.test( value ) ) {
				return false;
			}

			// compute checksum
			for (var i=0; i<9; i += 3) {
				total += parseInt(value.charAt(i), 10) * 3
					+ parseInt(value.charAt(i + 1), 10) * 7
					+ parseInt(value.charAt(i + 2), 10);
			}
			if (total !== 0 && total % 10 === 0){
				return true;
			}

			// still here? That's not good.
			return false;

		}, // END isValidABA

		/**
		 * Does a Luhn check but also tests for validity against defined card type and CVV
		 * Not much point in using in combination with magicSetCCtype, but not *totally* redundant due to CVV check
		 * @param ccNumber string | integer The user-provided CC number
		 * @param cvv string | integer The user-provided CVV value
		 * @param type string The credit card type
		 *
		 * @return object properties: isValid (boolean), errors[ { value, message }, ... ]
		 */
		isValidCC : function( ccNumber, cvv, type ) {

			var ccType = type,
				ccTest = /^\d+$/,
				cvvTest = /^\d{3}$/,
				returnObj = { errors: [], isValid : true };

			switch ( ccType ) {
				case "visa":
					ccTest = /^4\d{15}$/;
					break;
				case "mc":
					ccTest = /^5[1-5]\d{14}$/;
					break;
				case "disc":
					ccTest = /^6(?:011\d\d|5\d{4}|4[4-9]\d{3}|22(?:1(?:2[6-9]|[3-9]\d)|[2-8]\d\d|9(?:[01]\d|2[0-5])))\d{10}$/;
					break;
				case "amex":
				case "american express":
					ccTest = /^3[47]\d{13}$/;
					cvvTest = /^\d{4}$/;
					break;
			}

			if ( !ccTest.test( ccNumber ) || ! this.isValidLuhn( ccNumber ) ) {
				returnObj.isValid = false;
				returnObj.errors.push({
					value: ccNumber,
					message: 'A valid credit card number is required.'
				});
			}

			//check CVV is numeric and matches length
			if ( !cvvTest.test( cvv ) ) {
				returnObj.isValid = false;
				returnObj.errors.push({
					value: cvv,
					message: 'Invalid security code (CVV) number.'
				});
			}

			return returnObj;

			// @todo: evaluate expiration. It should be in the future!

		}, // END donation.isValidCC

		lightbox : {

			/**
			 * Implements a lightbox requesting recurring donations
			 * MAKE SURE YOU HAVE CSS IN PLACE!
			 */
			init : function( config ) {

				var lightbox = customSalsa.settings.lightboxDefaults;

				// load config
				if ( arguments.length && 'object' === typeof config ) {
					jQ.extend( lightbox, config );
				}

				//create the lightbox mask
				jQ('body').addClass('not-ready').append('<div id="lightbox-mask" />');

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
				if ( lightbox.bg !== "" ) $lightbox.css('background', lightbox.bg);

				// store the 'recurring redirect' value in the body to facilitate global retrieval
				jQ('body').data('recurring_redirect', lightbox.recurring_redirect);

				//create the tracker
				this.updateTracking('start', lightbox.tracking );

				//attach behaviors to the buttons we just instantiated
				//first: no button
				jQ('#lightbox-no').click(function() {
					jQ('body').removeClass('not-ready');
					// change tracking code
					this.updateTracking('no', lightbox.tracking );
					jQ('form[name="subform"]').submit();
				});
				// behaviors for the yes button
				jQ('#lightbox-yes').click(function() {
					//make recurring
					jQ('input[name="recurring"][value="1"]').prop('checked', true);
					//change amount to 'other'
					jQ('input#otheramount').prop('checked', true);
					//enter 'other' value
					jQ('input[name="amountOther"]').val( monthly );
					// set period, just in case it changed
					jQ('#donation_pay_periods').val('MONT');
					//remove blocker class
					jQ('body').removeClass('not-ready');
					//change tracking code
					this.updateTracking('yes', lightbox.tracking );
					//submit the form
					jQ('form[name="subform"]').submit();
				});
				// behaviors for close button
				jQ('#lightbox-box .close').click( function() {
					jQ('#lightbox-mask, #lightbox-box').fadeOut('fast');
					jQ('body').removeClass('not-ready').addClass('lb-closed');
					return false;
				});

				//attach intercepts to the initial form to trigger lightbox (and optionally validate)
				jQ('.not-ready form[name="subform"]').on('submit', function() {

					//selector may return a false positive as this was attached while class existed
					if ( !jQ('body').hasClass('not-ready') ) {
						if ( jQ('body').hasClass('lb-closed') ) this.updateTracking( 'closed' );
						return true;
					}

					//validate
					if ( lightbox.validate && !customSalsa.donation.validateForm() ) return false;

					//check if recurring. if so, submit away!
					if ( jQ('input[name="recurring"]:checked').val() === 1 ) {
						this.updateTracking( 'initial-recur', lightbox.tracking  );
						return true;
					}

					//check if the gift is large
					if ( jQ('input[name="amount"]:checked').val() >= lightbox.max || ( jQ('#otheramount:checked').length && jQ('input[name="amountOther"]').val() >= lightbox.max) ) {
						this.updateTracking( 'large', lightbox.tracking  );
						return true;
					}

					//if not recurring, populate lightbox content
					amount  = 0;
					monthly = 0;
					if ( jQ('#otheramount:checked').length ) {
						amount = jQ('input[name="amountOther"]').val();
					} else {
						amount = jQ('input[name="amount"]:checked').val();
					}

					amount  = parseFloat(amount);	//just making sure
					monthly = eval(lightbox.formula);
					if ( monthly < 3 ) monthly = 2;	//hard-coded min, required by Salsa

					$('#lightbox-yes span').html(lightbox.yestext.replace('[amount]', monthly));
					$('#lightbox-no span').html(lightbox.notext.replace('[amount]', amount));

					//open it. Very basic responsiveness
					//@todo: wire up to mediaCheck
					if ( jQ('#lightbox-box').outerHeight() + 150 < jQ(window).height() ) {
						jQ('#lightbox-box').css('top', $(window).scrollTop() + 150);
					} else {
						jQ('#lightbox-box').css('top', $(window).scrollTop() + 15);
					}
					jQ('#lightbox-mask:hidden, #lightbox-box:hidden').fadeIn('fast');
					//update tracking
					this.updateTracking('open', lightbox.tracking );

					return false;
				}); // end not-ready onsubmit

			}, // END lightbox.init

			/**
			 * Updating Donation_Tracking_Code as well as Google Analytics based on lightbox interactions
			 */
			updateTracking : function( event, doTracking ) {

				//don't track if it's disabled or GAQ ain't a thing
				if ( !do_tracking || "undefined" === typeof _gaq ) return false;

				//add the tracking field if not already present
				if ( jQ('#salsa-tracker').length === 0 ) {
					jQ('<input type="hidden" name="Donation_Tracking_Code" value="recurring_lightbox_page" id="salsa-tracker" />').appendTo( jQ('form[name="subform"]') );
				}

				var $tracker = $('#salsa-tracker');

				//update things based on our event
				switch (event) {
					case "start":         // initialization
						$tracker.val( 'recurring_lightbox_present' );	//should never go into Salsa
						break;
					case "initial-recur": // end-user chose recurring before submission and never got the lightbox
						$tracker.val( 'recurring_prechecked' );	//should never go into Salsa
						if ( jQ('body').data('recurring_redirect') ) jQ('input[name="redirect"]').val( jQ('body').data('recurring_redirect') );
						break;
					case "open":          // lightbox was presented to the user
						_gaq.push(['_trackEvent', 'Donations', 'Lightbox Open']);
						$tracker.val( 'recurring_lightbox_open' );	//should never go into Salsa
						break;
					case "closed":        // user used lightbox 'close' button and then proceeded to submit form
						_gaq.push(['_trackEvent', 'Donations', 'Lightbox Closed']);
						$tracker.val( 'recurring_lightbox_closed' );	//will only go into Salsa if user closes lightbox and then submits
						break;
					case "large":         // user's gift amount excedded the lightbox max and thus no lightbox was triggered
						_gaq.push(['_trackEvent', 'Donations', 'Lightbox Bypassed (Large Gift)']);
						$tracker.val( 'recurring_lightbox_bypassed_large' );	//will only go into Salsa if user's initial gift is >=max
						break;
					case "yes":           // user was presented with the lightbox and agreed to give monthly
						_gaq.push(['_trackEvent', 'Donations', 'Lightbox Yes']);
						$tracker.val( 'recurring_lightbox_yes' ).attr('name', 'Note');
						if ( jQ('body').data('recurring_redirect') ) jQ('input[name="redirect"]').val( jQ('body').data('recurring_redirect') );
						break;
					case "no":            // user was presented the lightbox but chose to give a one-time gift
						_gaq.push(['_trackEvent', 'Donations', 'Lightbox No']);
						$tracker.val( 'recurring_lightbox_no' );
						break;
				}

			}, // END lightbox.updateTracking

		}, // END donation.lightbox

		/**
		 * Validate a donation form
		 * Only hits basic required fields by default
		 * @todo: validate credit card expiry, validate checking account number
		 */
		validateForm : function( context ) {

			context = typeof context !== 'object' ? jQ('form[name="subform"]') : context ;

			var fields = customSalsa.settings.donationFormFields;

			jQ.each( fields, function( selector, errMessage ) {

				var $element = jQ(selector, context);
				var validationType = customSalsa.getFieldValidationType( $element );
				var isValid = customSalsa.validateField( $element, validationType );

				if ( !isValid ) {
					$element.filter(':visible').focus();
					alert( errMessage );
					wasValid = false;
					return false;
				}

			});

			if ( ! wasValid ) return false;

			// validate credit card information
			checkCC = this.isValidCC( jQ('input[name="cc"]', context).val(), jQ('input[name="CVV2"]', context).val(), $('input[name="cc_type"]:checked').val() );
			if ( checkCC.isValid ) return true;
			alert( checkCC.errors.message );
			if ( jQ('input[name="CVV2"]', context).val() === checkCC.errors.value ) {
				jQ('input[name="CVV2"]:visible', context).focus();
			}	else {
				jQ('input[name="cc"]:visible', context).focus();
			}
			return false;
		}

	}, // END donation

	/**
	 * MOBILIZR
	 */
	mobilizr: {

		/**
		 * Converts input types to mobile-friendly versions where appropriate
		 * Relies on mediaCheck https://github.com/sparkbox/mediaCheck
		 */
		mobilizeInputTypes : function( width, config ) {

			config = typeof config !== 'object' ? config : customSalsa.settings.mobilizeConversions ;
			width = typeof width !== 'number' ? width : customSalsa.settings.mobilizeBreak ;

			// we need mediaCheck!
			if ( typeof mediaCheck !== 'function' ) return false;

			mediaCheck({
				media: '(max-width: ' + width + 'px)',

				entry: function() {

					// Reassign fields to HTML5 counterparts, if they exist
					jQ.each( config, function( inputName, inputType ) {
						var $elem = jQ("input[name='" + inputName + "']");

						if ( $elem.length && $elem.attr('id') ) {
							var the_id = $elem.attr('id');
							$elem.data( 'original-type', document.getElementById(the_id).type );
							document.getElementById(the_id).type = inputType;	// can't do this via jQ... security issues?
						}
					});

				},

				exit: function() {
					// Assign fields back to clunky Salsa defaults
					jQ.each( config.conversions, function( inputName, inputType ) {
						var $elem = jQ("input[name='" + inputName + "']");

						if ( $elem.length && $elem.attr('id') && $elem.data('original-type') ) {
							var the_id = $elem.attr('id');
							document.getElementById(the_id).type = $elem.data('original-type');
						}
					});

				}
			});

		}, // END mobilizeTypes

		/**
		 * Does all the mobilizr stuff
		 */
		init: function( breakpoint ) {
			// should do checks if already completed?
			customSalsa.addCSSHelpers();
			customSalsa.addMissingInputTypes();
			this.mobilizeInputTypes( breakpoint );
			jQ('html').addClass('mobilized');

			customSalsa.status.mobilizrInit = true;
		}

	}

};


/**
 * Give ourselves a modern version of jQuery if we need it... (defaults to 1.11.2)
 */
if ( typeof jQ !== 'object' && typeof jQ.fn.jquery !== 'string' ) {
	customSalsa.initJQ();
}