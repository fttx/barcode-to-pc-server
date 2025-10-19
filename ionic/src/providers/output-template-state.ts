import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Service to manage the current output template state
 * Used by the variable injector directive to show only available variables
 */
@Injectable()
export class OutputTemplateState {
    private currentTemplateSubject = new BehaviorSubject<any[]>([]);
    public currentTemplate$ = this.currentTemplateSubject.asObservable();

    constructor() { }

    /**
     * Update the current output template
     * @param outputBlocks Array of output blocks in the current template
     */
    setCurrentTemplate(outputBlocks: any[]) {
        this.currentTemplateSubject.next(outputBlocks || []);
    }

    /**
     * Get the current output template
     */
    getCurrentTemplate(): any[] {
        return this.currentTemplateSubject.value;
    }

    /**
     * Get available variables up to a specific output block
     * @param currentBlockId The ID or index of the current block being edited (optional)
     * @returns Array of available variable names
     */
    getAvailableVariables(currentBlockId?: string): string[] {
        const outputBlocks = this.getCurrentTemplate();
        const availableVars = new Set<string>();

        // Always available system variables
        availableVars.add('timestamp');
        availableVars.add('date_time');
        availableVars.add('scan_session_name');
        availableVars.add('device_name');

        // Find the index of the current block if ID is provided
        let stopIndex = outputBlocks.length;
        if (currentBlockId !== undefined) {
            const currentIndex = outputBlocks.findIndex((block, index) => {
                // Match by ID if available, otherwise by index
                return block.id === currentBlockId || index.toString() === currentBlockId;
            });
            if (currentIndex !== -1) {
                stopIndex = currentIndex;
            }
        }

        // Check if there are multiple barcode components (enables 'barcodes' variable)
        let barcodeCount = 0;

        // Iterate through blocks up to the current position
        for (let i = 0; i < stopIndex; i++) {
            const block = outputBlocks[i];
            if (!block || !block.type) continue;

            const blockType = block.type.toLowerCase();

            // Map component types to variable names
            switch (blockType) {
                case 'barcode':
                    barcodeCount++;
                    availableVars.add('barcode');
                    break;
                case 'number':
                    availableVars.add('number');
                    break;
                case 'text':
                    availableVars.add('text');
                    break;
                case 'select_option':
                    availableVars.add('select_option');
                    break;
                case 'http':
                    availableVars.add('http');
                    break;
                case 'run':
                    availableVars.add('run');
                    break;
                case 'csv_lookup':
                    availableVars.add('csv_lookup');
                    break;
                case 'csv_update':
                    availableVars.add('csv_update');
                    break;
                case 'function':
                case 'javascript_function':
                    availableVars.add('javascript_function');
                    break;
                case 'woocommerce':
                    availableVars.add('woocommerce');
                    break;
                case 'google_sheets':
                    availableVars.add('google_sheets');
                    break;
                case 'static_text':
                    availableVars.add('static_text');
                    break;
            }
        }

        // Add 'barcodes' if there are multiple barcode components
        if (barcodeCount > 1) {
            availableVars.add('barcodes');
        }

        return Array.from(availableVars).sort();
    }
}
