const fs = require('fs');
const cheerio = require('cheerio'); 

module.exports = (filePath) => {
    const html = fs.readFileSync(filePath);
    const $ = cheerio.load(html);

    const $normalizedHtml = cheerio.load('<div></div>', { decodeEntities: false });
    const parent = $normalizedHtml('div');

    $('p').each((i, paragraph) => {
        if (i % 6 === 0) {
            parent.append(paragraph);
            parent.append('<ol></ol>');
        } else {
            const text = $(paragraph).text().substring(2).trim();
            parent.children().last().append(`<li>${text}</li>`);
        }
    });

    fs.writeFileSync(filePath, $normalizedHtml.html());
}