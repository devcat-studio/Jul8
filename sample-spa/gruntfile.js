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
                files: ["html/index.html"],
                tasks: ["exec:JUL8_SAMPLE"],
            }
        },      

        // https://www.npmjs.com/package/grunt-exec
        exec: {
            JUL8_SAMPLE: {
                cwd: '.',
                command: 'node ../jul8/dist/index.js "jul8config.json"'
            },
            TSC_W: {
                cwd: '.',
                command: 'npx tsc -b frontend -w'
            },
            TSC_FORCE: {
                cwd: '.',
                command: 'npx tsc -b frontend --force'
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