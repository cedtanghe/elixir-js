/*
|--------------------------------------------------------------------------
| IMPORTS
|--------------------------------------------------------------------------
*/

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var watch = require('gulp-watch');

/*
|--------------------------------------------------------------------------
| CONFIGURATION
|--------------------------------------------------------------------------
*/

function swallowError(error)
{
    // If you want details of the error in the console
    console.log(error.toString());
    this.emit('end');
};

var paths = [
    'src/'
];

/*
|--------------------------------------------------------------------------
| TASKS
|--------------------------------------------------------------------------
*/

/**
 * Compress JS
 */
gulp.task('compress-js', function()
{
    gulp.src([
        'src/**/*.js'
    ])
    .pipe(concat('elixir.min.js'))
    .pipe(uglify().on('error', swallowError))
    .pipe(gulp.dest('dist/'));
    
    gulp.src([
        'src/**/*.js'
    ])
    .pipe(concat('elixir.extended.js'))
    .pipe(gulp.dest('dist/'));
});

/**
 * Lint
 */
gulp.task('lint', function()
{
    paths.forEach(function(path)
    {
        gulp.src([
            'dist/elixir.extended.js'
        ])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
    });
});

/**
 * Watch
 */
gulp.task('watch', function ()
{
    paths.forEach(function(path)
    {
        gulp.watch([
            'src/**/*.js'
        ], 
        ['compress-js']);
    });
});

// Launch all
gulp.task('default', ['compress-js', 'watch'], function(){});
