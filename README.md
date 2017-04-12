
# Barcode to PC server app

## Download
https://barcodetopc.com/


## Build 

- Install required dependencies:
  * robotjs: https://github.com/octalmage/robotjs#building
  * electron-builder: https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build#linux
  * mdns: https://github.com/agnat/node_mdns#installation
  
- and finally build the project:
  ```bash
  npm install
  # builds angular project in prod mode and generate app install files
  npm run dist # macOS/linux
  npm run win-dist # Windows x64
  npm run win32-dist # Windows x32
  ```


## Run
```bash
npm install
# run webpack dev server
npm start
# run karma tests
npm test
# build angular project
npm run build
# generates the executable whitout the installer (install robotjs dependencies first!)
npm run preview
```
