import { APIResponse, request } from "playwright";


export class APIClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    // for GET request  (* same methods can be added for POST, DELETE, PUT)
    async get(endpoint: string, params?: any): Promise<APIResponse> {
        const response = await request.newContext().then(async (context) => {
            return context.get(`${this.baseUrl}/${endpoint}`, { params });
        });
        return response;
    }

    /**
     * handles the currency conversion for series 
     */
    async seriesObser(series: string, interval: string, timeline: number): Promise<APIResponse> {
        const response = await this.get(`observations/FX${series}/json?${interval}=${timeline}`);
        return response;
    }
    
}