import * as Papa from 'papaparse';
import { OutputBlockModel } from "./output-block.model";

export class ScanModel {
    id: number;
    outputBlocks: OutputBlockModel[];
    cancelled: boolean;
    repeated: boolean;
    ack: boolean;
    /**
     * This field should be set when the scan is created. Like this:
     * scan.displayValue = ScanModel.ToString(scan);
     */
    displayValue: string;

    /**
     * @deprecated
     */
    format: 'QR_CODE' | 'DATA_MATRIX' | 'UPC_E' | 'UPC_A' | 'EAN_8' | 'EAN_13' | 'CODE_128' | 'CODE_39' | 'CODE_93' | 'CODABAR' | 'ITF' | 'RSS14' | 'RSS_EXPANDED' | 'PDF_417' | 'AZTEC' | 'MSI';
    /**
     * @deprecated use the DATE Component instead
     */
    date: number;

    /**
     * @deprecated use the NUMBER Component instead
     */
    quantity: string;

    /**
     * @deprecated use the ScanModel.ToString() method
     */
    text: string;

    /**
    * This is static because most of the times the ScanModel object is parsed
    * from a JSON object, so the instance methods won't be available until you
    * do something like this: scan = Object.assign(new ScanModel(), scan), which
    * can degrade the peformance.
    * @param scan
    * @param fieldSeparator
    */
    static ToString(scan: ScanModel, fieldSeparator = ' ') {
        if (!scan || !scan.outputBlocks) {
            return '';
        }
        return scan.outputBlocks.map(block => {
            if (block.skipOutput) {
                return ''; // acts like a continue inside a cycle
            }

            // Warning: update Server/SettingsPage/getAvailableOutputBlocks() when changing the switch below
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
                case 'select_option': return block.value;
                case 'function': return block.value;
                case 'http': return block.value;
                case 'run': return block.value;
                case 'csv_lookup': return block.value;
                case 'csv_update': return block.value;
                case 'barcode': return block.value;
                case 'delay': return ''
                case 'beep': return ''
                case 'alert': return ''
                default: return '';
            }
        }).join(fieldSeparator).replace(/\s+/g, ' ');
    }


    /**
     * This is static because it's shared between the main and renderer process,
     * and in each process we obtain the settings in a different way, so we need
     * to pass them as parameter. Also note that the Parse module is installed
     * in both main and renderer project (remember to keep them at the same
     * version)
     *
     * Warning: update the filter condition when adding a new outputBlock that
     * doesn't produce output
     *
     * @param newLineCharacter must be composed by \n and \r(s). Be carrefoul,
     * because it's stored as 'LF' and 'CR'(s) in the settings.
     */
    static ToCSV(scannings: ScanModel[], exportOnlyText: boolean, enableQuotes: boolean, csvDelimiter: string, newLineCharacter: string): string {
        return Papa.unparse(scannings.map(scan => {
            if (exportOnlyText) {
                return scan.outputBlocks
                    .filter(outputBlock => (
                        outputBlock.type != 'key' &&
                        outputBlock.type != 'delay' &&
                        outputBlock.type != 'beep' &&
                        outputBlock.type != 'alert' &&
                        // to avoid printing the dialog message in csv files
                        // update also in app.
                        // 'if' and 'endif' bloks never reach
                        // the server because they're stripped on the app side

                        !outputBlock.skipOutput
                    ))
                    .map(outputBlock => outputBlock.value)
            }
            return scan.outputBlocks.map(outputBlock => outputBlock.value);
        }), {
            quotes: enableQuotes,
            delimiter: csvDelimiter,
            newline: newLineCharacter
        });
    }
}
