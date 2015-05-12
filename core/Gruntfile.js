'use strict';

module.exports = function (grunt) {

	// Load all tasks
	require('load-grunt-tasks')(grunt);

	// Show elapsed time
	require('time-grunt')(grunt);

	grunt.initConfig({

		// Watches files for changes and runs tasks based on the changed files
		watch : {
			compass	 : {
				files: ['sass/{,*/}*.{scss,sass}'],
				tasks: ['compass']
			},
			js				: {
				files: ['<%= jshint.all %>'],
				tasks: ['jshint', 'uglify']
			},
		},


		// javascript linting with jshint
		jshint : {
			options: {
				jshintrc: '.jshintrc',
				"force" : true
			},
			all		: [
				'js.src/*.js'
			]
		},

		// Compiles Sass to CSS and generates necessary files if requested
		compass : {
			dist: {
				options: {
					sassDir                 : 'sass',
					cssDir                  : 'css',
					generatedImagesDir      : 'images/generated',
					imagesDir               : 'images',
					javascriptsDir          : 'js.src',
					fontsDir                : 'fonts',
					httpImagesPath          : 'images',
					httpGeneratedImagesPath : 'images/generated',
					httpFontsPath           : 'fonts',
					relativeAssets          : false,
					assetCacheBuster        : false,
					raw                     : 'Sass::Script::Number.precision = 8\n',
					require                 : ['compass-normalize'],
					force                   : true,
					outputStyle             : 'compressed',
					debugInfo               : false
				}
			}
		},

		// uglify to concat, minify, and make source maps
		uglify : {
			options: {
				sourceMap: false,
				beautify : false,
				preserveComments: false,
				compress: {
					drop_console: true
				}
			},
			dist: {
				files	: {
					'js.dist/library.js' : [
						'js.src/mediaCheck.js',
						'js.src/customSalsa.js',
						'js.src/plugins/*.js'
					],
					'js.dist/main.js' : [
						'js.src/main.js'
					],
					'js.dist/libs.js' : [
						'js.src/extras/*.js'
					]
				}
			}
		}

	});

	// Register tasks
	grunt.registerTask('default', [
		'watch'
	]);

	grunt.registerTask('css', [
		'compass',
	]);

	grunt.registerTask('js', [
		'jshint',
		'uglify'
	]);
};
