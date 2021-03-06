var gulp = require('gulp'),
  autoprefixer = require('gulp-autoprefixer'),
  concat = require('gulp-concat'),
  imagemin = require('gulp-imagemin'),
  htmlmin = require('gulp-htmlmin'),
  minifyHtml = require('gulp-minify-html'),
  rev = require('gulp-rev'),
  revCollector = require('gulp-rev-collector'),
  uglify = require('gulp-uglify'),
  connect = require('gulp-connect'),
  del = require("del"),
  less = require('gulp-less'),
  path = require('path'),
  plumber = require('gulp-plumber'),
  notify = require('gulp-notify'),
  babel = require('gulp-babel'),
  amdOptimize = require('amd-optimize'),
  rename = require('gulp-rename'),
  runsequence = require('run-sequence');


/*生产构建 begin*/
// 处理CSS
gulp.task('css', function() {
  return gulp.src('src/css/*.css')
    .pipe(autoprefixer())
    .pipe(gulp.dest('./dist'));
});

//处理less
gulp.task('less', function() {
    return gulp.src('./src/**/*.less')
      .pipe(less())
      .pipe(autoprefixer({
        browsers: ['last 2 versions', 'Firefox >= 20'],
        cascade: true, //是否美化属性值 默认：true 像这样：
        //-webkit-transform: rotate(45deg);
        //        transform: rotate(45deg);
        remove: true //是否去掉不必要的前缀 默认：true )
      }))
      .pipe(gulp.dest("dist"));
  })
  // 此处就不做CSS压缩的演示了，原理相同。

// 压缩js
gulp.task('script', function() {
  return gulp.src('src/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./dist'));
});

// 压缩图片
gulp.task('image', function() {
  return gulp.src('src/images/*')
    .pipe(imagemin())
    .pipe(gulp.dest('./dist'));
});

// 压缩html
gulp.task('html', function() {
  return gulp.src('src/*.html')
    // .pipe(htmlmin({
    //   removeComments: true,
    //   collapseWhitespace: true,
    //   minifyJS: true
    // }))
    .pipe(gulp.dest('./dist'));
});

//处理es6
gulp.task('convertjs', function() {
  return gulp.src('./src/**/*.es6')
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('dist'))
})

// 生成hash文件名
gulp.task('rev', ['css', "convertjs", 'less', 'html'], function() {
  // 其中加!前缀的是表示过滤该文件
  return gulp.src(['./dist/**/*', '!**/*.html', '!**/*.less', '!**/*.es6'])
    /* 转换成新的文件名 */
    .pipe(rev())
    .pipe(gulp.dest('./dist'))
    /*收集原文件名与新文件名的关系*/
    .pipe(rev.manifest())
    // 将文件以json的形式存在当前项目下的 ./rev 目录下
    .pipe(gulp.dest('./rev'));
});

// 替换文件路径
/* 使用这个模块，需要依赖rev任务，所以需要注入rev任务，如果不注入需要先执行rev任务 */
//从manifest文件中收集数据并且替换html模板中的链接
gulp.task('revCollector', ['rev'], function() {
  // 根据生成的json文件，去替换html里的路径
  return gulp.src(['./rev/*.json', './dist/*.html'])
    .pipe(revCollector({
      replaceReved: true, //说明模板中已经被替换的文件是否还能再被替换,默认是false
      dirReplacements: {
        '/src': ''
      }
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('clean', function() {
  del(['./rev/**', './dist/**']);
})

gulp.task('build', ['clean'], function() {
  gulp.start('revCollector');
});
/*生产构建 end*/

/*开发构建 begin*/

//当src目录下文件发生改变的时候自动更新并刷新页面
gulp.task('devsrc', function() {
  return gulp.src(['./src/**', '!/src/**/*.less'])
    .pipe(connect.reload());
});

//开发过程中对less文件进行编译
gulp.task('devless', function() {
  return gulp.src('./src/**/*.less')
    .pipe(less())
    .pipe(autoprefixer({
      browsers: ['last 2 versions', 'Firefox >= 20'],
      cascade: true, //是否美化属性值 默认：true 像这样：
      //-webkit-transform: rotate(45deg);
      //        transform: rotate(45deg);
      remove: true //是否去掉不必要的前缀 默认：true )
    }))
    .pipe(gulp.dest("src"))
    .pipe(connect.reload());
});

//开发过程中对es6进行转换
gulp.task('devconvertjs', function() {
  return gulp.src('./src/**/*.es6')
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('src'))
    .pipe(connect.reload());
})

//构建require
gulp.task('rjs', function() {
  return gulp.src(['src/**/*.js'])
    .pipe(amdOptimize("src/js/requireConfig"))
    .pipe(concat("app.js")) //合并  
    // .pipe(gulp.dest("dist/"))          //输出保存  
    // .pipe(rename("index.min.js"))          //重命名  
    // .pipe(uglify())                        //压缩  
    .pipe(gulp.dest("src/js")); //输出保存  
});


//启动gulp服务器
gulp.task('webserver', function() {
  connect.server({
    root: './',
    livereload: true,
    port: 8080
  });
});

//监听文件变化
gulp.task('watch', function() {
  gulp.watch(['./src/**/*.less'], ['devless']);
  gulp.watch(['./src/**/*.es6'], ['devconvertjs']);
  gulp.watch(['./src/**'], ['devsrc']);
});

gulp.task('dev', function(callback) {
    runsequence(['devconvertjs', 'devless'], //编译es6 less
      'rjs', //构建require
      'webserver', //启动服务器
      'watch', //监听文件变化
      callback
    )
  })
  /*开发构建 end*/