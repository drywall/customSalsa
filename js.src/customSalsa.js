//delete console;

/**
 * Our mega-amazing Salsa object
 */
var customSalsa = {

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
				'/item.jsp'             : 'shop-item',
				'/checkOut.jsp'         : 'shop-checkout',
				'/donation/'            : 'donate'
			},
		activeLabelSelector: 'input[type="radio"]',
		$inputsWithPlaceholders: jQuery('#left_container input, #credit_card_information input, .diaFields:not(.eventFields) input, .diaFields:not(.eventFields) textarea, .login input, .logincreate input, #questionnaireQuestions input, .event-page .tellafriend input, #honorof .textarea, .event-page .tellafriend textarea').not(".checkbox, .radio, :hidden"),
		placeholderLabelSpeed: 100,
		placeholderHideSelectLabels: true,
		mobilizeConversions: {
			Email: 'email',
			In_Honor_Email: 'email',
			Zip: 'number',
			cc: 'number',
			Employer_Zip: 'number',
			Phone: 'tel',
			Work_Phone: 'tel',
			Cell_Phone: 'tel',
			otheramt: 'number'
				},
		mobilizeBreak: 500,
		allowCanadianPostalCodes: false,
		regex: {
			zip: /^\d{5}(-\d{4})?$/,
			canadianPostal: /^(?!.*[DFIOQU])[A-VXY][0-9][A-Z] +?[0-9][A-Z][0-9]$/i, //http://my.safaribooksonline.com/9780596802837/id2991897
			email: /^[A-Z0-9._%-\+]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
			integer: /^\d+$/,
			decimal: /^\d+\.?\d*$/,
			dollar: /^[0-9]+(\.[0-9][0-9])?$/
		},
		multistepStrings : {
			'title'	           : 'Support Us Today!',
			'secure'           : 'Secure',

			'step1_progress'   : '1. Amount',
			'step1_button'	   : 'Next',
			'step2_progress'   : '2. Name',
			'step2_button'	   : 'Next',
			'step3_progress'   : '3. Payment',
			'step3_button'	   : 'Process Donation',

			'amount_label'	   : 'Select an Amount',
			'other_label'		   : 'Other amount:',
			'monthly'				   : 'Make this a monthly gift',

			'details_label'	   : 'Your Information',
			'extra_label'		   : 'In Honor/Memory of...',
			'extra_extra'		   : 'keep blank if none',
			'extra_name_label' : 'Honoree\'s name',
			'extra_email_label': 'Email address',
			'extra_addy_label' : 'Postal Address',
			'code_label'		   : 'Designation code',
			'code_options'	   : [],
			'remember'			   : 'Remember me so I can donate with one click in the future',
			'payment_label'	   : 'Payment Information',
			'mobileBreakpoint' : 650
		}
	},

	/**
	 * Installs a new version of jQuery
	 */
	initJQ : function( version ) {

		version = typeof version !== 'undefined' ? version : '1.11.3';
		// inject it
		document.write('<scr' + 'ipt type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/'+version+'/jquery.min.js"></scr' + 'ipt>');
		// alias it and give it back
		document.write('<scr' + 'ipt>window.jQ = jQuery.noConflict( true );</scr' + 'ipt>');

	}, // END initJQ


	/**
	 * Watches Salsa's AJAX calls and triggers events off them
	 */
	watchAJAX : function() {

		var actionName = this.settings.ajaxDefaultEvent;

		s$(document).ajaxSuccess( function( event, xhr, settings ) {

			if ( settings.url.indexOf('actionJSON.sjs') !==  -1 ) {
				actionName = 'actionloaded';
			} else if ( settings.url.indexOf('targetJSON.sjs') !==  -1 ) {
				actionName = 'targetsloaded';
			} else if ( settings.url.indexOf('processAction2.jsp') !== -1 ) {
				actionName = 'actionprocessed';
			} else if ( settings.url.indexOf('blind_submit.sjs') !== -1 ) {
				actionName = 'actionsubmitted blindactionsubmitted';
			} else if ( settings.url.indexOf('processWebform.sjs') !== -1 ) {
				actionName = 'targetwebformsubmitted';
			}
			// trigger the action
			setTimeout( function() { jQ(document).trigger( actionName ); }, customSalsa.settings.ajaxDelay );
		});

		// If we have a blind action, there's no AJAX
		if ( jQ("form[action*='blind_submit.sjs']").length ) {
			setTimeout( function() { jQ(document).trigger('actionloaded'); }, customSalsa.settings.ajaxDelay );
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
		if ( addedClass === 'action' ) {
			// blind targeted actions have a different form action
			var $form = jQ('form[onsubmit]');
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
				s$(document).ajaxSuccess( function( event, xhr, settings ) {
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
			jQ(this).closest('.formRow').find('label').addClass('hidden');
		});

	}, // END hideSelectLabels


	/**
	 * Misc CSS helper classes and such
	 */
	addCSSHelpers : function() {
	  jQ("#CVV2").parents('.formRow').addClass('cvv-field');
	  jQ("#ccExpMonth").parents('.formRow').addClass('expires-field');

	  //smarter markup for required fields (maybe make smarter by using input name=required value?)
	  jQ("span.required").parent('label').next('input, select').attr('required','required');
	}, // END addCSSHelpers

	/**
	 * Adds type=text to inputs lacking it
	 */
	addMissingInputTypes : function( $elements ) {

		$elements = $elements || jQ('input[id]').not('[type]');

		jQ.each( $elements, function(index, $element) {
			var id = jQ(this).attr('id');
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
	 * Outputs error(s) to user.
	 */
	showErrors : function( errorObj ) {

		if ( errorObj.isValid ) return;

		if ( errorObj.errors.length ) {
			jQ.each( errorObj.errors, function( index, err ) {
				if ( err.message ) {
					alert( err.message );
				}
				if ( err.element ) {
					jQ( err.element ).focus();
				}
			});
		}

	},

	/**
	 * ACTION-SPECIFIC STUFF
	 */
	advocacy : {

		// Validates all required fields in an action.
		// Typically attached to an event listener such as submit to initiate validation
		validateSupporterFields : function() {

			var $fields = this.getRequiredActionFields(),
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

		getRequiredActionFields : function() {

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
		}, // END getRequiredFields

	},


	/**
	 * DONATION-SPECIFIC STUFF.... TBD later
	 */
	donation : {

		/**
		 * Set the value of the credit card type based on the numeric value entered
		 */
		magicSetCCtype : function( $ccNum, setElement ) {

			var
				tests = {
					'visa' : /^4\d{15}$/,
					'mc'	 : /^5[1-5]\d{14}$/,
					'amex' : /^3[47]\d{13}$/,
					'disc' : /^6(?:011\d\d|5\d{4}|4[4-9]\d{3}|22(?:1(?:2[6-9]|[3-9]\d)|[2-8]\d\d|9(?:[01]\d|2[0-5])))\d{10}$/
				},
				returnVal = false,
				ccNum = typeof $ccNum === 'object' ? $ccNum.val() : jQ('#cc_number').val();

			setElement = typeof setElement === 'string' ? setElement : '#cc_type';

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
		},

		/**
		 * Does a Luhn check but also tests for validity against defined card type and CVV
		 * Not much point in using in combination with magicSetCCtype, but not *totally* redundant due to CVV check
		 * @param ccNumber string | integer The user-provided CC number
		 * @param cvv string | integer The user-provided CVV value
		 * @param type string The credit card type
		 *
		 * @return object properties: isValid (boolean), errors[ { value, message }, ... ]
		 */
		isValidCC : function( $ccNumber, $cvv, $type ) {

			var ccType = $type.val(),
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
					ccTest = /^3[47]\d{13}$/;
					cvvTest = /^\d{4}$/;
					break;
			}

			if ( !ccTest.test( $ccNumber.val() ) || ! this.isValidLuhn( $ccNumber.val() ) ) {
				returnObj.isValid = false;
				returnObj.errors.push({
					value: $ccNumber.val(),
					element: $ccNumber,
					message: 'A valid credit card number is required.'
				});
			}

			//check CVV is numeric and matches length
			if ( !cvvTest.test( $cvv.val() ) ) {
				returnObj.isValid = false;
				returnObj.errors.push({
					value: $cvv.val(),
					element: $cvv,
					message: 'Invalid security code (CVV) number.'
				});
			}

			return returnObj;
		},

		/**
		 * Checks CC expiration
		 */
		isValidCCExpiry : function( $monthElement, $yearElement ) {
			var today = new Date(),
				currentYear = today.getFullYear(),
				currentMonth = today.getMonth() + 1,  //because getMonth is 0-11. Yay.
				returnObj = { errors: [], isValid : true };
			if ( ! $monthElement.val() ) {
				returnObj = { isValid: false, errors: [{
					value: $monthElement.val(),
					element: $monthElement,
					message: 'Please identify an expiration month',
				}]};
			}
			if ( ! $yearElement.val() ) {
				returnObj.isValid = false;
				returnObj.errors.push({
					value: $yearElement.val(),
					element: $yearElement,
					message: 'Please identify an expiration year',
				});
			} else if ( +$yearElement.val() + 2000 < currentYear ) {
				return {
					isValid: false,
					errors: [{ element: $yearElement, message: 'Please enter an expiration date in the future.', }]
				};
			} else if ( +$yearElement.val() + 2000 === currentYear && +$monthElement.val() < currentMonth ) {
				return {
					isValid: false,
					errors: [{ element: $monthElement, message: 'Please enter an expiration month/year in the future.', }]
				};
			}

			return returnObj;
		},

		/**
		 * Checks user-provided donation amount to make sure it's not too small, too large, or too non-numeric ;)
		 */
		isValidDonationAmount : function( $form ) {

			$form = $form || jQ('form.orderform');

			var
				minimumAmount = +jQ('input[name="amountMinimum"]').val() || 2,
				maximumAmount = +jQ('input[name="amountLimit"]').val() || 99999,
				theAmount = +jQ('#amount', $form).val() + +jQ('#amountOther', $form).val(),
				returnObj = { errors: [], isValid : true };

			// too blank?
			if ( jQ('#amount', $form).val() === "" && jQ('#amountOther', $form).val() === "" ) {
				returnObj.isValid = false;
				returnObj.errors.push({
					value   : jQ('#amountOther', $form).val(),
					message : "Please choose or enter a dollar amount."
				});
				return returnObj;
			}

			// too non-dollar-y?
			if ( jQ('#other:checked').length && ! customSalsa.settings.regex.dollar.test( jQ('#amountOther', $form).val() ) ) {
				returnObj.isValid = false;
				returnObj.errors.push({
					value   : jQ('#amountOther', $form).val(),
					message : "Please enter a valid dollar amount."
				});
				return returnObj;
			}

			// too small?
			if ( +jQ('#amount', $form).val() + +jQ('#amountOther', $form).val() < minimumAmount ) {
				returnObj.isValid = false;
				returnObj.errors.push({
					value   : +jQ('#amount', $form).val() + +jQ('#amountOther', $form).val(),
					message : "Please enter a larger amount; minimum is $" + minimumAmount
				});
				return returnObj;
			}

			// too large?
			if ( +jQ('#amount', $form).val() + +jQ('#amountOther', $form).val() > maximumAmount ) {
				returnObj.isValid = false;
				returnObj.errors.push({
					value   : +jQ('#amount', $form).val() + +jQ('#amountOther', $form).val(),
					message : "Please enter a smaller amount; maximum is $" + minimumAmount
				});
				return returnObj;
			}

			return returnObj;
		},

		/**
		 * Validate a portion of things on a donation form, specifically things confined to a particular step
		 * on a multi-step form. Multi-step form creation still to be merged into customSalsa
		 */
		validateStep : function( stepNum, showErrors ) {
			var $step = jQ('.step' + stepNum),
				returnObj = { errors: [], isValid : true };

			// step1 just has amount
			if ( 1 === stepNum ) {
				// check the amount meets Salsa min or max config if present
				donationAmountValidation = this.isValidDonationAmount( $step.closest('form') );
				if ( !donationAmountValidation.isValid ) {
					returnObj.isValid = false;
					returnObj.errors.push.apply( returnObj.errors, donationAmountValidation.errors );
				}
			}
			// step2 has personal information, but no payment stuff
			else if ( 2 === stepNum ) {
				// Check all required input fields to ensure values are present/valid
				$step.find('.required').not('span').each(function(){
					var $input = jQ(this),
						label = 'Unknown';

					// fetch label/placeholder based on field type
					if ( $input.is('input') && $input.attr('placeholder') ) {
						label = $input.attr('placeholder');
					}	else if ( $input.is('select') ) {
						label = jQ('option:first-child', $input).text();
					}

					// test the value based on its type
					var validationType = customSalsa.getFieldValidationType( $input );
					if ( ! customSalsa.validateField( $input.val(), validationType ) ) {
						returnObj.isValid = false;
						returnObj.errors.push({
							element: $input,
							message: 'A valid ' + label + ' is required'
						});
					}
				});
			}
			// step3 just has payment stuff
			// this should never be invoked since the per-step validation only happens when moving forward
			else if ( 3 === stepNum ) {
				// check for valid-looking credit card numbers
				// @todo Make sure this checks the form for checks as well, not always is a CC required
				ccValidation = this.isValidCC( jQ('#cc_number'), jQ('#CVV2'), jQ('#cc_type') );
				if ( ! ccValidation.isValid ) {
					returnObj.isValid = false;
					returnObj.errors.push.apply( returnObj.errors, ccValidation.errors );
				}

				// Check for cc expiration
				// Again, we need to check on check vs. card first, technically
				expiryValidation = this.isValidCCExpiry( jQ('#ccExpMonth'), jQ('#ccExpYear') );
				if ( ! ccValidation.isValid ) {
					returnObj.isValid = false;
					returnObj.errors.push.apply( returnObj.errors, expiryValidation.errors );
				}
			}

			// same as validateDonationForm; move to separate method?
			if ( returnObj.isValid ) {
				return true;
			} else if ( showErrors ) {
				customSalsa.showErrors( returnObj );
				return false;
			} else {
				return returnObj;
			}
		},

		/**
		 * Validate ALL THE THINGS in a donation form
		 * Returns true or false
		 */
		validateDonationForm : function( formSelector, showErrors ) {

			formSelector = formSelector || 'form.orderform';
			var $form = jQ( formSelector ),
				returnObj = { errors: [], isValid : true },
				donationAmountValidation,
				ccValidation,
				expiryValidation;

			// Check all required input fields to ensure values are present/valid
			$form.find('.required').not('span').each(function(){
				var $input = jQ(this),
					label = 'Unknown';

				// We skip some fields because they're checked later via isValidCC
				if ( jQ.inArray( $input.attr('id'), ['CVV2','cc_number','cc_type','ccExpMonth','ccExpYear'] ) !== -1 ) return true;

				// fetch label/placeholder based on field type
				if ( $input.is('input') && $input.attr('placeholder') ) {
					label = $input.attr('placeholder');
				}	else if ( $input.is('select') ) {
					label = jQ('option:first-child', $input).text();
				}

				// switch from amount to amountOther if no amount before we do any testing
				if ( jQ(this).attr('id') === 'amount' && '' === $input.val().trim() ) {
					$input = jQ('#amountOther');
					label = "amount";
				}

				// debugging help
				if ( label === 'Unknown' ) console.log( $input );

				// test the value based on its type
				var validationType = customSalsa.getFieldValidationType( $input );
				if ( ! customSalsa.validateField( $input.val(), validationType ) ) {
					returnObj.isValid = false;
					returnObj.errors.push({
						element: $input,
						message: 'A valid ' + label + ' is required'
					});
				}
			});

			// check the amount meets Salsa min or max config if present
			donationAmountValidation = this.isValidDonationAmount( $form );
			if ( !donationAmountValidation.isValid ) {
				returnObj.isValid = false;
				returnObj.errors.push.apply( returnObj.errors, donationAmountValidation.errors );
			}

			// check for valid-looking credit card numbers
			// @todo Make sure this checks the form for checks as well, not always is a CC required
			ccValidation = this.isValidCC( jQ('#cc_number'), jQ('#CVV2'), jQ('#cc_type') );
			if ( ! ccValidation.isValid ) {
				returnObj.isValid = false;
				returnObj.errors.push.apply( returnObj.errors, ccValidation.errors );
			}

			// Check for cc expiration
			// Again, we need to check on check vs. card first, technically
			expiryValidation = this.isValidCCExpiry( jQ('#ccExpMonth'), jQ('#ccExpYear') );
			if ( ! ccValidation.isValid ) {
				returnObj.isValid = false;
				returnObj.errors.push.apply( returnObj.errors, expiryValidation.errors );
			}

			if ( returnObj.isValid ) {
				return true;
			} else if ( showErrors ) {
				customSalsa.showErrors( returnObj );
				return false;
			} else {
				return returnObj;
			}

		},

		/**
		 * Turn a donation form into a multistep
		 * This is extremely opinionated right now and needs to be made more configurable
		 */

		multistep : {

			init : function( strings ) {

				// setup strings
				customSalsa.donation.multistep.text = customSalsa.settings.multistepStrings;
				if ( 'object' === typeof strings ) {
					customSalsa.donation.multistep.text = jQ.extend(customSalsa.settings.multistepStrings, strings);
				}
				var text = customSalsa.donation.multistep.text;

				// setup progress div
				customSalsa.donation.multistep.$progress = jQ('<div/>')
					.addClass('progress-wrapper')
					.append('<ul class="progress-meter" />')
					.children('ul')
					.append('<li class="step-1">' + text.step1_progress + '</li>')
					.append('<li class="step-2">' + text.step2_progress + '</li>')
					.append('<li class="step-3">' + text.step3_progress + '</li>')
					.end();

				// setup secure icon
				customSalsa.donation.multistep.$secure = jQ('<div/>')
					.addClass('secure')
					.append( customSalsa.donation.multistep.text.secure )
					.append('<i class="icon-lock"></i>');

				// setup step divs
				customSalsa.donation.multistep.$step1 = jQ('<div/>').addClass('step1 single-step').data('step',1);
				customSalsa.donation.multistep.$step2 = jQ('<div/>').addClass('step2 single-step').data('step',2);
				customSalsa.donation.multistep.$step3 = jQ('<div/>').addClass('step3 single-step').data('step',3);
				customSalsa.donation.multistep.$step1inner = jQ('<fieldset>');
				customSalsa.donation.multistep.$step2inner = jQ('<fieldset>');
				customSalsa.donation.multistep.$step3inner = jQ('<fieldset>');

				/**
				 * Helper functions
				 */

				customSalsa.donation.multistep.initForm();
				customSalsa.donation.multistep.attachBehaviors();

			},

			// create the multistep form stuff
			initForm : function() {
				/**
				 * Populate divs
				 */
				customSalsa.donation.multistep.buildStep1();
				customSalsa.donation.multistep.buildStep2();
				customSalsa.donation.multistep.buildStep3();

				/**
				 * Compile the three steps into a box
				 */
				var $box = jQ('<div id="step-box" />'),
					$steps = jQ('<div class="steps" />');
				customSalsa.donation.multistep.$step1.append( customSalsa.donation.multistep.$step1inner );
				customSalsa.donation.multistep.$step2.append( customSalsa.donation.multistep.$step2inner );
				customSalsa.donation.multistep.$step3.append( customSalsa.donation.multistep.$step3inner );
				$steps.append( customSalsa.donation.multistep.$step1, customSalsa.donation.multistep.$step2, customSalsa.donation.multistep.$step3 );
				$box.append( customSalsa.donation.multistep.$progress, customSalsa.donation.multistep.$secure, $steps );

				//hide the regular form stuff, then put our box in it.
				jQ('form.orderform > *:visible').hide();
				jQ('form.orderform').prepend( $box );
				jQ('form.orderform').prepend( '<h1>' + customSalsa.donation.multistep.text.title + '</h1>' );

				customSalsa.donation.multistep.setupStep1();

				//other layout tweaks
				jQ('#salsa').wrap('<div class="salsa-outer" />');
				jQ('#salsaDonationFooter').wrap('<div class="salsaFooterWrapper"></div>').parent().insertAfter('.salsa-outer');

				//minimum
				if ( ! jQ('input[name="amountMinimum"]').length ) {
					jQ('form.orderform').append('<input name="amountMinimum" type="hidden" value="2">');
				}
			},

			// Ready Step 1 pane (set heights, classes, etc)
			setupStep1 : function() {
				//set step-1 as active
				jQ('#step-box *').removeClass('active');
				jQ('.step-1, .step1').addClass('active');
				jQ('#step-box').data('currentStep', 1);

				//get heights and hide
				jQ('.single-step').show();
				var step1height = jQ('.step1').outerHeight(),
					step2height   = jQ('.step2').outerHeight(),
					step3height   = jQ('.step3').outerHeight(),
					introHeight   = jQ('.progress-wrapper').outerHeight() + jQ('.secure').outerHeight() + jQ('form > h1').outerHeight(),
					formMaxHeight = Math.max(step1height, step2height, step3height) + introHeight + 40;

				jQ('form.orderform').css('height', formMaxHeight);
				jQ('.steps').height( step1height );
				jQ('.step2, .step3').hide();
			},

			// Build Step 1 pane
			buildStep1 : function() {
				var $step1inner = customSalsa.donation.multistep.$step1inner,
					amounts = customSalsa.donation.multistep.getDonationAmounts(),
					text = customSalsa.donation.multistep.text;
				$step1inner.append('<h2>' + customSalsa.donation.multistep.text.amount_label + '</h2>');
				jQ('#pre_donation_text').appendTo( $step1inner );
				$step1inner.append('<div class="amounts"/>');
				jQ.each( amounts, function(index, value) {
					jQ('.amounts', $step1inner).append('<button class="button" value="' + value + '">$' + value + '</button>');
				});
				// @todo: should change type to number if on mobile...
				if ( jQ('input[name="amountOther"]').length ) {
					minimumAmount = Math.max( 2, +jQ('input[name="amountMinimum"]').val() );
					jQ('.amounts', $step1inner).append('<div class="other"><label for="amountOther">' + text.other_label + '</label><input type="text" name="amountOther" id="amountOther" placeholder=""></div>');
				}
				if ( jQ('#recurrence').length ) {
					jQ('.amounts', $step1inner).append('<section class="recurring"><div class="checkrow"><input type="checkbox" name="recurring" id="recurring" value="0"><label for="recurring">' + text.monthly + '</label><input id="TERM" name="TERM" type="hidden" value="9999"><input id="PAYPERIOD" name="PAYPERIOD" type="hidden" value="MONT"></div></section>');
				}
				$step1inner.append('<div class="step-actions"><button class="formnav">' + text.step1_button + "</button></div>");

				//destroy Salsa fields & replace with ours
				jQ('input[name="amount"], #recurrence, .otherRow').remove();
				$step1inner.append('<input type="hidden" name="amount" id="amount" value="" class="required" placeholder="Amount">');
			},

			// Build Step 2 pane
			buildStep2 : function() {

				var $step2inner = customSalsa.donation.multistep.$step2inner,
					amounts = customSalsa.donation.multistep.getDonationAmounts(),
					text = customSalsa.donation.multistep.text;

				$step2inner.append('<h2>' + text.details_label + '</h2>');
				$step2inner.append('<div class="details"/>');

				// get the 'your information' fields - maybe abstract into a function?
				$normalInputs = customSalsa.donation.multistep.getFormRows( '.supporterInfo > .diaFields' );
				jQ('.details', $step2inner).append( $normalInputs );

				jQ("[name='First_Name'], [name='Last_Name'], [name='City']", $step2inner).addClass('half');
				jQ("[name='Zip'], [name='Country']", $step2inner).addClass('small');
				jQ("[name='State']", $step2inner).addClass('tiny');
				jQ("[name='Email']", $step2inner).addClass('medium required-email').attr('type', 'email');

				//do we have custom fields? If so, add those
				if ( jQ('#preCustomText').length ) {
					jQ('#preCustomText').appendTo( $step2inner );
				}
				if ( jQ('#customFields').length ) {
					$step2inner.append('<div class="custom-fields"/>');
				}
				$customFields = customSalsa.donation.multistep.getFormRows( '#customFields' );
				jQ('.custom-fields', $step2inner ).append( $customFields );

				//do we have extra honor/designee fields? if so, add headers
				if ( jQ('#honorof, #designationcode').length ) {
					$step2inner.append('<h2 class="extra">' + text.extra_label + '<span>' + text.extra_extra + '</span></h2><div class="honors"></div>');
				}
				// add in-honor-of or in-memory-of fields (but not both)
				if ( jQ('#In_Honor_name') ) {
					jQ('.honors', $step2inner).append('<input name="In_Honor_Name" placeholder="' + text.extra_name_label + '" id="honor-name" class="extra-input half" type="text">');
					jQ('.honors', $step2inner).append('<input name="In_Honor_Email" placeholder="' + text.extra_email_label + '" id="honor-email" class="extra-input half" type="email">');
					jQ('.honors', $step2inner).append('<input name="In_Honor_Address" placeholder="' + text.extra_addy_label + '" id="honor-address" class="extra-input" type="text">');
				} else if ( jQ('#In_Memory_Name').length ) {
					jQ('.honors', $step2inner).append('<input name="In_Memory_Name" placeholder="' + text.extra_name_label + '" id="memory-name" class="extra-input" type="text">');
				}
				//add designation codes
				var $code = jQ();
				if ( jQ('#Designation_Code').length ) {
					if ( text.code_options.length ) {
						$code = jQ('<select>')
							.attr('id', 'code-dropdown')
							.prepend('<option value="">' + text.code_label + '</option>');

						jQ.each( text.code_options, function(i,val) {
							$code.append('<option>' + val + '</option>');
						});

					} else {
						$code = jQ('<input type="text" id="code-text" placeholder="' + text.code_label + '">');
					}
					$code.attr('name', 'Designation_Code');
					$step2inner.append( $code.wrap('<div class="dcode">').parent() );
					//fix inputs
					jQ('input:not([type])', $step2inner).attr('type','text');
				}

				//oneID form
				if ( jQ('#one_id').length ) {
					var $oneid = jQ('<section class="oneid"><div class="checkrow"></div></section>');
					jQ('#createOneID').appendTo( jQ('div', $oneid) );
					jQ('div', $oneid).append('<label for="createOneID">' + text.remember + '</label>');
					jQ('#one_id a:first').appendTo( jQ('div', $oneid));
					$step2inner.append( $oneid );
				}

				//next button for step 2
				$step2inner.append('<div class="step-actions"><button class="formnav">' + text.step2_button + "</button></div>");
			},

			// Build Step 3 pane
			buildStep3 : function() {

				var $step3inner = customSalsa.donation.multistep.$step3inner,
					text = customSalsa.donation.multistep.text;

				$step3inner.append('<h2>' + text.payment_label + '</h2>');
				$step3inner.append( jQ('#credit_card_information') );
				if ( jQ('#presubmit_footer').length ) {
					$step3inner.append('<section class="presumbit"></section>');
					jQ('section', $step3inner).append(jQ('#presubmit_footer'));
				}
				jQ('#cc_number', $step3inner).attr('placeholder', 'Credit Card Number').attr('maxlength','19').addClass('required');
				jQ('#CVV2', $step3inner).attr('placeholder', 'CVV').attr('type','text').addClass('required');
				jQ('#ccExpMonth > option:first', $step3inner).text('Expiration Month').parent().addClass('required');
				jQ('#ccExpYear > option:first', $step3inner).text('Exp. Year').parent().addClass('required');
				jQ('a[target]', $step3inner).insertAfter( jQ('#CVV2', $step3inner) );
				$step3inner.append('<div class="step-actions"><button class="submit">' + text.step3_button + "</button></div>");
			},

			// Get an array of the available donation amounts
			getDonationAmounts : function() {
				var amounts = [];
				jQ("input[name='amount']").each( function() {
					if ( jQ(this).val() ) {
						amounts.push( jQ.trim( jQ(this).val() ) );
					}
				});
				return amounts;
			},

			// get formRow (usually personal info fields and return as array of jQ objects
			getFormRows : function( selector ) {
				var $return = jQ();
				jQ('.formRow', jQ(selector)).each( function() {
					var $this = jQ(this),
						placeholder = jQ('label', $this).text().replace('*',''),
						isRequired = jQ('span.required', $this).length,
						$input = jQ('input', $this);
					if ( !$input.length ) {
						$input = jQ('select', $this);
						jQ('option:first', $input).remove();
						$input.prepend('<option value="">' + placeholder + '</option>');
					} else {
						$input.attr('placeholder', placeholder);
					}
					if ( isRequired ) $input.addClass('required');
					$return = $return.add( $input );
				});
				return $return;
			},

			// get the current height of the step/pane
			getStepHeight : function( $obj ) {
				//easy if it's showing
				if ( $obj.is(':visible') ) return $obj.outerHeight();
				//otherwise, show it to get height, then hide it
				var oldCSS = $obj.attr('style');
				$obj.css({
					position: 'absolute',
					visibility: 'hidden',
					display: 'block'
				});
				var height = $obj.outerHeight();
				$obj.attr("style", oldCSS ? oldCSS : "");
				return height;
			},

			// behaviors for clicking, validation, moving from step to step, etc
			attachBehaviors : function() {
				// kill button defaults
				jQ('#step-box button').on('click', function(e) {
					e.preventDefault();
				});

				//step transitions for big buttons at bottom of each step
				jQ('.formnav').on('click', function() {
					var $curStep = jQ(this).closest('.single-step'),
						$nextStep  = $curStep.next('.single-step'),
						newHeight  = customSalsa.donation.multistep.getStepHeight( $nextStep ),
						isValid    = customSalsa.donation.validateStep( parseInt( jQ('#step-box').data('currentStep') ) );

					// make sure the current step is valid before doing anything
					if ( isValid !== true ) {
						customSalsa.donation.multistep.displayErrors( isValid );
						return;
					} else {
						// hide any lingering error messages
						jQ('.alert-error').slideUp('fast', function() { jQ(this).remove(); } );
					}

					$curStep.animate({left: '-200px'},{queue:false}).fadeOut('normal',function(){ jQ(this).css('left',0); });
					$nextStep.css('left','200px').animate({left:'0'}, {queue:false}).fadeIn('normal');
					jQ('.steps').height( newHeight );

					jQ('.progress-meter > li').removeClass('active');
					jQ('li.step-' + $nextStep.data('step')).addClass('active');
					jQ('#step-box').data('currentStep', $nextStep.data('step'));
				});

				//step transitions for progress-meter
				jQ('.progress-meter>li').on('click', function() {
					if ( jQ(this).hasClass('active')) return;
					var $curStep = jQ('.steps > .step' + jQ('#step-box').data('currentStep') ),
						newStepNum = parseInt( jQ(this).attr('class').slice(-1) ),
						$newStep   = jQ('.steps > .step' + newStepNum ),
						newHeight  = customSalsa.donation.multistep.getStepHeight( $newStep ),
						isValid    = customSalsa.donation.validateStep( parseInt( jQ('#step-box').data('currentStep') ) );

					// make sure the current step is valid before doing anything
					if ( newStepNum > parseInt( jQ('#step-box').data('currentStep') ) && isValid !== true ) {
						customSalsa.donation.multistep.displayErrors( isValid );
						return;
					} else {
						// hide any lingering error messages
						jQ('.alert-error').slideUp('fast', function() { jQ(this).remove(); } );
					}

					if ( newStepNum > jQ('#step-box').data('currentStep') ) {
						$curStep.animate({left: '-200px'},{queue:false}).fadeOut('normal',function(){ jQ(this).css('left',0); });
						$newStep.css('left','200px').animate({left:'0'}, {queue:false}).fadeIn('normal');
					} else {
						$curStep.animate({left: '200px'},{queue:false}).fadeOut('normal',function(){ jQ(this).css('left',0); });
						$newStep.css('left','-200px').animate({left:'0'}, {queue:false}).fadeIn('normal');
					}
					jQ('.steps').height( newHeight );

					jQ('.progress-meter > li').removeClass('active');
					jQ(this).addClass('active');
					jQ('#step-box').data('currentStep', newStepNum);
				});

				//amount selector behaviors
				jQ('.amounts > button').on('click', function() {
					var $this = jQ(this);
					// already set
					if ( $this.hasClass('active') ) return;
					jQ('.amounts > button').removeClass('active');
					$this.addClass('active');
					jQ('#amount').val( $this.val() );
					jQ('#amountOther').val('');
				});

				//other amount behaviors
				jQ('#amountOther').on('focus', function() {
					jQ('.amounts > button').removeClass('active');
					jQ('#amount').val( '' );
				}).on('blur', function() {
					//validate
					donationAmountValidation = customSalsa.donation.isValidDonationAmount();
					if ( !donationAmountValidation.isValid ) {
						alert('Please enter a valid dollar amount.');
						jQ(this).focus();
						if ( !jQ(this).is(':visible') ) jQ('.step-1').trigger('click');
					}
				});

				//recurring checkbox
				jQ('#recurring').on('change', function() {
					var $this = jQ(this);
					if ( $this.is(':checked') ) {
						$this.val('1');
					} else {
						$this.val('0');
					}
				});

				//sanitize CC value to strip spaces and slashes, etc
				jQ('#cc_number').on('blur', function() {
					var $this = jQ(this);
					$this.val( $this.val().replace(/\D/g, '') );
				});

				//failed fields unfailed on change
				jQ('form.orderform').on('change keypress paste textInput input', '.failed', function() {
					jQ(this).removeClass('failed');
				});

		    //perform validation
		    jQ('.step-actions .submit').on('click', function() {
			    customSalsa.donation.magicSetCCtype();
		    	var isValidForm = customSalsa.donation.validateDonationForm();
		    	if ( isValidForm === true ) {
		    		jQ('form.orderform').submit();
		    	} else {
		    		//handle our validateForm() error object
		    		customSalsa.donation.multistep.displayErrors( isValidForm );
		    	}
		    });

				//resizing watcher
				jQ(window).on('resize', function() {
					var $win = jQ(this);
					jQ('#amountOther').css('width', (jQ('.amounts>.other').width() - jQ('.other>label').outerWidth() - 9) + "px");
					if ( $win.width() <= customSalsa.donation.multistep.text.mobileBreakpoint ) {
						jQ('.steps, form.orderform').removeAttr('style');
					}
					//if going from mobile stack to multistep
					else if ( $win.data('currentWidth') <= customSalsa.donation.multistep.text.mobileBreakpoint ) {
						setupStep1();
					}
					$win.data('currentWidth', $win.width() );
				}).trigger('resize');
			},

			// Output errors specific for the multistep form
			displayErrors : function( errorObj ) {

				Q('.alert-error').remove();	//destroy old error stuff
				window.location.hash = '#error-box';
				jQ('.failed').removeClass('failed');

				var $errorBox = jQ('<div id="error-box" />').addClass('alert alert-error').append('<ul />'),
					message = 'There are problems with your submission';
				if ( errorObj.errors && errorObj.errors.length === 1 ) {
					message = 'There is a problem with your submission';
				}

				$errorBox.prepend('<h4>' + message + '</h4>');

				jQ.each( errorObj.errors, function(index,val) {
					jQ('ul', $errorBox).append('<li>' + val.message + '</li>');
					if ( val.element ) val.element.addClass('failed');
				});

				$errorBox
					.css('width', jQ('#salsa').width() - jQ('form.orderform').outerWidth(true) - 30)
					.insertBefore('form.orderform');

				if ( errorObj.errors.length === 1 ) {
					if ( errorObj.errors[0].element.is(':hidden') ) {
						var newStep = errorObj.errors[0].element.closest('.single-step').data('step');
						jQ('.step-' + newStep).trigger('click');
					}
					errorObj.errors[0].element.focus();
				}
				// scroll back up to errors on mobile
				if ( jQ('window').width() <= text.mobileBreakpoint ) {
					jQ('html, body').animate( { scrollTop: jQ('#error-box').offset().top - 15 }, 400);
				}
			}

		} // END multistep

	}, // END donation

	/**
	 * MOBILIZR
	 */
	mobilizr: {

		/**
		 * Converts input types to mobile-friendly versions where appropriate
		 * Relies on mediaCheck https://github.com/sparkbox/mediaCheck
		 * EXTREMELY DANGEROUS. Salsa uses an old version of jQuery that can't properly .serialize() inputs with HTML5 types
		 * As a result, they're not submitted. Stuff breaks. It's bad.
		 * @todo would be to redefine the Salsa function that calls serialize() to have it use jQ instead of s$.
		 */
		mobilizeInputTypes : function( width, config ) {

			config = typeof config !== 'object' ? config : customSalsa.settings.mobilizeConversions ;
			width = typeof width !== 'number' ? width : customSalsa.settings.mobilizeBreak ;

			// we need mediaCheck!
			if ( typeof mediaCheck !== 'function' ) return false;

			// don't do this on actions
			// Salsa calls .serialize() in jQuery 1.3.2, which is so old it doesn't know about HTML5 input types and skips them
			// That causes data to not be submitted to Salsa, which is (ahem) problematic.
			// Probably could stand to have a more robust approach to this, but at least we've got something.
			if ( page.indexOf( '/action' > 1 ) ) return false;

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
		}

	}

};

/**
 * Give ourselves a modern version of jQuery if we need it... (defaults to 1.11.3)
 */
if ( typeof jQ !== 'object' || typeof jQ.fn.jquery !== 'string' ) {
	customSalsa.initJQ();
}