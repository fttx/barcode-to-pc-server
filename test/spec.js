const Application = require('spectron').Application
const assert = require('assert')
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')

describe('Application launch', function () {
    this.timeout(10000)

    before(function () {
        this.app = new Application({
            path: electronPath,
            args: [path.join(__dirname, '../dist/electron/src/main.js')],
            chromeDriverArgs: ['--test']
        })
        return this.app.start()
    })

    after(function () {
        if (this.app && this.app.isRunning()) {
            return this.app.stop()
        }
    })

    // afterEach(function () {
    //     if (this.app && this.app.isRunning()) {
    //         return this.app.stop()
    //     }
    // })

    it('shows an initial window', function () {
        return this.app.client.waitUntilWindowLoaded().getWindowCount().then(function (count) {
            assert.equal(count, 1)
        })
    })

    it('has the correct window title', function () {
        return this.app.client.getTitle().then((title) => {
            assert.equal(title, 'Barcode To PC server')
        });
    })
})