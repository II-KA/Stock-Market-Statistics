/**
 * Calculates the longest bullish trend within given data.
 * 
 * @param {Array<object>} data - Historical stock data
 * @returns {Array<object>}
 */
const calculateA = (data) => {
    let maxTrend = 0;
    let i = 0;

    while (i < data.length) {
        let currTrend = 1;
        for (let j = i + 1; j < data.length; ++j) {
            if (data[j].close <= data[j - 1].close) break;
            ++currTrend;
        }
        if (currTrend > maxTrend) maxTrend = currTrend;
        // skip through dates that were included in the bullish trend
        i += currTrend;
    }
    return maxTrend;
}

/**
 * Modifies stock data so that it forms a list of dates, volumes
 * and price changes. The list is ordered by volume and secondrarily
 * by price change.
 * 
 * @param {Array<object>} data - Historical stock data
 * @returns {Array<object>}
 */
const calculateB = (data) => {
    const list = data
        .map(obj => ({
            "date": obj.date,
            "volume": obj.volume,
            "change": Math.abs(obj.low - obj.high)
        }))
        .sort((a, b) => b.volume - a.volume || b.change - a.change);
    return list;
}

/**
 * Modifies stock data so that it forms a list of dates and price
 * change percentages. Percentages are calculated by the differene
 * between the opening price and the SMA 5 price of the day.
 * The list is ordered by the percentages.
 * 
 * @param {Array<object>} data - Historical stock data
 * @returns {Array<object>}
 */
const calculateC = (data) => {
    const list = [];
    // start at index 5 since array has 5 additional days
    // that are only needed in the SMA 5 calculation
    for (let i = 5; i < data.length; ++i) {
        // calculate the SMA 5 price of the day
        let sum = 0;
        for (let j = i - 1; j >= i - 5 ; --j) {
            sum += data[j].close;
        }
        const sma5 = sum / 5;
        // calculate price change percentage
        const percentage = ((data[i].open - sma5) / sma5) * 100;
        list.push({ "date": data[i].date, "percentage": percentage });
    }
    // sort in ascending order by the percentage
    list.sort((a, b) => a.percentage - b.percentage);
    return list;
}