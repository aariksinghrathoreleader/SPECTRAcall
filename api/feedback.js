// api/feedback.js
const fs = require('fs');
const path = require('path');

const feedbackFilePath = path.join(__dirname, '../feedback.json');

module.exports = (req, res) => {
    if (req.method === 'POST') {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({ message: 'Name and description are required.' });
        }

        // Load existing feedback
        let feedbackData = [];
        if (fs.existsSync(feedbackFilePath)) {
            const rawData = fs.readFileSync(feedbackFilePath);
            feedbackData = JSON.parse(rawData);
        }

        // Create a new feedback entry
        const newFeedback = { name, description, date: new Date() };
        feedbackData.push(newFeedback);

        // Save feedback to file
        fs.writeFileSync(feedbackFilePath, JSON.stringify(feedbackData, null, 2));

        res.status(200).json({ message: 'Feedback saved successfully!' });
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
};
