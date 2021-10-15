const autoprefixer = require("gulp-autoprefixer"),
  browserSync = require("browser-sync").create(),
  cleanCss = require("gulp-clean-css"),
  del = require("del"),
  concat = require("gulp-concat"),
  htmlmin = require("gulp-htmlmin"),
  cssbeautify = require("gulp-cssbeautify"),
  gulp = require("gulp"),
  npmDist = require("gulp-npm-dist");
(sass = require("gulp-sass")),
  (wait = require("gulp-wait")),
  (fileinclude = require("gulp-file-include")),
  (plumber = require("gulp-plumber")),
  (webpack = require("webpack"));
webpackStream = require("webpack-stream");
(CircularDependencyPlugin = require("circular-dependency-plugin")),
  (DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin")),
  (eslint = require("gulp-eslint")),
  (rename = require("gulp-rename")),
  (svgSprite = require("gulp-svg-sprite"));
imagemin = require("gulp-imagemin");
tinypng = require("gulp-tinypng-compress");

// =======================================================================================================
// ===================================================   Define paths
const paths = {
  dist: {
    base: "./dist/",
    html: "./dist/",
    assets: "./dist/assets",
    img: "./dist/assets/img",
    css: "./dist/assets/styles",
    js: "./dist/assets/js",
  },
  base: {
    base: "./",
    node: "./node_modules",
  },
  src: {
    base: "./src/",
    assets: "./src/assets/**/*.*",
    fonts: "./src/assets/fonts",
    img: "./src/assets/img",
    svg: "./src/assets/svg",
    partials: "./src/partials/**/*.html",
    scss: "./src/styles",
    js: "./src/js",
    vendor: "./src/vendor",
  },
};

// Clean
gulp.task("clean:dist", function () {
  return del([paths.dist.base]);
});

// =======================================================================================================
// ===================================================   HTML development
gulp.task("copy:html", function () {
  return gulp
    .src([paths.src.base + "*.html"])
    .pipe(
      fileinclude({
        prefix: "@@",
        basepath: "./src/partials/",
        context: {
          environment: "development",
        },
      })
    )
    .pipe(gulp.dest(paths.dist.html))
    .pipe(browserSync.stream());
});

// ===================================================   HTML production
gulp.task("minify:html", function () {
  return gulp
    .src([paths.dist.html + "*.html"])
    .pipe(
      htmlmin({
        collapseWhitespace: true,
      })
    )
    .pipe(
      fileinclude({
        prefix: "@@",
        basepath: "./src/partials/",
        context: {
          environment: "production",
        },
      })
    )
    .pipe(gulp.dest(paths.dist.html))
    .pipe(browserSync.stream());
});

// =======================================================================================================
// ===================================================   Styles
gulp.task("compile:scss", function () {
  return gulp
    .src(paths.src.scss + "/style.scss")
    .pipe(wait(500))
    .pipe(sass().on("error", sass.logError))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["> 0%, last 2 versions"],
      })
    )
    .pipe(gulp.dest(paths.dist.css))
    .pipe(browserSync.stream());
});

gulp.task("beautify:css", function () {
  return gulp
    .src(paths.dist.css + "/style.css")
    .pipe(cssbeautify())
    .pipe(gulp.dest(paths.dist.css))
    .pipe(browserSync.stream());
});

gulp.task("minify:css", function () {
  return gulp
    .src(paths.dist.css + "/style.css")
    .pipe(cleanCss())
    .pipe(gulp.dest(paths.dist.css))
    .pipe(browserSync.stream());
});

// =======================================================================================================
// ===================================================   JS development
// Bundle and minify js
gulp.task("js:main", function () {
  return gulp
    .src([paths.src.js + "/modules/*.js", paths.src.js + "/main.js"])
    .pipe(plumber())
    .pipe(
      webpackStream({
        mode: "development",
        output: {
          filename: "[name].js",
        },
        module: {
          rules: [
            {
              test: /\.m?js$/,
              exclude: /(node_modules|bower_components)/,
              use: {
                loader: "babel-loader",
                options: {
                  presets: [
                    [
                      "@babel/preset-env",
                      {
                        debug: true,
                        corejs: 3,
                        useBuiltIns: "usage",
                      },
                    ],
                  ],
                },
              },
            },
          ],
        },
        devtool: "source-map",
        plugins: [
          new CircularDependencyPlugin(),
          new DuplicatePackageCheckerPlugin(),
          new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
          }),
        ],
      })
    )
    .pipe(gulp.dest(paths.dist.js))
    .on("end", browserSync.reload);
});

