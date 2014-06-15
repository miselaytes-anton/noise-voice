module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
	concat: {
		options: {
		  separator: ';',
		},
		my: {
		  src: [ "public/_/js/*.js" ],
		  dest: "public/js/main.js"
		},
		lib: {
			src: [ 
					"public/_/js/lib/jquery.js",
					"public/_/js/lib/adapter.js",
					"public/_/js/lib/tuna.js",
					"public/_/js/lib/bootstrap/tooltip.js",
					"public/_/js/lib/bootstrap/popover.js"
				],
			dest: "public/js/lib.js"
		}
	},

	uglify: {
		my: {
		  files: {
			'public/js/main.min.js': ['public/js/main.js']
		  }
		},
		lib: {
		  files: {
			'public/js/lib.min.js': ['public/js/lib.js']
		  }
		}
	},
	
	less: {
		development: {
			files: {
			  "public/css/style.css": "public/_/less/style.less"
			}
		}
	},
	watch :{
			less:{
				files: ['public/_/less/*.less'],
				tasks: ['less']
			},
			js: {
				files: [ 'public/_/js/*.js' ],
				tasks: ['concat:my']
			}
	}
  });

  // Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
  // Default task(s).
	grunt.registerTask('default', ['less']);
	//grunt.registerTask('less', ['less']);
	
};