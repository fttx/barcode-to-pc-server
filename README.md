
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

* Download (Windows, macOS and Linux): <https://barcodetopc.com/#download-server>
* Source-code: <https://github.com/fttx/barcode-to-pc-server>

**App**

* Download (Android): <https://play.google.com/store/apps/details?id=com.barcodetopc>
* Download (iOS): <https://itunes.apple.com/app/id1180168368>
* Source-code: <https://github.com/fttx/barcode-to-pc-app>

## Setup

1. Install the required dependencies:
    * Node.js: <https://nodejs.org>
    * RobotJS: <https://github.com/octalmage/robotjs#building>
    * electron-builder: <https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build#linux>
    * node_mdns: <https://github.com/agnat/node_mdns#installation>
    * If you're building on Windows, install these packages:
        * [Bonjour SDK for Windows v3.0](https://developer.apple.com/download/more/) (bonjoursdksetup.exe)
        * [Python 2.7 and Visual C++ Build Environment](https://github.com/nodejs/node-gyp#on-windows)
    * If you're building on macOS, install these packages: `brew install glib`
    * If you're building on Linux, install these packages: `sudo apt-get install -y libx11-dev libxtst-dev libpng-dev zlib1g-dev icnsutils graphicsmagick libavahi-compat-libdnssd-dev && sudo snap install snapcraft --classic`

2. Clone the repository
    ```bash
    git clone https://github.com/fttx/barcode-to-pc-server/
    cd barcode-to-pc-server
    npm install
    ```

## Run

The `npm start` command:
- Runs the Electron app in develmpment mode
- Launches the ionic project in livereload mode

Notes:
- `npm run build` must be called at least once before using `npm start`
- If you're editing the [electron](./electron) folder, you have to quit the server and  run it again. Use the F6 button on Visual Studio Code.
- If you're using Windows use cmd.exe

## Release

  ```bash
  npm run dist # build the angular project in prod mode and generate the app install files for the current platform, works with Windows/macOS/Linux. Out dir: dist/dist/
  npm run publish # build the angular project in prod mode and generate the app installer for the current platform and uploads it to GitHub releases
  ```
* To enable the publishing to GitHub releases set `GH_TOKEN` environment variable and give all the `repo` permissions
* The installer will be put in the dist/dist/ folder.
* If you get sass errors run `cd ionic && npm rebuild node-sass --force`

## Code Signign

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