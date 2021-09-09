// PATHs
const dist_folder = 'production';
const source_folder = 'app';
const build_folder = 'gulp-build';

// Imports
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
    source_folder + '/src/html/*.html',
    '!' + source_folder + '/src/html/_*.html',
  ])
    .pipe(fileinclude())
    .pipe(
      rename({
        basename: 'index',
      })
    )
    .pipe(dest(`./app/${build_folder}/`))
    .pipe(browsersync.stream());
};

const exportHTML = () => {
  return src(source_folder + `/${build_folder}/index.html`).pipe(dest(dist_folder + '/'));
};

// CSS
const css = () => {
  return src(source_folder + '/src/scss/main.scss')
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
    .pipe(dest(`./app/${build_folder}/css/`))
    .pipe(cleanCSS())
    .pipe(
      rename({
        basename: 'style',
        extname: '.min.css',
      })
    )
    .pipe(dest(`./app/${build_folder}/css/`))
    .pipe(browsersync.stream());
};

const exportCSS = () => {
  return src(source_folder + `/${build_folder}/css/**/*`).pipe(dest(dist_folder + '/css/'));
};

// JS
const js = () => {
  return src([
    // add js libs
    // ...
    source_folder + '/src/js/common.js', // Always at the end
  ])
    .pipe(concat('scripts.min.js'))
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
      })
    )
    .pipe(uglify())
    .pipe(dest(`./app/${build_folder}/js/`))
    .pipe(browsersync.stream());
};

const exportJS = () => {
  return src(source_folder + `/${build_folder}/js/scripts.min.js`).pipe(
    dest(dist_folder + `/${build_folder}/js/`)
  );
};

// FONTS
// TASK, 'gulp convertFonts' to run
const convertFonts = () => {
  return src([source_folder + '/src/fonts/**/*.ttf'])
    .pipe(ttf2woff())
    .pipe(dest(source_folder + '/src/fonts/'))
    .pipe(src([source_folder + '/src/fonts/**/*.ttf']))
    .pipe(ttf2woff2())
    .pipe(dest(source_folder + '/src/fonts/'));
};
exports.convertFonts = convertFonts;

const exportFont = () => {
  return src(source_folder + '/src/fonts/**/*').pipe(
    dest(dist_folder + '/fonts/')
  );
};

// IMAGES
// TASK, 'gulp convertImages' to run
const convertImages = () => {
  return src([
    source_folder + '/src/img/**/*',
    '!' + source_folder + '/src/img/favicon/**/*',
  ])
    .pipe(
      webp({
        quality: 70,
      })
    )
    .pipe(dest(source_folder + '/src/img'));
};
exports.convertImages = convertImages;

const exportImages = () => {
  return src(source_folder + '/src/img/**/*')
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        interlaced: true,
        optimizationLevel: 3, // 0 to 7
      })
    )
    .pipe(dest(dist_folder + '/img'));
};

// Sync
const browserSync = () => {
  browsersync.init({
    server: {
      baseDir: './' + source_folder + `/${build_folder}/`,
    },
    port: 3000,
    notify: false,
    // online: false, // Work offline without internet connection
    // tunnel: true, tunnel: 'projectname', // Demonstration page: http://projectname.localtunnel.me
  });
};

const watchFiles = () => {
  gulp.watch([source_folder + '/src/html/**/*.html'], html);
  gulp.watch([source_folder + '/src/scss/**/*.scss'], css);
  gulp.watch([source_folder + '/src/js/common.js'], js);
};

// Remove production folder before build
const clean = () => {
  return del(['./' + dist_folder + '/'], { force: true });
};

// Build project
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
