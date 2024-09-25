import { APIResponse } from "playwright";

export class CommonMethods {

    // extract conversion rate value from the response body
    async getCurrAverage(respData: APIResponse, series?: string): Promise<number> {
        let totalValue = 0;
        const daysCount = Object.keys(respData).length;  // length of resp object

        for (let i = 0; i < daysCount; i++) {
            totalValue =+ respData[i][`${series}`].v
        }
        return (totalValue/daysCount);
    }
}