const mammoth = require('mammoth');
const fs = require('fs');

module.exports = async function convertDocToHtml(filePath, writeTo = 'doc-parser-result.html') {
    const result = await mammoth.convertToHtml({ path: filePath });
    fs.writeFileSync(writeTo, result.value);
    return result.value;
}