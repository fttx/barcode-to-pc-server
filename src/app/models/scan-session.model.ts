import { ScanModel } from './scan.model'

export interface ScanSessionModel {
    id: number;
    name: string;
    date: Date;
    scannings: ScanModel[];
    selected: boolean;
}