


const createAnswersMap = (answers, questionType) => {
    let pointPerAnswer;

    if (questionType === 'single') {
        pointPerAnswer = 0;
    } else {
        pointPerAnswer = 1;
    }

    const answersReducer = (acc, elem, idx) => {
        acc[`Answer${idx + 1}`] = elem;
        acc[`Point${idx + 1}`] = pointPerAnswer;
        return acc;
    };

    const answersMap = answers.reduce(answersReducer, {});
    return answersMap;
};

const imgBlockFactory = (volumeName, page) => {
    return `<img src="https://rezi4winners.ro/wp-content/uploads/carti-rezi/${volumeName}/${page}.jpg" class="book-page" />`
};

const createHint = (volumeName, pages) => {
    let imgBlock = '';
    let pageStart;
    let pageEnd;
    let pagesArr = [];
    if (pages.indexOf('-') > 0) {
        pagesArr = pages.split('-');
        pageStart = parseInt(pagesArr[0], 10);
        pageEnd = parseInt(pagesArr[1], 10);
        for (let i = pageStart; i <= pageEnd; i++) {
            imgBlock = `${imgBlock}${imgBlockFactory(volumeName, i)}`;
        }
    } else if (pages.indexOf('+') > 0) {
        pagesArr = pages.split('+');
        pageStart = parseInt(pagesArr[0], 10);
        pageEnd = parseInt(pagesArr[1], 10);
        for (let i = 0; i < pagesArr.length; i++) {
            imgBlock = `${imgBlock}${imgBlockFactory(volumeName, pagesArr[i])}`;
        }
    } else {
        imgBlock = imgBlockFactory(volumeName, pages);
    }

    const hintBlock = `
        <div class="book-pages">
            ${imgBlock}
        </div>
    `.replace(/\s{2,}/g, '');

    return hintBlock.trim();
}

const formatCorrectAnswer = (correctAnswers) => {
    // Correct answers - ex. |2|4|5
    const SPACE = ' ';
    const letterToNumberMap = {
        'A': 1,
        'B': 2,
        'C': 3,
        'D': 4,
        'E': 5,
    };

    // Single answer question
    if (correctAnswers.length === 1) {
        return letterToNumberMap[correctAnswers];
    }

    const result = Object.keys(letterToNumberMap).map(letter => {
        if (correctAnswers.indexOf(letter) > -1) {
            return letterToNumberMap[letter];
        }

        return SPACE;
    });

    return result.join('|').replace(/\s/g, '');
};

const createTitle = (question) => {
    let title = '';
    if (question.type === 'single') {
        title = '*';
    }

    title = `${title}${question.title}: (p. ${question.pages})`;
    return title;
}

const createQuestionText = (question) => {
    let text = '';
    if (question.type === 'single') {
        text = '*';
    }

    text = `${text}${question.title}:`;
    return text;
}

module.exports = (questions, options) => {
    return questions.map((question, idx) => ({
        // Fill this just for first row
        'Quiz Title': idx === 0 ? options.category : '',
        'Question': question.type,
        'Category': options.category,
        'Title': createTitle(question),
        // 4 points for single, 5 for multiple
        'Total Point': question.type === 'single' ? 4 : 5,
        'Different points for each answer': question.type === 'single' ? 'no' : 'yes',
        'Question Text': createQuestionText(question),
        'Answer Type': 'text',
        ...createAnswersMap(question.answers, question.type),
        'Answer': formatCorrectAnswer(question.correctAnswers),
        'Total Answer': 5,
        'Message with correct answer': '',
        'Message with incorrect answer': '',
        'Hint': createHint(options.volumeName, question.pages),
    }));
} 