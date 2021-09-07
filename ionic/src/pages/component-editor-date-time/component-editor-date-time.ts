import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import moment from 'moment';
import { Config } from '../../../../electron/src/config';
import { OutputBlockModel } from '../../models/output-block.model';
import { ElectronProvider } from '../../providers/electron/electron';
import { UtilsProvider } from '../../providers/utils/utils';

@Component({
  selector: 'page-component-editor-date-time',
  templateUrl: 'component-editor-date-time.html',
})
export class ComponentEditorDateTimePage implements OnInit, OnDestroy {
  public outputBlock: OutputBlockModel;

  public dateTimeNowExample = new Date();
  public dateTimeSelectedDefaultFormat;
  public enableCustomFormat = false;
  private dateTimeInterval = null;
  public getFormats() { return UtilsProvider.DATE_TIME_DEFAULT_FORMATS; }
  public getLocales() { return UtilsProvider.DATE_TIME_LOCALES; }

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private electronProvider: ElectronProvider, // required from the template
  ) {
    this.outputBlock = this.navParams.get('outputBlock');

    if (this.outputBlock.type == 'date_time') {
      this.dateTimeSelectedDefaultFormat = UtilsProvider.DATE_TIME_DEFAULT_FORMATS[0].value;
      let index = UtilsProvider.DATE_TIME_DEFAULT_FORMATS.findIndex(x => x.value == this.outputBlock.format);
      if (index != -1) {
        this.dateTimeSelectedDefaultFormat = this.outputBlock.format;
      } else {
        this.enableCustomFormat = true;
      }
    }
  }

  ngOnDestroy(): void {
    if (this.dateTimeInterval) clearInterval(this.dateTimeInterval);
  }
  ngOnInit(): void {
    if (this.outputBlock.type == 'date_time') {
      if (this.dateTimeInterval) clearInterval(this.dateTimeInterval);
      this.dateTimeInterval = setInterval(() => { this.dateTimeNowExample = new Date(); }, 1000)
    }
  }


  onDateTimeDefaultFormatsChange(newValue) {
    this.outputBlock.format = this.dateTimeSelectedDefaultFormat;
  }

  dateTimeEnableCustomFormatChange(enable) {
    if (!enable.checked) {
      let index = UtilsProvider.DATE_TIME_DEFAULT_FORMATS.findIndex(x => x.value == this.outputBlock.format);
      if (index != -1) {
        this.dateTimeSelectedDefaultFormat = this.outputBlock.format
      } else {
        this.dateTimeSelectedDefaultFormat = UtilsProvider.DATE_TIME_DEFAULT_FORMATS[0].value;
      }
    }
    this.outputBlock.format = this.dateTimeSelectedDefaultFormat;
  }

  onDateTimeLocaleChange(locale) {
    moment.locale(this.outputBlock.locale);
  }

  getUrlSupportedDateFormats() {
    return Config.URL_SUPPORTED_DATE_FORMATS;
  }
}
