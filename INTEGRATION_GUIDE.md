# Quick Start Guide - Integrating New Features

## 🚀 5-Minute Integration

### Step 1: Update ChatWindow.tsx

Add these imports at the top:

```tsx
import TypingIndicator from './TypingIndicator';
import MessageReactions from './MessageReactions';
import MessageStatus from './MessageStatus';
import DragDropUpload from './DragDropUpload';
import SearchInConversation from './SearchInConversation';
```

### Step 2: Add State Variables

```tsx
const [showSearch, setShowSearch] = useState(false);
const [typingUsers, setTypingUsers] = useState<string[]>([]);
```

### Step 3: Wrap Your Chat with Drag & Drop

Find your main return statement and wrap it:

```tsx
return (
    <DragDropUpload onFilesSelected={(files) => {
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                // Handle image
                handleFileUpload({ target: { files: [file] } } as any);
            }
        });
    }}>
        {/* Your existing ChatWindow JSX */}
    </DragDropUpload>
);
```

### Step 4: Add Search Button to Header

In your chat header, add a search button:

```tsx
<button 
    onClick={() => setShowSearch(!showSearch)}
    className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
    title="Search in conversation"
>
    <Search className="w-5 h-5 text-text-secondary" />
</button>
```

Then add the search component after the header:

```tsx
{showSearch && (
    <SearchInConversation
        messages={messages}
        onClose={() => setShowSearch(false)}
        onResultClick={(messageId) => {
            // Scroll to message
            const element = document.getElementById(`message-${messageId}`);
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }}
    />
)}
```

### Step 5: Add Message Status to Sent Messages

In your message rendering, update the status display:

```tsx
{isSent && (
    <MessageStatus
        status={message.status || 'sent'}
        timestamp={message.createdAt}
    />
)}
```

### Step 6: Add Typing Indicator

Before the messages end ref, add:

```tsx
{typingUsers.length > 0 && (
    <TypingIndicator username={typingUsers[0]} />
)}
```

### Step 7: Listen for Typing Events

In your socket useEffect, add:

```tsx
socket.on('typing:user', ({ userId, conversationId, isTyping, username }) => {
    if (conversationId === currentConversation._id && userId !== user?.id) {
        setTypingUsers(prev => {
            if (isTyping && !prev.includes(username)) {
                return [...prev, username];
            } else if (!isTyping) {
                return prev.filter(u => u !== username);
            }
            return prev;
        });
    }
});
```

---

## 🎨 Optional: Add Message Reactions

### Step 1: Add to Message Component

In your message map, add reactions:

```tsx
<div className="message-bubble group" id={`message-${message._id}`}>
    <p>{message.content}</p>
    
    {/* Add this */}
    <MessageReactions
        messageId={message._id}
        reactions={message.reactions || []}
        onReact={(emoji) => {
            if (socket) {
                socket.emit('message:react', {
                    messageId: message._id,
                    emoji
                });
            }
        }}
    />
</div>
```

### Step 2: Listen for Reaction Events

```tsx
socket.on('message:reaction', ({ messageId, userId, emoji, action }) => {
    // Update message reactions in state
    useChatStore.setState(state => ({
        messages: state.messages.map(msg => {
            if (msg._id === messageId) {
                const reactions = [...(msg.reactions || [])];
                if (action === 'add') {
                    reactions.push({ userId, emoji });
                } else {
                    const index = reactions.findIndex(r => r.userId === userId && r.emoji === emoji);
                    if (index > -1) reactions.splice(index, 1);
                }
                return { ...msg, reactions };
            }
            return msg;
        })
    }));
});
```

---

## ✅ Testing Checklist

After integration, test these:

- [ ] Drag an image file into chat - should show overlay
- [ ] Click search button - search bar should appear
- [ ] Type in search - should filter messages
- [ ] Send a message - should show status checkmark
- [ ] Start typing - other user should see typing indicator
- [ ] Hover over message - reaction button should appear
- [ ] Click reaction - emoji should be added

---

## 🐛 Troubleshooting

### Typing indicator not showing?
Make sure your backend emits typing events with username:
```typescript
socket.to(`conversation:${conversationId}`).emit('typing:user', {
    userId,
    username: user.username, // Add this
    conversationId,
    isTyping: true
});
```

### Drag & drop not working?
Make sure DragDropUpload wraps the entire chat area, not just the input.

### Search not finding messages?
Check that messages have a `content` field and it's a string.

---

## 🎯 What's Next?

1. **Test the features** - Try each one
2. **Customize styling** - Match your brand
3. **Add backend support** - For reactions, edit, delete
4. **Deploy** - Push to production!

**You're all set!** 🚀
