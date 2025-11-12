import { useState } from 'react'
import ChatInterface from '../ChatInterface'

export default function ChatInterfaceExample() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      senderId: 'driver1',
      senderName: 'John Smith',
      content: 'Hi! I\'m looking forward to your trip. I\'ll make sure the van is clean and ready.',
      timestamp: '10:30 AM',
      isSelf: false,
    },
    {
      id: '2',
      senderId: 'traveler1',
      senderName: 'You',
      content: 'Thank you! What time should we meet?',
      timestamp: '10:32 AM',
      isSelf: true,
    },
    {
      id: '3',
      senderId: 'driver1',
      senderName: 'John Smith',
      content: 'I suggest we meet at 2:00 PM at the pickup location. Does that work for you?',
      timestamp: '10:33 AM',
      isSelf: false,
    },
  ]);

  const handleSendMessage = (content: string) => {
    const newMessage = {
      id: Date.now().toString(),
      senderId: 'traveler1',
      senderName: 'You',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
    };
    setMessages([...messages, newMessage]);
    console.log('Message sent:', content);
  };

  return (
    <div className="p-8">
      <ChatInterface
        messages={messages}
        currentUserId="traveler1"
        otherUserName="John Smith"
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
