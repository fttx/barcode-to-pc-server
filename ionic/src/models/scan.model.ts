import { OutputBlockModel } from "./output-block.model";

export class ScanModel {
    format: 'QR_CODE' | 'DATA_MATRIX' | 'UPC_E' | 'UPC_A' | 'EAN_8' | 'EAN_13' | 'CODE_128' | 'CODE_39' | 'CODE_93' | 'CODABAR' | 'ITF' | 'RSS14' | 'RSS_EXPANDED' | 'PDF_417' | 'AZTEC' | 'MSI';
    cancelled: boolean;
    repeated: boolean;

    /**
     * @deprecated use the ToString method
     */
    text: string;

    outputBlocks: OutputBlockModel[];
    ack: boolean;
    id: number;

    /**
     * @deprecated use the OutputBlock instead
     */
    date: number;

    /**
     * This is static because most of the times the ScanModel object is parsed 
     * from a JSON object, so the instance methods won't be available until you 
     * do something like this: scan = Object.assign(new ScanModel(), scan), which
     * can degrade the peformance.
     * @param scan 
     * @param fieldSeparator 
     */
    static ToString(scan: ScanModel, fieldSeparator = '') {
        // TODO: maybe a cache of the "ToString" value is a good idea?
        if (!scan || !scan.outputBlocks) {
            return '';
        }
        return scan.outputBlocks.map(block => {
            switch (block.type) {
                case 'key': {
                    if (block.value == 'tab') {
                        return '\t';
                    } else if (block.value == 'space') {
                        return ' ';
                    } else {
                        return ''
                    }
                }
                case 'text': return block.value;
                case 'variable': return block.value;
                case 'function': return block.value;
                case 'barcode': return block.value;
                case 'delay': return ''
                default: return '';
            }
        }).join(fieldSeparator);
    }
}