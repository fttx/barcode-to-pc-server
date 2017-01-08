import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivate } from '@angular/router';
import { Storage } from './storage.service';

// This class is used for defining the logic that restricts the accesss to the app when the welcome procedure isn't compleded yet.

@Injectable()
export class EverConnectedService implements CanActivate {

  constructor(
    private storage: Storage,
    private router: Router,
  ) { }

  canActivate(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let everConnected = this.storage.everConnected;
      //resolve(true);
      //return;
      if (!everConnected) {
        this.router.navigate(['welcome']);
      }
      //resolve(false)
      resolve(everConnected);
    });

  }
}
