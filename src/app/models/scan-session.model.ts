import { ScanModel } from './scan.model'

export interface ScanSessionModel {
    id: string;
    name: string;
    date: Date;
    scannings: ScanModel[];
}