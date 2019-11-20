module.exports = function (grunt) {
    // 우리가 지은 이름과 태스크 이름을 구분하기 어려워서
    // 우리가 지은 이름에는 언더바(_)를 붙임

    grunt.initConfig({

        concurrent: {
            BUILD_ON_SAVE: {
                tasks: ['watch', 'exec:TSC_W'],
                options: { logConcurrentOutput: true }
            }
        },

        // https://github.com/gruntjs/grunt-contrib-watch
        watch: {
            JUL8_SAMPLE: {
                files: ["Sample/html/sample_templates.html"],
                tasks: ["exec:JUL8_SAMPLE"],
            }
        },      

        // https://www.npmjs.com/package/grunt-exec
        exec: {
            JUL8_SAMPLE: {
                cwd: '.',
                command: '"Compiler/bin/Jul8Compiler.exe" "Sample/jul8config.json"'
            },
            TSC_W: {
                cwd: '.',
                command: 'node_modules\\.bin\\tsc -b Sample -w'
            },
            TSC_FORCE: {
                cwd: '.',
                command: 'node_modules\\.bin\\tsc -b Sample --force'
            }
        },
    });

    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('BUILD_ON_SAVE', [
        'concurrent:BUILD_ON_SAVE'
        ]);

    grunt.registerTask('REBUILD', [
        'exec:JUL8_SAMPLE',
        'exec:TSC_FORCE'
        ]);
}