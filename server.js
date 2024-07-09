import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// eslint-disable-next-line no-undef
console.log('API_KEY:', process.env.API_KEY);

const openai = new OpenAI({
  // eslint-disable-next-line no-undef
  apiKey: process.env['API_KEY'], // This is the default and can be omitted
});

app.use(cors());
app.use(express.json());

app.post('/message', async (req, res) => {
  try {
    console.log('Received request:', req.body);

    // const stream = openai.beta.chat.completions.stream({
    //
    // });
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: req.body.message }],
      model: 'gpt-4-turbo',
    });

    res.status(200).send({ status: 'Message received', received: chatCompletion.choices[0].message.content });
    res.end();
  } catch (e) {
    res.write('An error occurred');
    res.end();
    console.error(e);
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});