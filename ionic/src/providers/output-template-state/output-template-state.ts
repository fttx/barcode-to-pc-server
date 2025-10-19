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

  // Store the currently editing block
  private currentEditingBlock: any = null;

  constructor() { }

  /**
   * Set the block currently being edited
   * @param block The output block being edited
   */
  setCurrentEditingBlock(block: any) {
    this.currentEditingBlock = block;
  }

  /**
   * Clear the current editing block (when modal closes)
   */
  clearCurrentEditingBlock() {
    this.currentEditingBlock = null;
  }

  /**
   * Get the currently editing block
   */
  getCurrentEditingBlock(): any {
    return this.currentEditingBlock;
  }

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
   * @param currentBlockId The ID or index of the current block being edited (optional, will use currentEditingBlock if not provided)
   * @returns Array of available variable names
   */
  getAvailableVariables(currentBlockId?: string): string[] {
    const outputBlocks = this.getCurrentTemplate();
    const availableVars = new Set<string>();

    // Use the stored editing block if no ID provided
    const blockToFind = currentBlockId !== undefined ? currentBlockId : this.currentEditingBlock;


    // Always available system variables
    availableVars.add('timestamp');
    availableVars.add('scan_session_name');
    availableVars.add('device_name');

    // Find the index of the current block if provided
    let stopIndex = outputBlocks.length;
    if (blockToFind) {
      const currentIndex = outputBlocks.findIndex((block, index) => {
        // Match by reference (object identity) first, then by ID or index
        return block === blockToFind || block.id === blockToFind || index.toString() === blockToFind;
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
      if (!block || !block.name) continue;

      const blockName = block.name.toLowerCase();

      // Map component names to variable names
      // Using name instead of type for more reliable detection
      switch (blockName) {
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
        case 'static_text':
          availableVars.add('static_text');
          break;
        case 'timestamp':
          availableVars.add('timestamp');
          break;
        case 'date_time':
          availableVars.add('date_time');
          break;
        case 'scan_session_name':
          availableVars.add('scan_session_name');
          break;
        case 'device_name':
          availableVars.add('device_name');
          break;
        case 'select_option':
          availableVars.add('select_option');
          break;
        case 'http_request':
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
        case 'javascript_function':
          availableVars.add('javascript_function');
          break;
        case 'woocommerce':
          availableVars.add('woocommerce');
          break;
        case 'google_sheets':
          availableVars.add('google_sheets');
          break;
      }
    }

    // Add 'barcodes' if there are multiple barcode components
    if (barcodeCount > 1) {
      availableVars.add('barcodes');
    }

    const result = Array.from(availableVars).sort();
    return result;
  }
}
