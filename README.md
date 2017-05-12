
# Barcode to PC server app

## Download
https://barcodetopc.com/


## Setup
  Install the required dependencies:
  * robotjs: https://github.com/octalmage/robotjs#building
  * electron-builder: https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build#linux
  * mdns: https://github.com/agnat/node_mdns#installation

  ```bash
  git clone https://github.com/fttx/barcode-to-pc-server/
  cd barcode-to-pc-server
  npm install
  ```

## Release 
  ```bash
  # build the angular project in prod mode and generate the app install files
  npm run dist # macOS/linux
  npm run win-dist # Windows x64
  npm run win32-dist # Windows x32
  ```
  
  The installer will be put in the electron/dist folder


## Run
  ```bash
  # run webpack dev server
  npm run browser
  # build only the angular project
  npm run build
  # run the project without generating the executable
  npm run electron
  ```
