import { browser } from 'protractor';

import { Config } from './config';
import { HomePageObject } from './page-objects/home.page-object';

import { } from 'jasmine'

describe('Home', () => {
    let page: HomePageObject;

    beforeEach(() => {
        page = new HomePageObject();
        page.browseToPage();
    });

    it('should have a title saying Barcode To PC', () => {
        page.getTitle().then(title => {
            expect(title).toEqual('Barcode To PC');
        });
    });

    it('should allow to open the Settings page', () => {
        let settingsButton = page.getSettingsButton();
        settingsButton.click();
        expect<any>(page.getSettingsTitle().isPresent()).toBeTruthy();
    });

    it('should show a 240x240px QR code image to pair the app', () => {
        page.getPopOverButton().click();
        browser.driver.sleep(Config.MODAL_OPEN_DELAY);
        page.getShowPairQrCodeButton().click();
        let qrCodeImage = page.getQrCodeImage();
        expect(qrCodeImage.isDisplayed()).toBeTruthy()
        qrCodeImage.getSize().then(size => {
            expect(size.width).toBeGreaterThanOrEqual(240);
        })
    });
});
