const gulp = require('gulp')
const config = require('@ionic/app-scripts/dist/util/config')
const ionic = require('@ionic/app-scripts')
const { exec, execSync, spawn } = require('child_process');
const electronBuilder = require('../node_modules/electron-builder')

gulp.task('serve', ['electron:assets'], () => {
  exec('cd ../ && ./node_modules/.bin/tsc -w -p electron/tsconfig.json'); // usare npx o importare tsc
  let buildContext = config.generateContext();
  ionic.addArgv('--nobrowser')
  ionic.serve(buildContext).then(() => {
    exec('cd .. && ./node_modules/.bin/electron dist/electron/src/main.js --dev')
  }).catch(() => {
    console.log('Error starting watch ionic: ', err)
  });
})

gulp.task('dist', ['electron:assets'], () => {
  return Promise.all([ // promises are executed asynchronously
    new Promise((resolve, reject) => {
      gulp.src(['../electron/electron-resources/**/*'])
        .pipe(gulp.dest('../dist/build/'))
        .on('error', reject)
        .on('end', resolve)
    }),
    new Promise((resolve, reject) => {
      execSync('./node_modules/.bin/tsc -p electron/tsconfig.json', { cwd: '../', stdio: "inherit", shell: true })
      gulp.src(['../package.json'])
        .pipe(gulp.dest('../dist/'))
        .on('end', () => {
          execSync('cd dist && npm install --prod --ignore-scripts', { cwd: '../', stdio: "inherit", shell: true })
          resolve();
        })
        .on('error', reject);
    }),
    new Promise((resolve, reject) => {
      execSync('ionic cordova build browser --prod', { stdio: "inherit", shell: true })
      gulp
        .src(['./platforms/browser/www/**/*'])
        .pipe(gulp.dest('../dist/ionic/www/'))
        .on('error', reject)
        .on('end', resolve)
    }),
  ]).then(() => { // after the promises above are resolved:
    console.log('building electron...')
    electronBuilder.build({ projectDir: '../dist' });
  })
  // a similar behavior can be achieved by creating multiple gulp.task which do not return anything
})

gulp.task('electron:assets', () => {
  return gulp // when this task is used as dependency from another task it will wait for this task to complete
    .src(['../electron/src/assets/**/*'])
    .pipe(gulp.dest('../dist/electron/src/assets/'))
});