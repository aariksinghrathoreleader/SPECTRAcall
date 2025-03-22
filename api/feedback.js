const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/feedbackDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schema and Model
const feedbackSchema = new mongoose.Schema({
  name: String,
  feedback: String,
});
const Feedback = mongoose.model('Feedback', feedbackSchema);

// Save Feedback
app.post('/api/feedback', async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();
    res.status(201).send('Feedback saved successfully');
  } catch (error) {
    res.status(500).send('Error saving feedback');
  }
});

// Get All Feedback
app.get('/api/feedback', async (req, res) => {
  try {
    const feedbackList = await Feedback.find();
    res.status(200).json(feedbackList);
  } catch (error) {
    res.status(500).send('Error fetching feedback');
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
