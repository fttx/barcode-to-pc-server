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

    static HasQuantityBlocks(outputProfile: OutputProfileModel) {
        return outputProfile.outputBlocks.findIndex(x => x.value == 'quantity') != -1;
    }
    /**
     * @returns true when there is a block that requires the interaction with the UI
     */
    static HasBlockingOutputComponents(outputProfile: OutputProfileModel): boolean {
      return outputProfile.outputBlocks.findIndex(x => x.value == 'quantity' || x.type == 'select_option') != -1;
  }
}
