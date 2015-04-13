module.exports = {
	options: {
		stripBanners: false,
		banner: '/*!\n' +
		' * <%= package.author.name %>: <%= package.description %>\n' +
		' * @author <%= package.author.email %>\n' +
		' * @version <%= package.version %>\n' +
		' * @link <%= package.author.url %>\n' +
		' * @license Unauthorized copying of this file, via any medium is strictly prohibited.\n' +
		' * This file cannot be copied and/or distributed without express written consent from @author.\n' +
		' * @builddate <%= grunt.template.today("yyyy/mm/dd") %>\n' +
		' */\n\n',
		process: function(src, filepath) {
			return '// Source: ' + filepath + '\n' +
				src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
		},
	},
	dist: {
		files: {
			'assets/js/angular.js': [
				"src/vendor/angular/*.js",
				"src/vendor/angular/**/*.js"
			],
			'assets/js/vendor.js': [
				"src/vendor/inview/angular-inview.js"
			],
			'assets/js/libs.js': [
				"src/js/libs/app.plugin.js",
				"src/js/libs/app.js"
			],
			'assets/js/controllers.js': [
				"src/js/controllers/*.js"
			],
			'assets/js/directives.js': [
				"src/js/directives/*.js"
			],
			'assets/js/filters.js': [
				"src/js/filters/*.js"
			],
			'assets/js/services.js': [
				"src/js/services/*.js"
			],
			'assets/js/app.js': [
				"src/js/*.js"
			]
		}
	}
};