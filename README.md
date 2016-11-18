
# Barcode to PC server app

```bash

# angular2 cli required
npm install -g angular-cli


# install
npm install

# run webpack dev server
npm start

# run karma tests
npm test

# build angular project
npm run build

# preview electron (without angular build)
npm run electron

# create electron package (build included)
npm run package

```


# Build
```bash
npm install
# build angular project and put it on electron/app directory
npm dist

cd electron
# install non-angular dependencies (they've been alredy included in a single file by the previous step)
npm install
# build installation files and put them in the electron/dist folder
npm dist
```