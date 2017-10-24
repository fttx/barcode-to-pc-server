export class ScanModel {
    format: "QR_CODE" | "DATA_MATRIX" | "UPC_E" | "UPC_A" | "EAN_8" | "EAN_13" | "CODE_128" | "CODE_39" | "CODE_93" | "CODABAR" | "ITF" | "RSS14" | "RSS_EXPANDED" | "PDF417" | "AZTEC" | "MSI";
    cancelled: boolean;
    repeated: boolean;
    text: string;
    ack: boolean;
    id: number;
}