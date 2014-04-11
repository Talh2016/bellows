module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        localConfig: (function(){ 
                        try { 
                            return grunt.file.readJSON('localConfig.json') 
                        } catch(e) {
                            return {};
                        }
                    })(),
        releaseName: '<%= pkg.name %>-<%= pkg.version %>',
        releaseMessage: '<%= pkg.name %> release <%= pkg.version %>',
        clean: {
            buildProducts: "build/"
        },
        connect: {
            server: {
                options: {
                    hostname: '0.0.0.0',
                    port: 3000,
                    base: '.'
                }
            }
        },
        watch: {
            files: ["src/**/*"],
            tasks: ['build']
        },
        copy: {
            main: {
                files: [
                    {expand: true, flatten: true, src: ['src/**'], dest: 'build/', filter: 'isFile'}
                ]
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/bellows.js',
                dest: 'build/bellows.min.js'
            }
        },
        cssmin: {
            core: {
                src: 'src/bellows.css',
                dest: 'build/bellows.min.css'
            },
            style: {
                src: 'src/bellows-style.css',
                dest: 'build/bellows-style.min.css'
            }
        },
        zip: {
            "build/bellows.zip": ["src/bellows.js", "src/bellows.css", 
            "src/bellows-style.css"]
        },
        s3: {
            key: '<%= localConfig.aws.key %>',
            secret: '<%= localConfig.aws.secret %>',
            bucket: '<%= localConfig.aws.bucket %>',
            access: "public-read",
            headers: { "Cache-Control": "max-age=1200" },
            upload: [
                { // build
                    src: "build/*",
                    dest: "modules/bellows/<%= pkg.version %>/",
                    rel: "build"
                }
            ]
        },
        release: {
            options: {
                folder: '.',
                npm: false,
                github: {
                    repo: 'mobify/bellows',
                    usernameVar: 'GITHUB_USERNAME',
                    passwordVar: 'GITHUB_TOKEN'
                }
            }
        }
    });

    // Load the task plugins
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-css');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-zip');
    grunt.loadNpmTasks('grunt-s3');
    grunt.loadNpmTasks('grunt-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-release');

    // Default task(s).
    grunt.registerTask('serve', ['connect', 'watch']);
    grunt.registerTask('build', ['copy', 'uglify', 'cssmin', 'zip']);
    grunt.registerTask('publish' ['build', 'release', 's3'])
    grunt.registerTask('default', 'build');

};
