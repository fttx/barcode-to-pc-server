import { SafeResourceUrl } from "@angular/platform-browser";

export class ApplicationModel {
  applicationName: string;
  applicationIcon: SafeResourceUrl;
  windows: string[] = [];

  constructor(applicationName: string, applicationIcon: SafeResourceUrl, windows: string[]) {
    this.applicationName = applicationName;
    this.applicationIcon = applicationIcon;
    this.windows = windows;
  }
}
