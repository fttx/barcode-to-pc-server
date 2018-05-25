import { browser, by, element, promise } from 'protractor';

export class HomePageObject {
    browseToPage() {
        browser.get('');
    }

    getTitle(): promise.Promise<string> {
        return browser.getTitle();
    }

    getSettingsButton() {
        return element(by.css('.settings-button'))
    }

    getSettingsTitle() {
        return element(by.css('.settings-title'))
    }


    getPopOverButton() {
        return element(by.css('.pop-over-button'))
    }

    getQrCodeImage() {
        return element(by.css('.qr-code-element img'))
    }

    getShowPairQrCodeButton() {
        return element(by.css('.show-pair-qr-code-button'))
    }
}