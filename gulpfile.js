// PATHs
const project_folter = 'dist';
const source_folder = 'app';

let path = {
  src: {
    html: [
      source_folder + '/html/*.html',
      '!' + source_folder + '/html/_*.html',
    ],
    css: source_folder + '/scss/main.scss',
    js: [
      // add js libs
      source_folder + '/js/common.js',
    ],
    img: source_folder + '/img/**/*',
    fonts: source_folder + '/fonts/**/*',
  },
  export: {
    html: source_folder + '/index.html',
    css: source_folder + '/css/**/*',
    js: source_folder + '/js/scripts.min.js',
    img: [
      source_folder + 'img/**/*',
      '!' + source_folder + '/img/favicon/**/*',
    ],
    fonts: source_folder + '/fonts/**/*',
  },
  build: {
    html: project_folter + '/',
    css: project_folter + '/css/',
    js: project_folter + '/js/',
    img: project_folter + '/img/',
    fonts: project_folter + '/fonts/',
  },
  watch: {
    html: source_folder + '/html/**/*.html',
    css: source_folder + '/scss/**/*.scss',
    js: source_folder + '/js/common.js',
  },
  clean: './' + project_folter + '/',
};

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
  concat = require('gulp-concat');

// HTML
const html = () => {
  return src(path.src.html)
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
  return src(path.export.html).pipe(dest(path.build.html));
};


// CSS
const css = () => {
  return src(path.src.css)
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
  return src(path.export.css).pipe(dest(path.build.css));
};

// JS
const js = () => {
  return src(path.src.js)
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
  return src(path.export.js)
    .pipe(dest(path.build.js))
    .pipe(src(path.src.js))
    .pipe(concat('scripts.js'))
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
      })
    )
    .pipe(dest(path.build.js));
};

// fonts
const exportFont = () => {
  return src(path.export.fonts).pipe(dest(path.build.fonts));
};

// imgs
const exportImages = () => {
  return src(path.export.img)
    .pipe(
      webp({
        quality: 70,
      })
    )
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        interlaced: true,
        optimizationLevel: 3, // 0 to 7
      })
    )
    .pipe(dest(path.build.img));
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
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
};

// remove dist bofore build
const clean = () => {
  return del([path.clean], { force: true });
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
