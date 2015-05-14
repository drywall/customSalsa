# customSalsa #

CustomSalsa is a bundle of utilities for enhancing pages from Salsa Labs' Cosm product. It mostly consists of a large JavaScript object, called `customSalsa`, along with some basic CSS. 

### Use at your own risk ###

This code is *highly experimental* at this point and not recommended for live sites. It's more of a public sandbox at the moment.

### How would you use it? ###

If you're feeling brave, feel free to clone/fork and play around. You'll need an environment that supports Grunt and Compass in order to do much. 

Use the `grunt` commands (watch/css/js) to compile CSS and minify JS as needed.

[js.src/customSalsa.js](js.src/customSalsa.js) is where the guts live. Basically, that file creates an singleton JS object `customSalsa` that in turn loads v1.11.2 of jQuery as the object `jQ` (rather than the more-familiar `$` or `jQuery`). This prevents collisions of problems with the ancient (1.3.2) version of jQuery that Salsa automatically loads.

Once `customSalsa` is instantiated, use main.js to start invoking various methods that will do various and interesting things to your Salsa pages. See [main.js](main.js) for a very basic example.

So basically: include [js.dist/library.js](js.dist/library.js) in your template, then edit to your own needs and include js.dist/main.js as well. For styling, add your own version of [css/style.css](css/style.css) to your template as well, compiling it from the sass files.

### Method & Property Inventory ###

This is a rough overview of the methods and properties of the `customSalsa` object that is created.

##### settings #####

This contains a large number of values customSalsa consults in the course of doing various things; overwrite these stock values to change the defaults. 

A full enumeration of all the settings and their uses is forthcoming. Eventually.

##### status #####

This is essentially a private object that stores various state changes so that various one-time methods aren't repeatedly invoked by accident.

##### initJQ #####

Method that loads jQuery and maps it to `jQ`. This method is called at the end of the file.

##### watchAJAX #####

This implements a number of custom jQuery event triggers on `document` in response to Salsa's built-in AJAX calls (most of which are a part of the advocacy module). Use these to trigger your own custom jQuery reactions to Salsa events. 

##### addBodyClass #####

Lifted from [cosm-body-classes](https://github.com/drywall/cosm-body-classes), this method adds a css class (or two) to the `<body>` element based on the kind of page it detects is being rendered. This provides a great way to target CSS to particular page types: make donation form inputs look one way, and advocacy forms another!

##### activeLabels #####

This adds CSS classes `checked` or `unchecked` to `<label>` elements that are tied to radio buttons. Useful for styling: you can hide your radio button <input>s entirely and style up your labels to look like buttons themselves! Pretty cool. See it in action at [...]

##### placeholderLabels #####

Salsa's forms don't include the wonderful HTML5 `placeholder` attribute. While we could add one (and maybe we will add that to customSalsa eventually), one elegant workaround is to style and position the labels so they look and act like placeholders. This method invokes the show/hide behavior; SASS is forthcoming to style & position them (or write your own!)

##### hideSelectLabels ######

When using placeholderLabels, it looks weird to have `<select>` elements with labels showing. This hides them. 

##### addCSSHelpers #####

Method that adds a smattering of CSS classes to Salsa's markup to facilitate styling. Needs more work still.

##### addMissingInputTypes #####

Whoever built Cosm wasn't very diligent about remembering to include the `type="text"` attribute on various inputs, which can be super-annoying when trying to style different kinds of <input>s differently. This helps by adding it. Note that it's not state-aware; if a new input is added to the DOM via AJAX you'll need to reset customSalsa.status.addMissingInputTypes and call this again. We should probably improve this...

##### getFieldValidationType #####

Private method used by other methods to determine what counts as "valid" for a given input.

##### validateField #####

Private method used by other methods to validate an individual field's value based on its contents and type.

##### advocacy.validateSupporterFields #####

Why wait for Salsa to make its AJAX calls before alerting users to missing/incomplete information? Do it on form submit with this!

##### advocacy.getRequiredFields #####

Private helper method for the above. 

##### donation.magicSetCCtype #####

It's 2015. Users shouldn't have to manually identify their credit card type: If they're entered a valid number, it's easy to determine the type. Hide the usual Salsa type stuff and call this on donation form submit. Less work for users! 

##### donation.isValidLuhn #####

Private method that runs user-inputted credit card number through the [Luhn checksum](https://www.wikiwand.com/en/Luhn_algorithm). Doesn't guarantee a number is valid, but helps suss out blatantly invalid ones.

##### donation.isValidABA #####

Like the above, but for bank routing numbers. Per [Brainjar.com](http://www.brainjar.com/js/validation/).

##### donation.isValidCC ######

Performs a Luhn check on the credit card number as well as checking the length/format of the CVV to make sure it corresponds to the card type.

##### donation.validateForm #####

Checks that all required fields are valid, payment info is good, etc. on a donation form. Call this on form submit so your users don't have to wait for Salsa's response! (Note: doesn't check everything quite yet)

##### donation.lightbox.init #####

Implements a lightbox on the donation form that will prompt for a recurring gift if the user opts to give a single gift when initially submitting the form. Highly configurable and proven to increase giving, but may not work in all situations (currently under refinement). Make sure you've got _lightbox.sass compiled into your CSS or this will be a disaster.

##### donation.lightbox.updateTracking #####

Helper method for the lightbox, will push events into Google Analytics based on user interactions with the lightbox. Will also update Donation_Tracking_Code input field in Salsa.

##### mobilizr.init #####

Basically a wrapper around several other methods that improve CSS targeting, which in turn helps facilitate better mobile responsiveness. Best in combination with _mobilizr.sass.

##### mobilizr.mobilizeInputTypes #####

Changes the input type of some form fields from 'text' to more HTML5-appropriate values (e.g. 'email') to facilitate user input on touch devices. 
