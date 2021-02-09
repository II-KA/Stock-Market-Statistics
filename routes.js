http = require('http');
const renderPublic = require('./utils/render');
const csvtojson = require("csvtojson");

const csvFilePath= "./HistoricalQuotes.csv";

/**
 * Process client request and send response accordingly
 * 
 * @param {http.ServerRequest} req Server's request
 * @param {http.ServerResponse} res Server's response
 * @returns {http.ServerResponse} response
 */
const handleRequest = async (request, response) => {
    const { url, method, headers } = request;
    const filePath = new URL(url, `http://${headers.host}`).pathname;

    // serve files from public/ and return immediately
    if (method.toUpperCase() === "GET" && !filePath.startsWith("/api")) {
        const fileName = filePath === "/" || filePath === "" ? "statistics.html" : filePath;
        return renderPublic(fileName, response);
    }

    // serve HistoricalQuotes.csv as json content
    if (filePath === "/api/historicalquotes") {
        const json = await csvtojson().fromFile(csvFilePath);
        response.writeHead(200, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify(json));
    }
}

module.exports = { handleRequest };
