const gulp = require('gulp')
const config = require('@ionic/app-scripts/dist/util/config')
const ionic = require('@ionic/app-scripts')
const { exec, execSync, spawn } = require('child_process');

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

gulp.task('dist', ['electron:assets'], done => {
  return Promise.all([ // promises are executed asynchronously
    new Promise((resolve, reject) => {
      gulp.src(['../electron/electron-resources/**/*'])
        .pipe(gulp.dest('../dist/build/'))
        .on('error', reject)
        .on('end', resolve)
    }),
    new Promise((resolve, reject) => {
      execSync('cd ../ && ./node_modules/.bin/tsc -p electron/tsconfig.json');
      gulp.
        src(['../package.json']).pipe(gulp.dest('../dist/')).on('end', () => {
          execSync('cd ../dist && npm install --prod');
          resolve();
        })
        .on('error', reject)
    }),
    new Promise((resolve, reject) => {
      let buildContext = config.generateContext({ isProd: true });
      ionic.build(buildContext).then(() => {
        gulp
          .src(['./platforms/browser/www/**/*'])
          .pipe(gulp.dest('../dist/ionic/www/'))
          .on('error', reject)
          .on('end', resolve)
      }).catch(() => {
        console.log('Error building ionic: ', err)
        reject();
      });
    }),
  ]).then(() => { // after the promises above are resolved:
    console.log('building electron...')
    spawn("../node_modules/.bin/electron-builder", [], { cwd: '../dist', stdio: "inherit", shell: true });
  })
  // a similar behavior can be achieved by creating multiple gulp.task which do not return anything
})

gulp.task('electron:assets', () => {
  return gulp // when this task is used as dependency from another task it will wait for this task to complete
      .src(['../electron/src/assets/**/*'])
      .pipe(gulp.dest('../dist/electron/src/assets/'))
});