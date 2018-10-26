const gulp = require('gulp')
const { exec, execSync, spawn } = require('child_process');
const electronBuilder = require('../node_modules/electron-builder')
const typescript = require('../node_modules/typescript')
const mocha = require('../node_modules/mocha')
const fs = require('fs');

gulp.task('serve', ['electron:assets', 'ionic:install'], () => {
  const ionicConfig = require('@ionic/app-scripts/dist/util/config')
  const ionic = require('@ionic/app-scripts')

  exec('npm run tsc:watch-electron', { cwd: '../', stdio: "inherit", shell: true })
  let buildContext = ionicConfig.generateContext();
  ionic.addArgv('--nobrowser')
  ionic.addArgv('--port')
  ionic.addArgv('8200')
  ionic.serve(buildContext).then(() => {
    exec('npm run electron:dev', { cwd: '../', stdio: "inherit", shell: true })
  }).catch(() => {
    console.log('Error starting watch ionic: ', err)
  });
})

gulp.task('electron:resources', ['mkdir'], () => {
  return new Promise((resolve, reject) => {
    gulp.src(['../electron/electron-resources/**/*'])
      .pipe(gulp.dest('../dist/build/'))
      .on('error', reject)
      .on('end', resolve)
  })
});

gulp.task('electron:tsc', ['mkdir'], () => {
  return new Promise((resolve, reject) => {
    execSync('npm run tsc:electron', { cwd: '../', stdio: "inherit", shell: true })
    gulp.src(['../package.json'])
      .pipe(gulp.dest('../dist/'))
      .on('end', resolve)
      .on('error', reject);
  })
});

gulp.task('ionic:install', () => {
  console.log('ionic:install start')
  return new Promise((resolve, reject) => {
    if (!fs.existsSync('node_modules')) {
      console.log('node_modules does not exists, installing ionic')
      execSync('npm i', { stdio: "inherit", shell: true })
      console.log('ionic installed')
    } else {
      console.log('ionic already installed')
    }
    resolve();
  })
})

gulp.task('ionic:build', ['mkdir', 'ionic:install'], () => {
  const ionicConfig = require('@ionic/app-scripts/dist/util/config')
  const ionic = require('@ionic/app-scripts')

  return new Promise((resolve, reject) => {
    // exec is less cross-platoform but at least works
    execSync('npm run build:browser', { stdio: "inherit", shell: true })

    // ionic.build doesn't add the platform if it isn't installed first.
    // let buildContext = ionicConfig.generateContext({
    //   isProd: true,
    //   platform: 'browser',
    // });
    // ionic.build(buildContext).then(() => {
    //   gulp
    //     // .src(['./platforms/browser/www/**/*'])
    //     .src(['./www/**/*'])
    //     .pipe(gulp.dest('../dist/ionic/www/'))
    //     .on('error', reject)
    //     .on('end', resolve)
    // })
  })
});

gulp.task('electron:assets', ['mkdir'], () => {
  return gulp // when this task is used as dependency from another task it will wait for this task to complete
    .src(['../electron/src/assets/**/*'])
    .pipe(gulp.dest('../dist/electron/src/assets/'))
});


gulp.task('build', ['electron:resources', 'electron:tsc', 'ionic:build', 'electron:assets']);

gulp.task('dist', ['build'], () => {
  return electronBuilder.build({ projectDir: '../dist' });
})

gulp.task('publish', ['build'], () => {
  return electronBuilder.build({ projectDir: '../dist', publish: 'always' });
})

gulp.task('test', ['build'], () => {
  execSync('npm run tsc:electron', { cwd: '../', stdio: "inherit", shell: true }) // this way i'm sure that it's compiled before launching mocha
  return execSync('npm run mocha', { cwd: '../', stdio: "inherit", shell: true })
})


gulp.task('mkdir', () => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync('../dist')) {
      fs.mkdirSync('../dist');
    }
    resolve();
  })
})
