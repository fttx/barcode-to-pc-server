import { ScanModel } from './scan.model'

/**
 * When editing this interface make you sure to update also the
 * app/ScanSessionsStorage methods
 */
export interface ScanSessionModel {
    id: number;
    name: string;
    date: number;
    scannings: ScanModel[];
    selected: boolean;
    /**
     * Array of the servers' UUIDs where the scan session has been pushed
     */
    syncedWith: string[];
}
