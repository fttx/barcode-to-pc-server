const gulp = require('gulp')
const config = require('@ionic/app-scripts/dist/util/config')
const ionic = require('@ionic/app-scripts')
const { exec, execSync, spawn } = require('child_process');
const electronBuilder = require('../node_modules/electron-builder')
const typescript = require('../node_modules/typescript')
const mocha = require('../node_modules/mocha')
const  fs = require('fs');

gulp.task('serve', ['electron:assets'], () => {
  exec('npm run tsc:watch-electron', { cwd: '../', stdio: "inherit", shell: true })
  let buildContext = config.generateContext();
  ionic.addArgv('--nobrowser')
  ionic.addArgv('--port')
  ionic.addArgv('8200')  
  ionic.serve(buildContext).then(() => {
    exec('npm run electron:dev', { cwd: '../', stdio: "inherit", shell: true })
  }).catch(() => {
    console.log('Error starting watch ionic: ', err)
  });
})

gulp.task('build', ['electron:assets'], () => {
  return Promise.all([ // promises are executed asynchronously
    new Promise((resolve, reject) => {
      gulp.src(['../electron/electron-resources/**/*'])
        .pipe(gulp.dest('../dist/build/'))
        .on('error', reject)
        .on('end', resolve)
    }),
    new Promise((resolve, reject) => {
      execSync('npm run tsc:electron', { cwd: '../', stdio: "inherit", shell: true })
      gulp.src(['../package.json'])
        .pipe(gulp.dest('../dist/'))
        .on('end', resolve)
        .on('error', reject);
    }),
    new Promise((resolve, reject) => {
      // ionic.build doesn't add the platform if it isn't installed first.
      // let buildContext = config.generateContext({
      //   isProd: true,
      //   platform: 'browser',
      // });
      // ionic.build(buildContext).then(() => {
      //   gulp
      //     .src(['./platforms/browser/www/**/*'])
      //     .pipe(gulp.dest('../dist/ionic/www/'))
      //     .on('error', reject)
      //     .on('end', resolve)
      // })

      // exec is less cross-platoform but at least works
      execSync('ionic cordova build browser --prod', { stdio: "inherit", shell: true })
      gulp
        .src(['./platforms/browser/www/**/*'])
        .pipe(gulp.dest('../dist/ionic/www/'))
        .on('error', reject)
        .on('end', resolve)
    }),
  ])  // a similar behavior can be achieved by creating multiple gulp.task which do not return anything
})

gulp.task('dist', ['build', 'dist:install-prod'], () => {
  return electronBuilder.build({ projectDir: '../dist' });
})

gulp.task('publish', ['build', 'dist:install-prod'], () => {
  return electronBuilder.build({ projectDir: '../dist', publish: 'always' });
})

gulp.task('test', ['build'], () => {
  execSync('npm run tsc:electron', { cwd: '../', stdio: "inherit", shell: true }) // this way i'm sure that it's compiled before launching mocha
  return execSync('npm run mocha', { cwd: '../', stdio: "inherit", shell: true })
})

gulp.task('electron:assets', () => {
  return gulp // when this task is used as dependency from another task it will wait for this task to complete
    .src(['../electron/src/assets/**/*'])
    .pipe(gulp.dest('../dist/electron/src/assets/'))
});

gulp.task('dist:install-prod', () => {
  if (!fs.existsSync('../dist')) {
    fs.mkdirSync('../dist');
  }
  return execSync('npm install --prod --ignore-scripts', { cwd: '../dist', stdio: "inherit", shell: true })
})
