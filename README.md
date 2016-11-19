
# Barcode to PC server app
```bash
# angular2 cli required
npm install -g angular-cli
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
# generates the executable whitout the installer
npm run preview
```

# Build
Install node-gyp: https://github.com/nodejs/node-gyp#installation
Install other required libraries: https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build
```bash
npm install
# builds angular project in prod mode and generate app install files
npm run dist
```
