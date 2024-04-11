import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

console.log('API_KEY:', process.env.API_KEY);
const functions = [
  {
    name: 'list',
    description: 'list queries books by genre, and returns a list of names of books',
    parameters: {
      type: 'object',
      properties: {
        genre: { type: 'string', enum: ['mystery', 'nonfiction', 'memoir', 'romance', 'historical'] },
      },
    },
    function: list,
    parse: JSON.parse,
  },
  {
    name: 'search',
    description: 'search queries books by their name and returns a list of book names and their ids',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    },
    function: search,
    parse: JSON.parse,
  },
  {
    name: 'get',
    description:
      "get returns a book's detailed information based on the id of the book. Note that this does not accept names, and only IDs, which you can get by using search.",
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
    },
    function: get,
    parse: JSON.parse,
  },
];


const openai = new OpenAI({
  apiKey: process.env['API_KEY'], // This is the default and can be omitted
});

app.use(cors());
app.use(express.json());

app.post('/message', async (req, res) => {
  try {
    console.log('Received request:', req.body);

    // const chatCompletion = await openai.chat.completions.create({
    //   messages: [{ role: 'user', content: req.body.message }],
    //   model: 'gpt-4-turbo',
    // });

    const runner = await openai.beta.chat.completions
      .runFunctions({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: req.body.message,
          },
        ],
        functions,
      })
      .on('message', (msg) => console.log(msg))
      .on('content', (diff) => console.log('function output:', diff));

    const result = await runner.finalChatCompletion();
    console.log('-----', result);

    res.status(200).send({ status: 'Message received', received: result.choices[0].message.content});
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

const db = [
  {
    id: 'a1',
    name: 'To Kill a Mockingbird',
    genre: 'historical',
    description: `Compassionate, dramatic, and deeply moving, "To Kill A Mockingbird" takes readers to the roots of human behavior - to innocence and experience, kindness and cruelty, love and hatred, humor and pathos. Now with over 18 million copies in print and translated into forty languages, this regional story by a young Alabama woman claims universal appeal. Harper Lee always considered her book to be a simple love story. Today it is regarded as a masterpiece of American literature.`,
  },
  {
    id: 'a2',
    name: 'All the Light We Cannot See',
    genre: 'historical',
    description: `In a mining town in Germany, Werner Pfennig, an orphan, grows up with his younger sister, enchanted by a crude radio they find that brings them news and stories from places they have never seen or imagined. Werner becomes an expert at building and fixing these crucial new instruments and is enlisted to use his talent to track down the resistance. Deftly interweaving the lives of Marie-Laure and Werner, Doerr illuminates the ways, against all odds, people try to be good to one another.`,
  },
  {
    id: 'a3',
    name: 'Where the Crawdads Sing',
    genre: 'historical',
    description: `For years, rumors of the “Marsh Girl” haunted Barkley Cove, a quiet fishing village. Kya Clark is barefoot and wild; unfit for polite society. So in late 1969, when the popular Chase Andrews is found dead, locals immediately suspect her.
But Kya is not what they say. A born naturalist with just one day of school, she takes life's lessons from the land, learning the real ways of the world from the dishonest signals of fireflies. But while she has the skills to live in solitude forever, the time comes when she yearns to be touched and loved. Drawn to two young men from town, who are each intrigued by her wild beauty, Kya opens herself to a new and startling world—until the unthinkable happens.`,
  },
];

async function list({ genre }) {
  return db.filter((item) => item.genre === genre).map((item) => ({ name: item.name, id: item.id }));
}

async function search({ name }) {
  return db.filter((item) => item.name.includes(name)).map((item) => ({ name: item.name, id: item.id }));
}

async function get({ id }) {
  return db.find((item) => item.id === id);
}