const gulp = require('gulp')
const fs = require('fs');
const { exec, execSync, spawn } = require('child_process');
const electronBuilder = require('electron-builder')


gulp.task('ionic:install', () => {
    console.log('ionic:install start')
    return new Promise((resolve, reject) => {
        if (!fs.existsSync('../ionic/node_modules')) {
            console.log('../ionic/node_modules does not exists, installing ionic')
            execSync('npm i', { cwd: '../ionic', stdio: "inherit", shell: true })
            console.log('ionic installed')
        } else {
            console.log('ionic already installed')
        }
        resolve();
    })
})

gulp.task('serve', ['electron:assets', 'ionic:install'], () => {
    const ionicConfig = require('../ionic/node_modules/@ionic/app-scripts/dist/util/config')
    const ionic = require('../ionic/node_modules/@ionic/app-scripts')

    // exec('npm run tsc:watch-electron', { cwd: '../', stdio: "inherit", shell: true })
    let buildContext = ionicConfig.generateContext({ rootDir: '../ionic' });
    ionic.addArgv('--nobrowser')
    ionic.addArgv('--port')
    ionic.addArgv('8200')
    ionic.serve(buildContext).then(() => {
        // exec('npm run electron:dev', { cwd: '../', stdio: "inherit", shell: true })
    }).catch(() => {
        console.log('Error starting watch ionic: ', err)
    });
})


gulp.task('electron:assets', ['mkdir'], () => {
    return gulp // when this task is used as dependency from another task it will wait for this task to complete
        .src(['electron/src/assets/**/*'])
        .pipe(gulp.dest('dist/electron/src/assets/'))
});

gulp.task('electron:tsc', ['mkdir'], () => {
    return new Promise((resolve, reject) => {
        execSync('npm run tsc', { stdio: "inherit", shell: true })
        gulp.src(['package.json'])
            .pipe(gulp.dest('../dist/'))
            .on('end', resolve)
            .on('error', reject);
    })
});

gulp.task('mkdir', () => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync('../dist')) {
            fs.mkdirSync('../dist');
        }
        resolve();
    })
})

gulp.task('electron:resources', ['mkdir'], () => {
    return new Promise((resolve, reject) => {
        gulp.src(['electron-resources/**/*'])
            .pipe(gulp.dest('../dist/build/'))
            .on('error', reject)
            .on('end', resolve)
    })
});

gulp.task('build', ['electron:resources', 'electron:tsc', 'electron:assets']);

gulp.task('dist', ['build'], () => {
    return electronBuilder.build({ projectDir: '../dist' });
})
