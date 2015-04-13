module.exports = {
	dist: {
		nonull: true,
		files: [
			// Include our bower JS dependencies
			// angular
			{
				src: "bower_components/angular/angular.js",
				dest: "src/vendor/angular/angular.js"
			},
			{
				src: "bower_components/angular-animate/angular-animate.js",
				dest: "src/vendor/angular/angular-animate/angular-animate.js"
			},
			{
				src: "bower_components/angular-cookies/angular-cookies.js",
				dest: "src/vendor/angular/angular-cookies/angular-cookies.js"
			},
			{
				src: "bower_components/angular-resource/angular-resource.js",
				dest: "src/vendor/angular/angular-resource/angular-resource.js"
			},
			{
				src: "bower_components/angular-sanitize/angular-sanitize.js",
				dest: "src/vendor/angular/angular-sanitize/angular-sanitize.js"
			},
			{
				src: "bower_components/angular-touch/angular-touch.js",
				dest: "src/vendor/angular/angular-touch/angular-touch.js"
			},

			// bootstrap
			{
				src: "bower_components/bootstrap/dist/js/bootstrap.js",
				dest: "src/vendor/jquery/bootstrap.js"
			},
			// libs
			{
				src: "bower_components/moment/min/moment.min.js",
				dest: "src/vendor/libs/moment.min.js"
			},
			// core
			{
				src: "bower_components/angular-ui-router/release/angular-ui-router.js",
				dest: "src/vendor/angular/angular-ui-router/angular-ui-router.js"
			},
			{
				src: "bower_components/angular-bootstrap/ui-bootstrap-tpls.js",
				dest: "src/vendor/angular/angular-bootstrap/ui-bootstrap-tpls.js"
			},
			{
				src: "bower_components/angular-ui-utils/ui-utils.js",
				dest: "src/vendor/angular/angular-ui-utils/ui-utils.js"
			},
			{
				src: "bower_components/ngstorage/ngStorage.js",
				dest: "src/vendor/angular/ngstorage/ngStorage.js"
			},
			{
				src: "bower_components/oclazyload/dist/ocLazyLoad.js",
				dest: "src/vendor/angular/oclazyload/ocLazyLoad.js"
			}
		]
	}
};