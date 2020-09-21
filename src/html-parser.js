const fs = require('fs');
const cheerio = require('cheerio'); 

const normalizeTitle = (title) => {
    const indexOfColon = title.lastIndexOf(':');
    const indexOfFirstDot = title.indexOf('.');

    if (indexOfColon === -1 || indexOfColon < 5) {
        throw new Error(`Couldn't find colon (:) in title or title is too short`);
    }

    let normalizedTitle = title.substring(indexOfFirstDot + 1, indexOfColon).trim();
    if (normalizedTitle.indexOf('*') === 0) {
        normalizedTitle = normalizedTitle.substring(1);
    }

    normalizedTitle = normalizedTitle.replace(/\s*\n\s*/gmi, ' ');

    return normalizedTitle.trim();
}

const normalizeAnswer = (answer) => {
    const normalizedAnswer = answer.replace(/\s*\n\s*/gmi, ' ');
    return normalizedAnswer.trim();
}

const answersReducer = (acc, elem, idx) => {
    acc[`Answer${idx + 1}`] = elem;
    acc[`Point${idx + 1}`] = 0;
    return acc;
};

const extractId = (title) => {
    // Cases treated:
    // 1. text
    // 11. text
    // *1. text
    // 1*. text
    const regex = /^(\d+)\.|^\*(\d+)\.|^(\d+)\*\./;
    const [, id1, id2, id3] = regex.exec(title.trim());
    return id1 || id2 || id3;
};

const extractPages = (title) => {
    // Cases treated:
    // text (pg. 1)
    // text ( pg. 1 )
    // text (pg. 11 )
    // text (pg.11)
    // text (pg.11)
    // text (pg.11-12)
    // text (pg.11- 12)
    // text (pg.11 - 12)
    // text (pg.11+12)
    // text (text) (text) text (pg.7)
    // p | pg | pag

    if (title.indexOf('(') === -1 || title.indexOf(')') === -1) {
        throw new Error ('Title missing pages.');
    }

    // replace paranthesis other than pages paranthesis: text (text) text: (pg. x) -> text text text: (pg. x)
    let updatedTitle = title.replace(/[(](?=.*[(])/g, '');
    updatedTitle = updatedTitle.replace(/[)](?=.*[)])/g, '');

    const regex = /\(\s*(pg|p|pag)\s*\.?\s*(\d*|\d*\s*\-\s*\d*|\d*\s*\+\s*\d*)\s*\)/i;
    const [,, pages] = regex.exec(updatedTitle);
    const normalizedPages = pages.replace(/\s/g, '');
    return normalizedPages;
};

const extractCorrectAnswers = (title) => {
    // Cases treated:
    // 1. text: (p. 73) E
    // 2. text: (p. 73-74) BD
    // 3. text: (p. 73-74)   bd
    // 4. text (text) text: (p. 5) BDA

    if (title.indexOf(')') === -1) {
        throw new Error(`Missing closing paranthesis for pages. Can't extract correct answers`);
    }

    const regex = /\)\s*([ABCDE]+)\s*$/i;
    try {
        const [, correctAnswer] = regex.exec(title);
        return correctAnswer.toUpperCase();
    } catch (error) {
        throw new Error(`Couldn't extract correct answers.`);
    }
};

const extractQuestions = ($, format) => {
    let count = 1;
    const questions = [];
    $('p').each((i, paragraph) => {
        console.log('Processing question nr.', count);
        const title = $(paragraph).text();
        
        const answers = [];
        // p > ol > li*5
        $(paragraph).next().children().each((i, listItem) => { 
            answers.push($(listItem).text());
        });

        const id = extractId(title);
        if (!id) { 
            throw new Error(`Id for question number ${id} or count ${count} is wrong.`);
        }

        const pages = extractPages(title);
        if (!pages.trim()) {
            throw new Error(`Couldn't extract the pages for question ${count}.`);
        }

        const normalizedAnswers = answers.map(normalizeAnswer);
        console.log(normalizedAnswers)
        if (Object.keys(normalizedAnswers).length !== 5) {
            throw new Error(`Couldn't extract 5 answers for question ${count}.`);
        }

        const correctAnswers = extractCorrectAnswers(title);
        if (!correctAnswers.trim()) {
            throw new Error(`Couldn't extract correct answers for question ${count}.`)
        }

        const normalizedTitle = normalizeTitle(title);
        if (!normalizedTitle) {
            throw new Error(`Couldn't extract the title for question ${count}.`)
        }

        const question = {
            title: normalizedTitle,
            answers: normalizedAnswers,
            correctAnswers: correctAnswers,
            pages: pages,
            type: correctAnswers.length === 1 ? 'single' : 'multiple',
        };
        questions.push(question);
        count = count + 1;
    });

    console.log(`Processed ${questions.length} quizes`);
    return questions;
};

module.exports.extractQuestionsFromHtml = (filePath) => {
    const html = fs.readFileSync(filePath);
    const $ = cheerio.load(html);
    const questions = extractQuestions($);
    return questions;
};