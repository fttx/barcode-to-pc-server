import { ScanModel } from './scan.model'

export interface ScanSessionModel {
    name: string;
    date: Date;
    scannings: ScanModel[];
}