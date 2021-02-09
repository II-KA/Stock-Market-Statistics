const http = require('http');
const path = require('path');
const fs = require('fs');

const NOT_FOUND_TEMPLATE = path.resolve(__dirname, '../public/404.html');

/**
 * Render file from ./public directory
 *
 * @param {string} filePath The path to the file in question
 * @param {http.ServerResponse} response Server's response
 */
const renderPublic = (filePath, response) => {
  if (!filePath) return renderNotFound(response);

  const extension = splitPath(filePath)[1];
  const contentType = getContentType(extension);
  const fullPath = getFullFilePath(filePath);

  if (!fullPath) return renderNotFound(response);
  renderFile(fullPath, contentType, response);
};

/**
 * Render ../views/404.html (calls response.end())
 *
 * @param {http.ServerResponse} response Server's response
 * @returns {http.ServerResponse} response
 */
const renderNotFound = response => {
  renderFile(NOT_FOUND_TEMPLATE, getContentType('html'), response);
};

/**
 * Get Content-Type based on file extension
 *
 * @param {string} fileExtension The 4 cases below are the accepted ones
 * @returns {string} contentType
 */
const getContentType = fileExtension => {
  let contentType;

  switch (fileExtension.toLowerCase().replace('.', '')) {
    case 'js':
      contentType = 'text/javascript';
      break;
    case 'css':
      contentType = 'text/css';
      break;
    case 'json':
      contentType = 'application/json';
      break;
    default:
      contentType = 'text/html';
  }

  return contentType;
};

const renderFile = (filePath, contentType, response) => {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.statusCode = 500;
      // ENOENT = no such file or directory
      if (error.code === 'ENOENT') {
        response.statusCode = 404;
        if (filePath !== NOT_FOUND_TEMPLATE) return renderNotFound(response);
      }
      return response.end();
    }

    const status = filePath !== NOT_FOUND_TEMPLATE ? 200 : 404;
    response.writeHead(status, { 'Content-Type': contentType });
    response.end(content, 'utf-8');
  });
};

const getFullFilePath = fileName => {
  const basePath = 'public';
  return path.resolve(
    __dirname,
    `../${basePath}/${fileName[0] === '/' ? fileName.substring(1) : fileName}`
  );
};

const splitPath = filePath => {
  const tmpPath = filePath.split('?')[0];
  const filename = path.basename(tmpPath);
  const ext = path.extname(filename);
  return [filename, ext];
};

module.exports = renderPublic;
