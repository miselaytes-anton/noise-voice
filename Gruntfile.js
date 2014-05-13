module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
	concat: {
		options: {
		  separator: ';',
		},
		dist: {
		  src: [ "public/_/js/*.js" ],
		  dest: "public/js/main.js"
		}
	},
	uglify: {
		production: {
		  files: [
                {
                    src: ["public/js/main.js"],
                    dest: ["public/js/main.min.js"]
                }
			]
		  
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
				tasks: ['concat']
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