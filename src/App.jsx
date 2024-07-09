import { useState } from 'react';
import Markdown from 'react-markdown'

const makeRequestToChatGPT = async (message) => {
  const response = await fetch('http://localhost:3000/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  return response.json();
}

function App() {
  const [chatHistory, setChatHistory] = useState([]); // [{ message: 'Hello', response: 'Hi' }
  const [currentMessage, setCurrentMessage] = useState('');

  const askChatGPT = async (e) => {
    e.preventDefault();
    setChatHistory((state) => ([...state, {
      text: currentMessage,
      sender: 'You'
    }]))

    const response = await makeRequestToChatGPT(currentMessage);
    setCurrentMessage('');

    setChatHistory((state) => ([...state, {
      text: response.received,
      sender: 'ChatGPT'
    }]))
  }

  console.log('chatHistory', chatHistory);

  return (
    <div className="flex flex-col h-full p-4 absolute w-full">
      <div className="overflow-auto pb-16 h-full ">
        {chatHistory.map((message, index) => (
          <div key={message.text}>
            <p>{message.sender}</p>
            <div key={index} className="p-2 mb-2 border rounded">
              <Markdown>{message.text}</Markdown>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={askChatGPT} className="flex h-16">
        <input
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          className="flex-grow mr-2 p-2 border rounded"
        />
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">
          Send
        </button>
      </form>
    </div>
  );
}

export default App;