import { exec, execSync } from "child_process";
import * as electronBuilder from "electron-builder";
import * as log from 'fancy-log';
import * as fs from 'fs-extra';
import { dest, parallel, series, src, symlink, watch } from 'gulp';
import * as rm from 'gulp-clean';
import * as zip from 'gulp-zip';
import * as path from 'path';
import * as release from 'fttx-gulp-github-release';

function clean() {
    return src(['dist', 'bin'], { read: false, allowEmpty: true }).pipe(rm());
}


// prepare
function prepareIonic(cb) {
    if (!fs.existsSync('../ionic/node_modules')) {
        log('👉 Ionic node_modules not found. Installing ionic dependencites: npm i');
        execSync('npm i', { cwd: '../ionic/', stdio: 'inherit' });
        log('Ionic dependencies installed.');
    }
    cb();
}

function prepareElectronAssets() {
    // copy src/assets to bin
    return src('src/assets/**/*')
        .pipe(dest('bin/assets'));
}

function prepareElectronConfig() {
    return src('../ionic/src/config.ts')
        .pipe(symlink('src/'));
}

function prepareElectronModels() {
    return src('../ionic/src/models/**/*')
        .pipe(symlink('src/models/ionic'));
}


// start
function startElectronTsc(cb) {
    log('👉 npm run tsc -- --watch');
    exec('npm run tsc -- --watch');
    watch('bin/main.js', startElectron);
    cb();
}

function startElectron(cb) {
    log('👉 npm run electron -- --dev');
    exec('npm run electron -- --dev');
    cb();
}

function startIonicServe(cb) {
    log('👉 npm run start -- --port 8200 --nobrowser');
    execSync('npm run start -- --port 8200 --nobrowser', { cwd: '../ionic/', stdio: process.execArgv[0] == '--log' ? 'inherit' : 'ignore' });
    cb();
}

// build
function buildIonic(cb) {
    execSync('npm run build -- --prod', { cwd: '../ionic/', stdio: 'inherit' });
    return src(['../ionic/www/**/*'])
        .pipe(dest(path.join(__dirname, './bin/www')))
}

function buildElectron(cb) {
    execSync('npm run tsc', { stdio: 'inherit' });
    cb();
}

// dist
function build(cb) {
    electronBuilder.build({ publish: 'never' }).then(() => { cb(); });
}

// publish
function publish(cb) {
    electronBuilder.build({ publish: 'always' }).then(() => {
        if (process.platform.startsWith('win')) {
            log('👉 zip offline installer');
            src('dist/nsis-web/*')
                .pipe(zip('barcode-to-pc-server.offline-installer.zip'))
                .pipe(dest('dist/'))
                .pipe(release({
                    draft: true,
                    manifest: require('package.json'),
                    reuseRelease: true,
                }))
                .on('end', () => { cb(); })
                .on('error', (err) => { log(err); cb(); });
        } else {
            cb();
        }
    });
}

exports.clean = clean
exports.prepare = series(prepareIonic, prepareElectronAssets, prepareElectronConfig, prepareElectronModels)

exports.start = series(exports.prepare, parallel(startElectron, startElectronTsc, startIonicServe));
exports.build = series(buildIonic, buildElectron, build);
exports.publish = series(buildIonic, buildElectron, publish);
exports.default = series(clean, exports.prepare, exports.build);
