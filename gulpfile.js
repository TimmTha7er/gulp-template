// PATHs
const build_folder = 'dist';
const source_folder = 'app';

// imports
const { src, dest } = require('gulp'),
  gulp = require('gulp'),
  browsersync = require('browser-sync').create(),
  fileinclude = require('gulp-file-include'),
  del = require('del'),
  scss = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  groupmedia = require('gulp-group-css-media-queries'),
  cleanCSS = require('gulp-clean-css'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify-es').default,
  babel = require('gulp-babel'),
  imagemin = require('gulp-imagemin'),
  webp = require('gulp-webp'),
  concat = require('gulp-concat'),
  ttf2woff2 = require('gulp-ttf2woff2'),
  ttf2woff = require('gulp-ttf2woff');

// HTML
const html = () => {
  return src([
    source_folder + '/html/*.html',
    '!' + source_folder + '/html/_*.html',
  ])
    .pipe(fileinclude())
    .pipe(
      rename({
        basename: 'index',
      })
    )
    .pipe(dest('./app/'))
    .pipe(browsersync.stream());
};

const exportHTML = () => {
  return src(source_folder + '/index.html').pipe(dest(build_folder + '/'));
};

// CSS
const css = () => {
  return src(source_folder + '/scss/main.scss')
    .pipe(
      scss({
        outputStyle: 'expanded',
      })
    )
    .pipe(
      autoprefixer({
        // grid: true, // Optional. Enable CSS Grid
        overrideBrowserslist: ['last 5 versions'],
        cascade: true,
      })
    )
    .pipe(groupmedia())
    .pipe(dest('./app/css/'))
    .pipe(cleanCSS())
    .pipe(
      rename({
        basename: 'style',
        extname: '.min.css',
      })
    )
    .pipe(dest('./app/css/'))
    .pipe(browsersync.stream());
};

const exportCSS = () => {
  return src(source_folder + '/css/**/*').pipe(dest(build_folder + '/css/'));
};

// JS
const js = () => {
  return src([
    // add js libs
    // ...
    source_folder + '/js/common.js', // Always at the end
  ])
    .pipe(concat('scripts.min.js'))
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
      })
    )
    .pipe(uglify())
    .pipe(dest('./app/js/'))
    .pipe(browsersync.stream());
};

const exportJS = () => {
  return src(source_folder + '/js/scripts.min.js').pipe(
    dest(build_folder + '/js/')
  );
};

// FONTS
// TASK, 'gulp convertFonts' to run
const convertFonts = () => {
  return src([source_folder + '/fonts/**/*.ttf'])
    .pipe(ttf2woff())
    .pipe(dest(source_folder + '/fonts/'))
    .pipe(src([source_folder + '/fonts/**/*.ttf']))
    .pipe(ttf2woff2())
    .pipe(dest(source_folder + '/fonts/'));
};
exports.convertFonts = convertFonts;

const exportFont = () => {
  return src(source_folder + '/fonts/**/*').pipe(
    dest(build_folder + '/fonts/')
  );
};

// IMAGES
// TASK, 'gulp convertImages' to run
const convertImages = () => {
  return src([
    source_folder + '/img/**/*',
    '!' + source_folder + '/img/favicon/**/*',
  ])
    .pipe(
      webp({
        quality: 70,
      })
    )
    .pipe(dest(source_folder + '/img'));
};
exports.convertImages = convertImages;

const exportImages = () => {
  return src(source_folder + '/img/**/*')
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        interlaced: true,
        optimizationLevel: 3, // 0 to 7
      })
    )
    .pipe(dest(build_folder + '/img'));
};

// Sync
const browserSync = () => {
  browsersync.init({
    server: {
      baseDir: './' + source_folder + '/',
    },
    port: 3000,
    notify: false,
    // online: false, // Work offline without internet connection
    // tunnel: true, tunnel: 'projectname', // Demonstration page: http://projectname.localtunnel.me
  });
};

const watchFiles = () => {
  gulp.watch([source_folder + '/html/**/*.html'], html);
  gulp.watch([source_folder + '/scss/**/*.scss'], css);
  gulp.watch([source_folder + '/js/common.js'], js);
};

// remove dist bofore build
const clean = () => {
  return del(['./' + build_folder + '/'], { force: true });
};

// build project
const build = gulp.series(
  clean,
  html,
  exportHTML,
  css,
  exportCSS,
  js,
  exportJS,
  exportFont,
  exportImages
);
exports.build = build;

// Default
exports.default = gulp.series(
  gulp.parallel(js, css, html),
  gulp.parallel(watchFiles, browserSync)
);
