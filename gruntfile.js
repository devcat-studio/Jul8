module.exports = function (grunt) {
    // 우리가 지은 이름과 태스크 이름을 구분하기 어려워서
    // 우리가 지은 이름에는 언더바(_)를 붙임

    grunt.initConfig({
        // https://github.com/gruntjs/grunt-contrib-watch
        watch: {
            Sample_Templates_: {
                files: ["Sample/html/sample_templates.html"],
                tasks: ["exec:Sample_Templates_"],
            }
        },      

        // https://www.npmjs.com/package/grunt-exec
        exec: {
            Sample_Templates_: {
                cwd: '.',
                command: '"Compiler/bin/Jul8Compiler.exe" "Sample/jul8config.json"'
            }
        },
    });

    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['watch']);
}