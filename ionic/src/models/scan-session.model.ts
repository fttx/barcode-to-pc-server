import { ScanModel } from './scan.model'

export interface ScanSessionModel {
    id: number;
    name: string;
    date: number;
    scannings: ScanModel[];
    selected: boolean;
}
