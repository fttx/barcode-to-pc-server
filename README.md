
# Barcode to PC server app

# Build 

- Install required dependencies:
  - robotjs: https://github.com/octalmage/robotjs#building
  - electron-builder: https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build#linux
  
- and finally build the project:
  ```bash
  npm install
  # builds angular project in prod mode and generate app install files
  npm run dist
  ```

# Run
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
