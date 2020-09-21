const path = require('path');
const fs = require('fs');
const json2xls = require('json2xls');
const { argv } = require('yargs');
const convertDocToHtml = require('./src/doc-to-html');
const htmlNormalizer = require('./src/html-normalizer');
const responseBuilder = require('./src/response-builder');
const { extractQuestionsFromHtml } = require('./src/html-parser.js');

const INPUT_DOC = path.join(__dirname, 'document.docx');
const OUTPUT_HTML = path.join(__dirname, 'output', 'document.html');
const OUTPUT_EXCEL = path.join(__dirname, 'output', 'document.xls');
const STRUCTURED_FORMAT = 1;
const UNSTRUCTURED_FORMAT = 2;

const main = async () => {
  if (argv.action === 'convert') {
    await convertDocToHtml(INPUT_DOC, OUTPUT_HTML);
    if (argv.format === UNSTRUCTURED_FORMAT) {
      htmlNormalizer(OUTPUT_HTML);
    }
  }

  if (argv.action === 'extract') {
    const extractedQuestions = extractQuestionsFromHtml(OUTPUT_HTML);
    const responseOptions = {
      category: 'Category Name',
      volumeName: 'Book Name',
    };
    const questions = responseBuilder(extractedQuestions, responseOptions);
    const xls = json2xls(questions);
    fs.writeFileSync(OUTPUT_EXCEL, xls, 'binary');
  }
};

(async () => {
  try {
    await main();
  } catch (error) {
    console.error('MAIN ERROR:', error);
  }
})();
