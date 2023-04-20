import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ImageViewerPage } from './image-viewer';

@NgModule({
  declarations: [
    ImageViewerPage,
  ],
  imports: [
    IonicPageModule.forChild(ImageViewerPage),
  ],
})
export class ImageViewerPageModule {}
