module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        compress: {
            compress: {
                options: {
                    archive: 'ZiMuZu.zip'
                },
                files: [{
                    expand: true,
                    cwd: './',
                    src: ['_locales/**/*', 'css/**/*', 'img/**/*', 'js/**/*', 'LICENSE', 'manifest.json', 'option.html', 'popup.html', 'README.md'],
                    dest: '/'
                }]
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.registerTask('default', ['compress']);
}