// ===================================================   JS production
// Bundle and minify js
gulp.task("js:main:build", function () {
  return gulp
    .src([paths.src.js + "/modules/*.js", paths.src.js + "/main.js"])
    .pipe(plumber())
    .pipe(
      webpackStream({
        mode: "production",
        output: {
          filename: "[name].js",
        },
        module: {
          rules: [
            {
              test: /\.m?js$/,
              exclude: /(node_modules|bower_components)/,
              use: {
                loader: "babel-loader",
                options: {
                  presets: [
                    [
                      "@babel/preset-env",
                      {
                        debug: true,
                        corejs: 3,
                        useBuiltIns: "usage",
                      },
                    ],
                  ],
                },
              },
            },
          ],
        },
        plugins: [
          new CircularDependencyPlugin(),
          new DuplicatePackageCheckerPlugin(),
          new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
          }),
        ],
      })
    )
    .pipe(gulp.dest(paths.dist.js))
    .on("end", browserSync.reload);
});

// =======================================================================================================
// ===================================================   Assets
gulp.task("copy:fonts", function () {
  return gulp
    .src(paths.src.fonts + "/**/*")
    .pipe(gulp.dest(paths.dist.assets + "/fonts"))
    .pipe(browserSync.stream());
});

gulp.task("copy:svg", function () {
  return gulp
    .src(paths.src.svg + "/**/*")
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../sprite.svg", // !!! doesn't work for ie
          },
        },
      })
    )
    .pipe(gulp.dest(paths.dist.img))
    .pipe(browserSync.stream());
});

gulp.task("copy:img", function () {
  return gulp
    .src(paths.src.img + "/**/*")
    .pipe(gulp.dest(paths.dist.img))
    .pipe(browserSync.stream());
});

gulp.task("tinypng", function () {
  gulp
    .src(paths.dist.img + "/**/*.{png,jpg,jpeg}") // !!! need to pay for key
    .pipe(
      tinypng({
        key: "",
        sigFile: "./dist/img/.tinypng-sigs",
        parallel: true,
        parallelMax: 50,
        log: true,
      })
    )
    .pipe(gulp.dest(paths.dist.img));
});

gulp.task("imagemin", function () {
  return gulp
    .src(paths.dist.img + "/**/*.{png,jpg,jpeg}")
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 7 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(gulp.dest(paths.dist.img));
});

// =======================================================================================================
// ===================================================  Vendor | Libraries
gulp.task("copy:vendor", function () {
  return gulp
    .src(npmDist(), { base: paths.base.node })
    .pipe(gulp.dest(paths.src.vendor));
});

gulp.task("copy:libs:js", function () {
  return gulp
    .src([paths.src.js + "/libs/jquery.min.js", paths.src.js + "/libs/*"])
    .pipe(concat("libs.min.js"))
    .pipe(gulp.dest(paths.dist.js))
    .pipe(browserSync.stream());
});

// =======================================================================================================
// ===================================================  Tasks
gulp.task(
  "build",
  gulp.series(
    "clean:dist",
    "copy:html",
    "copy:fonts",
    "copy:img",
    "copy:svg",
    "compile:scss",
    "minify:css",
    "js:main:build",
    "copy:libs:js",
    "imagemin"
  )
);

gulp.task(
  "serve",
  gulp.series(
    "clean:dist",
    "copy:html",
    "copy:img",
    "copy:fonts",
    "copy:svg",
    "compile:scss",
    "js:main",
    "copy:vendor",
    "copy:libs:js",
    function () {
      browserSync.init({
        server: paths.dist.base,
      });

      gulp.watch(
        [paths.src.base + "*.html", paths.src.partials],
        gulp.series("copy:html")
      );
      gulp.watch(paths.src.fonts + "/**/*", gulp.series("copy:fonts"));
      gulp.watch(paths.src.svg + "/**/*", gulp.series("copy:svg"));
      gulp.watch(paths.src.img + "/**/*", gulp.series("copy:img"));
      gulp.watch(paths.src.scss + "/**/*", gulp.series("compile:scss"));
      gulp.watch(
        [paths.src.js + "/modules/*.js", paths.src.js + "/main.js"],
        gulp.series("js:main")
      );
      gulp.watch(paths.src.js + "/libs/*", gulp.series("copy:libs:js"));
    }
  )
);

gulp.task("default", gulp.series("serve"));
