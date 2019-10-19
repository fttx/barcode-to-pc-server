import { OutputBlockModel } from "./output-block.model";

/**
 * It's a set of OutputBlocks, also called "Ouput template" in the UI
 */
export class OutputProfileModel {
    public name: string;
    public outputBlocks: OutputBlockModel[] = [];

    static HasQuantityBlocks(outputProfile: OutputProfileModel) {
        return outputProfile.outputBlocks.findIndex(x => x.value == 'quantity') != -1;
    }
}