var gulp = require('gulp');
var clean = require('gulp-clean');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var mq4HoverShim = require('mq4-hover-shim');
var rimraf = require('rimraf').sync;
var browser = require('browser-sync');
var panini = require('panini');
var concat = require('gulp-concat');
var jsmin = require('gulp-jsmin');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var port = process.env.SERVER_PORT || 8080;
var nodepath =  './node_modules/';

/* ============== Tarefas de Suporte ============== */
/* Iniciando instância BrowerSync */
gulp.task('server', ['build'], function(){
    browser.init({server: './_site', port: port});
});
/* Verificando se algum arquivo foi modificado */
gulp.task('watch', function() {
    gulp.watch('./dev/scss/**/*', ['compile-scss', browser.reload]);
    gulp.watch('./dev/sass/**/*', ['compile-sass', browser.reload]);
    gulp.watch('./dev/js/**/*', ['copy-js', browser.reload]);
    gulp.watch('./dev/html/pages/**/*', ['compile-html']);
    gulp.watch('./dev/images/**/*', ['copy-images', browser.reload]);
    gulp.watch(['./dev/html/{layouts,includes,helpers,data}/**/*'], ['compile-html:reset','compile-html']);
    gulp.watch(['./src/{layouts,partials,helpers,data}/**/*'], [panini.refresh]);
});
/* Reiniciando pastas de desenvolvimento */
gulp.task('reset', function() {
    rimraf('./dev/assets/bulma/*');
    rimraf('./dev/assets/scss/*');
    rimraf('./dev/assets/css/*');
    rimraf('./dev/assets/fonts/*');
    rimraf('./dev/images/*');
});
/* Removendo pasta de produção */
gulp.task('clean', function() {
    rimraf('_site');
});
/* Configurando framework Bulma */
gulp.task('setupBulma', function() {
    //Get Bulma from node modules
    gulp.src([nodepath + './dev/assets/bulma/*.sass']).pipe(gulp.dest('./dev/assets/bulma/'));
    gulp.src([nodepath + './dev/assets/bulma/**/*.sass']).pipe(gulp.dest('./dev/assets/bulma/'));
});

/* ============== Tarefas para CSS, JS, HTML e Imagens ============== */
/* Copia arquivos CSS e de Fonts para pasta final do Site */
gulp.task('copy', function() {
    // Copiando arquivos CSS externos
    gulp.src(['./dev/assets/css/*.css']).pipe(gulp.dest('_site/assets/css/'));
    // Copiando Fonts externas
    gulp.src(['./dev/assets/fonts/*']).pipe(gulp.dest('_site/assets/fonts/'));
});
/* Variável para trabalhar com SASS */
var sassOptions = {
    errLogToConsole: true,
    outputStyle: 'compressed',
    includePaths: [nodepath + 'bulma/sass']
};
/* Variável para trabalhar com SCSS */
var scssOptions = {
    errLogToConsole: true,
    outputStyle: 'compressed',
    includePaths: ['./dev/scss/partials']
};
/* Compilando SASS do Bulma */
gulp.task('compile-sass', function () {
    var processors = [
        mq4HoverShim.postprocessorFor({ hoverSelectorPrefix: '.is-true-hover ' }),
        autoprefixer({
            browsers: [
                "Chrome >= 45",
                "Firefox ESR",
                "Edge >= 12",
                "Explorer >= 10",
                "iOS >= 9",
                "Safari >= 9",
                "Android >= 4.4",
                "Opera >= 30"
            ]
        })//,
        //cssnano(),
    ];
    //Watch me get Sassy
    return gulp.src('./dev/assets/bulma/bulma.sass')
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./_site/assets/css/'));
});
/* Copilando SCSS (Tema) da Aplicação */
gulp.task('compile-scss', function () {
    var processors = [
        mq4HoverShim.postprocessorFor({ hoverSelectorPrefix: '.is-true-hover ' }),
        autoprefixer({
            browsers: [
                "Chrome >= 45",
                "Firefox ESR",
                "Edge >= 12",
                "Explorer >= 10",
                "iOS >= 9",
                "Safari >= 9",
                "Android >= 4.4",
                "Opera >= 30"
            ]
        })//,
        //cssnano(),
    ];
    //Watch me get Sassy
    return gulp.src('./dev/scss/core.scss')
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./_site/assets/css/'));
});
/* Copilando HTML */
gulp.task('compile-html', function() {
    gulp.src('./dev/html/pages/**/*.html')
        .pipe(panini({
        root: './dev/html/pages/',
        layouts: './dev/html/layouts/',
        partials: './dev/html/includes/',
        helpers: './dev/html/helpers/',
        data: './dev/html/data/'
    }))
        .pipe(gulp.dest('_site'))
        .on('finish', browser.reload);
});
/* Resetando HTML */
gulp.task('compile-html:reset', function(done) {
    panini.refresh();
    done();
});
/* Compilando arquivos JS do Node */
gulp.task('compile-js', function() {
    return gulp.src([ 
        nodepath + 'jquery/dist/jquery.min.js', 
        nodepath + 'feather-icons/dist/feather.min.js',
    ])
        .pipe(concat('libs.js'))
        .pipe(jsmin())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./_site/assets/js/'));
});
/* Compilando arquvios JS da Aplicação */
gulp.task('copy-js', function() {
    gulp.src('./dev/assets/js/**/*.js')
        .pipe(concat('app.js'))
        .pipe(jsmin())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./_site/assets/js/'));
});
/* Copiando imagens para produção */
gulp.task('copy-images', function() {
    gulp.src('./dev/images/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./_site/assets/images/'));
});

/* ============== Configurações Gerais ============== */
gulp.task('init', ['setupBulma']);
gulp.task('build', ['clean','copy','compile-js', 'copy-js', 'compile-sass', 'compile-scss', 'compile-html', 'copy-images']);
gulp.task('default', ['server', 'watch']);
