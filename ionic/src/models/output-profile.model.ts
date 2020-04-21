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
            /**
             * @deprecated for update transition only
             */
            x.value == 'quantity'
        ) != -1;
    }
}
