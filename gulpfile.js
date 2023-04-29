const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const nodemon = require('gulp-nodemon');
const jest = require('gulp-jest').default;
const sass = require('gulp-sass')(require('sass'));
// Компіляція SCSS в CSS та додавання вендорних префіксів
gulp.task('styles', () => {
  return gulp.src('./src/scss/*.scss')
    .pipe(sass())
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest('./public/css'));
});

// Мінімізація та об'єднання JavaScript файлів
gulp.task('scripts', () => {
  return gulp.src('./src/js/*.js')
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./public/js'));
});

// Запуск сервера Express та автоматичне перезавантаження на зміні файла
gulp.task('serve', () => {
  nodemon({
    script: './app.js',
    ext: 'js html',
    env: { 'NODE_ENV': 'development' }
  });
});

// Запуск тестів Jest та повідомлення результатів у вікні командного рядка
gulp.task('test', () => {
  return gulp.src('tests/*.test.js').pipe(jest({
    "moduleFileExtensions": ["js"],
    "transform": {
      "^.+\\.jsx?$": "babel-jest"
    },
    "testMatch": [
      "**/__tests__/**/*.js?(x)",
      "**/?(*.)+(spec|test).js?(x)"
    ],
    "testPathIgnorePatterns": [
      "/node_modules/"
    ]
  }));
});

// Спостереження за зміною файлів та автоматичне виконання відповідних завдань
gulp.task('watch', () => {
  gulp.watch('./src/scss/*.scss', gulp.series('styles'));
  gulp.watch('./src/js/*.js', gulp.series('scripts'));
});

// Запуск відповідних завдань за замовчуванням
gulp.task('default', gulp.parallel('styles', 'scripts', 'serve', 'watch'));