// Imports
import gulp from 'gulp';
import browsersync from 'browser-sync';
import fileinclude from 'gulp-file-include';
import del from 'del';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import groupmedia from 'gulp-group-css-media-queries';
import cleanCSS from 'gulp-clean-css';
import rename from 'gulp-rename';
import uglify from 'gulp-uglify-es';
import babel from 'gulp-babel';
import imagemin from 'gulp-imagemin';
import webp from 'gulp-webp';
import concat from 'gulp-concat';
import ttf2woff2 from 'gulp-ttf2woff2';
import ttf2woff from 'gulp-ttf2woff';

const scss = gulpSass(dartSass)
const server = browsersync.create();

// PATHs
const dist_folder = 'production';
const source_folder = 'app';
const build_folder = 'gulp-build';

// HTML
const html = () => {
  return gulp.src([
    source_folder + '/src/html/*.html',
    '!' + source_folder + '/src/html/_*.html',
  ])
    .pipe(fileinclude())
    .pipe(
      rename({
        basename: 'index',
      })
    )
    .pipe(gulp.dest(`./app/${build_folder}/`))
    .pipe(server.stream());
};

const exportHTML = () => {
  return gulp.src(source_folder + `/${build_folder}/index.html`).pipe(gulp.dest(dist_folder + '/'));
};

// CSS
const css = () => {
  return gulp.src(source_folder + '/src/scss/main.scss')
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
    .pipe(gulp.dest(`./app/${build_folder}/css/`))
    .pipe(cleanCSS())
    .pipe(
      rename({
        basename: 'style',
        extname: '.min.css',
      })
    )
    .pipe(gulp.dest(`./app/${build_folder}/css/`))
    .pipe(server.stream());
};

const exportCSS = () => {
  return gulp.src(source_folder + `/${build_folder}/css/**/*`).pipe(gulp.dest(dist_folder + '/css/'));
};

// JS
const js = () => {
  return gulp.src([
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
    .pipe(uglify.default())
    .pipe(gulp.dest(`./app/${build_folder}/js/`))
    .pipe(server.stream());
};

const exportJS = () => {
  return gulp.src(source_folder + `/${build_folder}/js/scripts.min.js`).pipe(
    gulp.dest(dist_folder + `/${build_folder}/js/`)
  );
};

// FONTS
// TASK, 'gulp convertFonts' to run
export const convertFonts = () => {
  return gulp.src([source_folder + '/src/fonts/**/*.ttf'])
    .pipe(ttf2woff())
    .pipe(gulp.dest(source_folder + '/src/fonts/'))
    .pipe(gulp.src([source_folder + '/src/fonts/**/*.ttf']))
    .pipe(ttf2woff2())
    .pipe(gulp.dest(source_folder + '/src/fonts/'));
};

const exportFont = () => {
  return gulp.src(source_folder + '/src/fonts/**/*').pipe(
    gulp.dest(dist_folder + '/fonts/')
  );
};

// IMAGES
// TASK, 'gulp convertImages' to run
export const convertImages = () => {
  return gulp.src([
    source_folder + '/src/img/**/*',
    '!' + source_folder + '/src/img/favicon/**/*',
  ])
    .pipe(
      webp({
        quality: 70,
      })
    )
    .pipe(gulp.dest(source_folder + '/src/img'));
};

const exportImages = () => {
  return gulp.src(source_folder + '/src/img/**/*')
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        interlaced: true,
        optimizationLevel: 3, // 0 to 7
      })
    )
    .pipe(gulp.dest(dist_folder + '/img'));
};

// Sync
const browserSync = () => {
  server.init({
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
export const build = gulp.series(
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

// Default
export default gulp.series(
  gulp.parallel(js, css, html),
  gulp.parallel(watchFiles, browserSync)
);
