import { test, expect } from "playwright/test";
import { APIClient } from "../../utils/apiClient";
import { request } from "http";
import { CommonMethods } from "../apiHelpers/commonMethods";

test.describe('Bank of Canada API conversion rate cases', () => {
    let apiClient: APIClient,
        commonMethods: CommonMethods;

    test.beforeAll(() => {
        apiClient = new APIClient('https://www.bankofcanada.ca/valet/');
        commonMethods = new CommonMethods();
    });

    // TC01: positive case 
    test('should get Forex conversion rate for 10 weeks for CAD to AUD', async () => {
        const interval = 'recent_weeks';
        const timeline = 10; // weeks
        // convert Currency (c1) to Currency (c2)
        const C1 = 'CAD';
        const C2 = 'AUD';

        const response = await apiClient.seriesObser(`${C1}${C2}`, interval, timeline);
        await expect(response.status()).toBe(200);
        await expect(response.ok()).toBeTruthy();
        const data = await response.json();

        // use of helper method
        await expect(data.observations).toBeDefined();
        const average = await commonMethods.getCurrAverage(data.observations, `FX${C1}${C2}`);
        console.log('average for recent 10 weeks:--> ' + average);

    });

    // TC02: negative case as for USD to AUD - api returns 404 not found. (not sure why api fails)
    test('should get Forex conversion rate for 1 month for USD to AUD', async () => {
        const interval = 'recent_months';
        const timeline = 1; // 1 month
        // convert Currency (c1) to Currency (c2)
        const C1 = 'USD';
        const C2 = 'AUD';
    
        const response = await apiClient.seriesObser(`${C1}${C2}`, interval, timeline);
        await expect(response.status()).toBe(404);  // fails as api returns 404
        await expect(response.ok()).toBeFalsy();
        
        const data = await response.json();
        await expect(data.message).toContain(`Series FX${C1}${C2} not found`);
    });

    // TC03: positive case for mutiple series
    test('should get Forex conversion rate for 1 month for CAD->USD and CAD->AUD ', async () => {
        const interval = 'recent_months';
        const timeline = 1; // 1 month
        // convert Currency (c1) to Currency (c2)
        const C1 = 'CADUSD'
        const C2 = 'FXCADAUD'
    
        const response = await apiClient.seriesObser(`${C1},${C2}`, interval, timeline);
        await expect(response.status()).toBe(200);
        await expect(response.ok()).toBeTruthy();
        const data = await response.json();

        // verify the result contains the correct description for both series - to make sure all series results is in response
        await expect(data.seriesDetail[`FX${C1}`].description).toContain('Canadian dollar to US dollar daily exchange rate');
        await expect(data.seriesDetail[`${C2}`].description).toContain('Canadian dollar to Australian dollar daily exchange rate');

    });

    // TC04: negative case when series name is wrong
    test('verify conversion rate for wrong series name - 1 month interval', async () => {
        const interval = 'recent_months';
        const timeline = 1; // 1 month
        // convert Currency (c1) to Currency (c2)
        const C1 = 'USK1';
        const C2 = 'AUK2';

        const response = await apiClient.seriesObser(`${C1}${C2}`, interval, timeline);
        await expect(response.status()).toBe(404);  // fails as api returns 404
        await expect(response.ok()).toBeFalsy();

        const data = await response.json();
        await expect(data.message).toContain(`Series FX${C1}${C2} not found`);
    });

    // TC05: negative case when invalid chars used such as numbers only for series name
    test('verify conversion rate for invalid chars in series name', async () => {
        const interval = 'recent_months';
        const timeline = 1; // 1 month
        // convert Currency (c1) to Currency (c2)
        const C1 = '12';
        const C2 = '%&';

        const response = await apiClient.seriesObser(`${C1}${C2}`, interval, timeline);
        await expect(response.status()).toBe(400);
        await expect(response.ok()).toBeFalsy();
    });

     // TC06: negative case when endpoint url is invalid
     test('verify the response if endpoint is wrong', async () => {
        const interval = 'recent_months';
        const timeline = 1; // 1 month
        // convert Currency (c1) to Currency (c2)
        const C1 = 'CAD';
        const C2 = 'AUD';

        // const response = await apiClient.seriesObser(`${C1}${C2}`, interval, timeline);
        const response = await apiClient.get('/invalid-url')
        await expect(response.status()).toBe(404);  // fails as api returns 404
        await expect(response.ok()).toBeFalsy();

        const data = await response.json();
        await expect(data.message).toContain('The page you are looking for is unavailable');
    });

    /**
     * Same as below Testcase, other endpoint api's can be used in similar way
     */
    // TC07: positive case for another endpoint api --> /series/{seriesName}/json
    test('verify the response for another endpoint api /series/{seriesName}/json', async () => {
        // convert Currency (AUD) to Currency (CAD)
        const C1 = 'FXAUDCAD';

        const response = await apiClient.get(`series/${C1}/json`)
        await expect(response.status()).toBe(200);
        await expect(response.ok()).toBeTruthy();
        const data = await response.json();

        // verify the response
        await expect(data.seriesDetails).toBeDefined();
        await expect(data.seriesDetails.name).toContain(`${C1}`);
    });
});