const { src, dest, series, parallel, watch } = require('gulp');
// ДВЕ ЗВЁЗДОЧКИ

// common
const fileInclude = require('gulp-file-include');
const browserSync = require('browser-sync').create();
const del = require('del');

// css 
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');

// webpack
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');
const yargs = require('yargs');

const argv = yargs.argv;
webpackConfig.mode = !!argv.development ? 'development' : 'production';

function cleanDist() {
    return del('./dist')
}

function browserSyncFn() {
    return browserSync.init({
        server: {
            baseDir: './dist/',
            port: 3000,
            notify: false
        }
    })
}

function watchForChanges() {
    watch(['./src/**.html'], html);
    watch(['./src/less/style.less'], css);
    watch(['./src/js/**.js'], js);
}

function html() {
    return src('./src/index.html')
        .pipe(fileInclude())
        .pipe(dest('./dist/'))
        .pipe(browserSync.stream())
}

function css() {
    return src('./src/less/style.less')
        .pipe(less())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 15 versions', '> 1%', 'ie 8', 'ie 7'],
            cascade: false
        }))
        .pipe(cleanCss())
        .pipe(dest('./dist/css'))
        .pipe(browserSync.stream())
}

const js = () => {
    return src('./src/js/index.js')
    .pipe(webpackStream(webpackConfig), webpack)
    .pipe(dest('./dist/js'))
    .pipe(browserSync.stream())
}

const build = series(cleanDist, parallel(html, css, js));
const dev = parallel(build, watchForChanges, browserSyncFn);

exports.build = build;
exports.default = dev;