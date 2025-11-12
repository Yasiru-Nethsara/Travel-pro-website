import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Paperclip } from "lucide-react";
import { useState } from "react";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isSelf: boolean;
}

interface ChatInterfaceProps {
  messages: Message[];
  currentUserId: string;
  otherUserName: string;
  otherUserPhoto?: string;
  onSendMessage: (content: string) => void;
}

export default function ChatInterface({
  messages,
  otherUserName,
  otherUserPhoto,
  onSendMessage,
}: ChatInterfaceProps) {
  const [messageInput, setMessageInput] = useState("");

  const handleSend = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput);
      setMessageInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={otherUserPhoto} alt={otherUserName} />
            <AvatarFallback>{otherUserName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold" data-testid="text-chat-user-name">{otherUserName}</h3>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.isSelf ? "flex-row-reverse" : ""}`}
            data-testid={`message-${message.id}`}
          >
            {!message.isSelf && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={otherUserPhoto} alt={message.senderName} />
                <AvatarFallback>{message.senderName[0]}</AvatarFallback>
              </Avatar>
            )}
            <div className={`flex flex-col ${message.isSelf ? "items-end" : ""}`}>
              <div
                className={`
                  px-4 py-2 rounded-lg max-w-md
                  ${message.isSelf ? "bg-primary text-primary-foreground" : "bg-muted"}
                `}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              <span className="text-xs text-muted-foreground mt-1">
                {message.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" data-testid="button-attach-file">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
            data-testid="input-message"
          />
          <Button onClick={handleSend} data-testid="button-send-message">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
