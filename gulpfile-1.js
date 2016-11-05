var gulp = require('gulp'),
	  connect = require('gulp-connect'),
	  less = require('gulp-less'),
	  cssmin = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    rev = require('gulp-rev'),
    revCollector = require('gulp-rev-collector'),
	  notify = require('gulp-notify'); //提示信息

//启动服务器
gulp.task('webserver', function() {
  connect.server({
  	root: './',
    livereload: true
  });
  gulp.start('watch');
});
 
//监听html
gulp.task('html', function () {
  return gulp.src('./app/*.html')
    .pipe(notify({ message: 'html task complete' }))
    .pipe(revCollector({
            replaceReved: true,
            dirReplacements: {
                'style': '/dist/style/'
            }
        }) 
    )
    .pipe(gulp.dest('dist'))
    .pipe(connect.reload());
});

//监听css
gulp.task('css', function () {
  return gulp.src('./app/style/*.css')
    .pipe(rev())
    .pipe(notify({ message: 'css task complete' }))
    .pipe(connect.reload());
});

gulp.task('js', function() {
  return gulp.src('app/javascript/*.js')
    .pipe(rev())
    //.pipe(concat('main.js'))
    .pipe(rename({ suffix: '.min' }))
    // .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
    .pipe(notify({ message: 'js task complete' }))
    .pipe(connect.reload());
});


//自动添加前缀
gulp.task('autoprefixer', function () {
    gulp.src('app/style/*.css')
        .pipe(rev())
        .pipe(autoprefixer({
            browsers: ['last 2 versions',"last 2 Explorer versions","Firefox >= 20", 'Android >= 4.0'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove:true //是否去掉不必要的前缀 默认：true 
        }))
        .pipe(rev.manifest() )
        .pipe(gulp.dest('dist/style'));
});

//监听less
gulp.task('less', function () {
  return gulp.src('app/style/*.less')
    .pipe(rev())
    .pipe(less())
    // .pipe(cssmin({
    // 	   	advanced: false,//类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
    //         compatibility: 'ie8',//保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
    //         keepBreaks: true,//类型：Boolean 默认：false [是否保留换行]
    //         keepSpecialComments: '*'
    //         //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
    //  }))
    .pipe( rev.manifest() )
    .pipe(gulp.dest('dist/style'))
    .pipe(notify({ message: 'less task complete' }))
    .pipe(connect.reload());
});



//监听html css
gulp.task('watch', function () {
  gulp.watch(['./app/*.html'], ['html']);
  gulp.watch(['./app/style/*.less'],['less']);
  gulp.watch(['./app/style/*.css'],['css']);
  gulp.watch(['app/javascript/*.js'],['js']);
});

gulp.task('build',function(){
   gulp.start('html','less', 'autoprefixer','js');
})

gulp.task('default', ['less','js','webserver']);
