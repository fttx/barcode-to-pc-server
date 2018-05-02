import { Component } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Platform } from 'ionic-angular';

import { HomePage } from '../pages/home/home';
import { ElectronProvider } from '../providers/electron/electron';
import { WelcomePage } from '../pages/welcome/welcome';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  // rootPage: any = SettingsPage;
  rootPage: any = HomePage;
  // rootPage: any = WelcomePage;

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    electronProvider: ElectronProvider,
  ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      // statusBar.styleDefault();
      // splashScreen.hide();

      electronProvider.sendReadyToMainProcess();


    });
  } 

}
