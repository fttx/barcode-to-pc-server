# Barcode to PC server

## Useful links
#### Downloads
* Server: https://barcodetopc.com/#download-server
* Android: https://play.google.com/store/apps/details?id=com.barcodetopc
* iOS: https://itunes.apple.com/app/id1180168368

#### Repositories
* Server: https://github.com/fttx/barcode-to-pc-server
* App: https://github.com/fttx/barcode-to-pc-app

## Build status

[![Build status](https://ci.appveyor.com/api/projects/status/un8nkjy7755fh7io?svg=true)](https://ci.appveyor.com/project/fttx/barcode-to-pc-server)


## Setup
  1. Install the required dependencies:
    * Node.js: https://nodejs.org
    * RobotJS: https://github.com/octalmage/robotjs#building
    * electron-builder: https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build#linux
    * node_mdns: https://github.com/agnat/node_mdns#installation

  2. Clone the repository
  
      ```bash
      git clone https://github.com/fttx/barcode-to-pc-server/
      cd barcode-to-pc-server
      npm install
      ```

  * If you get errors related to cairo.h:  https://github.com/SuperiorJT/angular2-qrcode#woah-whats-this-npm-error
  * If you get errors related to dns_sd.h: Install [Bonjour SDK for Windows v3.0](https://developer.apple.com/download/more/) (bonjoursdksetup.exe) 
  * If you get the error `dyld: Library not loaded: /usr/local/opt/glib/lib/libglib-2.0.0.dylib` run `brew install glib`

## Release 
  ```bash
  npm run dist # build the angular project in prod mode and generate the app install files for the current platform, works with Windows/macOS/Linux
  npm run publish # build the angular project in prod mode and generate the app installer for all platforms and uploads them to GitHub releases
  npm run publish-win  # build the angular project in prod mode, generate the app installer for Windows x32, for Windows x64 and uploads them to GitHub releases
  npm run publish-ml  # build the angular project in prod mode, generate the app installer for macOS, Linux and uploads them to GitHub releases
  ```
  
  To sign the installers follow the electron-builder [code-signing tutorial](https://www.electron.build/code-signing). TL;DR: set CSC_LINK and CSC_KEY_PASSWORD environment variables.

  The installer will be put in the dist/dist/ folder.

  If you get sass errors run `npm run fix-sass`


## Run
  * If you're working on the angular project (src):
  ```bash
  npm start # run electron with dev tools and the webserver with livereload
  ```

  * If you want to open it on your browser without electron:
  ```bash
  npm run browser # run the webserver with livereload only
  ```

  * If you're working on the main.ts file:
  ```bash
  npm run watch # run the webserver with livereload and also watch the main.ts file
  npm run electron-dev # run electron with dev tools or press F5 if you're using VSCode to start debugging
  ```
