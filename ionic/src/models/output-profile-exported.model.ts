import { OutputProfileModel } from "./output-profile.model";
import { SettingsModel } from "./settings.model";

export class OutputProfileExportedModel extends OutputProfileModel {
  extras?: {
    timestamp: number,
    settings: SettingsModel,
    deleteOtherTemplates: boolean,
    basePath: string,
  }
}
