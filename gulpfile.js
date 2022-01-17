var gulp = require("gulp");
var browserSync = require("browser-sync");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var tsify = require("tsify");
var uglify = require("gulp-uglify");
var sourcemaps = require("gulp-sourcemaps");
var buffer = require("vinyl-buffer");
const cssnano = require("gulp-cssnano");
const cssbeautify = require("gulp-cssbeautify");

var paths = {
    pages: ["app/*.html"],
    build: {
        css: "dist/",
    },
    src: {
        css: "app/css/main.css",
    },
};

gulp.task("copy-html", function () {
    return gulp.src(paths.pages).pipe(gulp.dest("dist"));
});

gulp.task("copy-img", function () {
    return gulp.src("app/img/*").pipe(gulp.dest("dist/img"));
});

gulp.task("scripts", function () {
    return gulp.src(["app/ts/*.ts"]).pipe(browserSync.reload({ stream: true }));
});

gulp.task("code", function () {
    return gulp.src("app/*.html").pipe(browserSync.reload({ stream: true }));
});

gulp.task("browser-sync", function () {
    browserSync({
        server: {
            baseDir: "dist",
        },
        notify: false,
    });
});

gulp.task("watch", function () {
    gulp.watch("app/*.html", gulp.parallel("code", "bundling"));
    gulp.watch(
        ["app/ts/*.ts", "app/css/*.css"],
        gulp.parallel("scripts", "css", "bundling")
    );
});

gulp.task(
    "bundling",
    gulp.series(gulp.parallel(["copy-html", "copy-img"]), function () {
        return browserify({
            basedir: ".",
            debug: true,
            entries: ["app/ts/main.ts"],
            cache: {},
            packageCache: {},
        })
            .plugin(tsify)
            .transform("babelify", {
                presets: ["es2015"],
                extensions: [".ts"],
            })
            .bundle()
            .pipe(source("bundle.js"))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(sourcemaps.write("./"))
            .pipe(gulp.dest("dist"));
    })
);

gulp.task("css", function () {
    return gulp
        .src(paths.src.css, { base: "app/" })
        .pipe(cssbeautify())
        .pipe(gulp.dest(paths.build.css))
        .pipe(
            cssnano({
                zindex: false,
                discardComments: {
                    removeAll: true,
                },
            })
        )
        .pipe(gulp.dest(paths.build.css));
});

gulp.task("image", function () {
    gulp.src("app/img/*").pipe(image()).pipe(gulp.dest("./dest"));
});

gulp.task("default", gulp.parallel("watch", "browser-sync", "css", "bundling"));
