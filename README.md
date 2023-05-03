
<div align="center">
  <img width="128" height="128" src="https://raw.githubusercontent.com/fttx/barcode-to-pc-app/master/resources/icon.png">
</div>

<h1 align="center">Barcode to PC server</h1>

<div align="center">
  <a href="https://github.com/fttx/barcode-to-pc-server/releases">
    <img alt="Downloads"
    src="https://img.shields.io/github/downloads/fttx/barcode-to-pc-server/total">
  </a>

  <a href="https://github.com/fttx/barcode-to-pc-server/releases">
    <img alt="GitHub release (latest SemVer)"
    src="https://img.shields.io/github/v/release/fttx/barcode-to-pc-server?color=rgb%2872%2C191%2C29%29">
  </a>

  <a href="https://ci.appveyor.com/project/fttx/barcode-to-pc-server">
    <img alt="Build status"
    src="https://ci.appveyor.com/api/projects/status/un8nkjy7755fh7io?svg=true">
  </a>

</div>

## Links

**Server**

* 💾 Download (Windows, macOS and Linux): <https://barcodetopc.com/#download-server>
* 📁 Source-code: <https://github.com/fttx/barcode-to-pc-server>

**App**

* 📱Download (Android): <https://play.google.com/store/apps/details?id=com.barcodetopc>
* 📱 Download (iOS): <https://itunes.apple.com/app/id1180168368>
* 📁 Source-code: <https://github.com/fttx/barcode-to-pc-app>

## Overview

The project is divided into two modules/folders:

- electron: contains the core, native dependencies, and helper scripts
- ionic: user interface

When executing npm commands make sure to change the current directory to electron: `cd electron`.

# Setup

1. Install the required System dependencies:
    * Node.js v14
    * Python 3
    <!-- * If you're building on Windows, install these packages:
        * [Bonjour SDK for Windows v3.0](https://developer.apple.com/download/more/) (bonjoursdksetup.exe)
        * [Visual C++ Build Environment 2019](https://github.com/nodejs/node-gyp#on-windows)
          * Download link: https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools
          * When installing it check `Desktop Applications (Visual C++)` and `Windows 10 SDK` packages
          * After the installation run `npm config set msvs_version 2019` -->
    * If you're building on macOS, run: `brew install glib`
    <!-- * If you're building on Linux, run: `sudo apt-get install -y libx11-dev libxtst-dev libpng-dev zlib1g-dev icnsutils graphicsmagick libavahi-compat-libdnssd-dev && sudo snap install snapcraft --classic` -->

2. Clone the repository
    ```bash
    git clone https://github.com/fttx/barcode-to-pc-server/
    cd barcode-to-pc-server
    cd electron
    npm install
    ```

If you get errors check these links:

  * nutjs.dev: <https://nutjs.dev/tutorials/first_steps>
  * electron-builder: <https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build#linux>
  * node_mdns: <https://github.com/agnat/node_mdns#installation>

## Run

The `npm start` command:
- Runs the Electron app in development mode
- Launches the ionic project in livereload mode

Notes:

- If you're editing the [electron](./electron) folder, you have to quit the server and  run it again. Use the F6 button on Visual Studio Code.
- If you're using Windows use the PowerShell

## Release

  ```bash
  npm run build # builds the angular project in prod mode and generates the signed installer for the current platform
  npm run publish # same as build, but uploads the installer to GitHub releases
  ```
* To enable the publishing to GitHub releases set `GH_TOKEN` environment variable and give all the `repo` permissions
* The installer will be put in the electron/dist/ folder.
* If you get sass errors run `cd ../ionic && npm rebuild node-sass --force`

## Code Signing

1. Set `certificateSubjectName` or `certificateSha1` parameter in the package.json
2. Connect the physical token (Use the Microsoft Remote Desktop app to share the token with virtual machines)
3. Run `npm run publish`

Resources:
-  [Code Signing - electron-builder](https://www.electron.build/code-signing)
-  [Any Windows Target - electron-builder](https://www.electron.build/configuration/win)
-  [electron-builder source-code](https://github.com/electron-userland/electron-builder/blob/ebbd9f796e2d8d5b0720b2b699ba24dc159ee692/packages/app-builder-lib/src/codeSign/windowsCodeSign.ts#L116)

## Simulate updates

1. Install minio as explained [here](https://github.com/electron-userland/electron-builder/issues/3053#issuecomment-401001573)
2. Run `./node_modules/.bin/electron-builder --project ./dist/ -c.compression=store --config.publish.provider=s3 --config.publish.endpoint=http://IP:9000 --config.publish.bucket=test-update`

## Publishing updates

The server implements [electron-update](https://www.electron.build/auto-update).

To publish an update:

1. Draft a [new
   release](https://github.com/fttx/barcode-to-pc-server/releases/new) on GitHub
   and name it `v<new version number>`
2. Increase the version number of the package.json
3. Commit & push the changes
4. Add a tag and name it `v<new version number>`
5. Push the tag
6. Run `npm run publish`

Note: for macOS delete the `electron/electron-resources/*.rtf` folder and run: `npm run publish`

At this point if all looks good the only thing left to do is to publish the Github release draft.

## Translations

| Language           | Contributors      |
| :----------------- |:------------------|
| Chinese            | -                 |
| Deutsch            | Bruno Wenger      |
| Español            | Juan Manuel       |
| Italiano           | Francesco Accardi |
| English            | Filippo Tortomasi |
| Arabic             | Bassam Mawardi    |


Are you fluent in any other language than English? If you found a typo, or want to help translate Barcode to PC, get in touch [here](https://barcodetopc.com/contact/).
