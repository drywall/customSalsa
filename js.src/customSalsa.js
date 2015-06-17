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
		}
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

			// some actions are bad
			if ( jQ('body').hasClass('action') ) return false;

			)
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
 * Give ourselves a modern version of jQuery if we need it... (defaults to 1.11.2)
 */
if ( typeof jQ !== 'object' && typeof jQ.fn.jquery !== 'string' ) {
	customSalsa.initJQ();
}