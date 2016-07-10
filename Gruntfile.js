module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
             target: {
                files:["libsclient/*.js","skin/*.css"],
                tasks:["cssmin","uglify"]
             }
        },

        cssmin: {
            combine: {
                files: {
                    "static/styles/skin.min.css": ["skin/reset.css", "skin/custom.css"]
                }
            }
        },

        uglify: {
            options: { mangle: false },
            target: {
                files: {
                    "static/scripts/libs.min.js": [
                        "libsclient/chatclient.js",
                        "libsclient/cortex.js"
                    ]
                }
            }
        }

    });

    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.registerTask("default",["watch"]);
}