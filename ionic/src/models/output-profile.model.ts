import { OutputBlockModel } from "./output-block.model";

/**
 * It's a set of OutputBlocks, also called "Ouput template" in the UI
 */
export class OutputProfileModel {
    public name: string;
    /**
     * Contains the Barcode to PC version of the server (used when exporting/imp
     * porting Output Templates)
     */
    public version: string;
    public outputBlocks: OutputBlockModel[] = [];

    /**
     * @returns TRUE when the outputProfile contains components such as NUMBER or TEXT
     */
    static ContainsDialogComponents(outputProfile: OutputProfileModel): boolean {
        return outputProfile.outputBlocks.findIndex(x =>
            x.value == 'number' || x.value == 'text' ||
            /**
             * @deprecated for update transition only
             */
            x.value == 'quantity'
        ) != -1;
    }
    /**
     * @returns TRUE when there is a block that requires the interaction with the UI
     */
    static ContainsBlockingComponents(outputProfile: OutputProfileModel): boolean {
        return outputProfile.outputBlocks.findIndex(x =>
            x.value == 'number' || x.value == 'text' || x.type == 'select_option' ||
            x.type == 'http' || x.type == 'run' || x.type == 'csv_lookup' ||
            x.type == 'alert' ||
            /**
             * @deprecated for update transition only
             */
            x.value == 'quantity'
        ) != -1;
    }
    /**
     * @returns TRUE when there is at least one components component that has a
     * different enabledFormats field from the other BARCODE components.
     */
    // static ContainsMixedBarcodeFormats(outputProfile: OutputProfileModel): boolean {
    //   for (let i = 0; i < outputProfile.outputBlocks.length; i++) {
    //     let block1 = outputProfile.outputBlocks[i];
    //     if (block1.type == 'barcode') {
    //       for (let j = i + 1; j < outputProfile.outputBlocks.length; j++) {
    //         let block2 = outputProfile.outputBlocks[j];
    //         if (block2.type == 'barcode' && JSON.stringify(block2.enabledFormats) != JSON.stringify(block1.enabledFormats)) {
    //           return true;
    //         }
    //       }
    //     }
    //   }
    //   return false;
    // }
    /**
     * @returns TRUE when there is at least two BARCODE components.
     */
    static ContainsMultipleBarcodeFormats(outputProfile: OutputProfileModel): boolean {
        let count = 0;
        for (let i = 0; i < outputProfile.outputBlocks.length; i++) {
            if (outputProfile.outputBlocks[i].type == 'barcode') {
                count++;
            }
            if (count >= 2) {
                return true;
            }
        }
        return false;
    }
}
