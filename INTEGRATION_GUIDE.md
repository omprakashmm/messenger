# Integration Guide - E2EE & Sounds

## How to Integrate Encryption into ChatWindow

### Step 1: Update ChatWindow to Use Encryption

Add these imports to `components/chat/ChatWindow.tsx`:

```typescript
import { encryptMessage, decryptMessage, generateKeyPair, storeKeysSecurely, retrieveKeys } from '@/lib/encryption';
import { playTypingSound, playMessageSent, playMessageReceived } from '@/lib/sounds';
```

### Step 2: Initialize Keys on Login

In `lib/store.ts`, update the login/register functions:

```typescript
login: async (email: string, password: string) => {
    // ... existing login code ...
    
    // Generate or retrieve encryption keys
    let keys = retrieveKeys(password);
    if (!keys) {
        keys = generateKeyPair();
        storeKeysSecurely(keys, password);
        
        // Upload public key to server
        await fetch(`${API_URL}/api/users/public-key`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.token}`,
            },
            body: JSON.stringify({ publicKey: keys.publicKey }),
        });
    }
    
    set({
        user: { ...data.user, publicKey: keys.publicKey },
        token: data.token,
        isAuthenticated: true,
        privateKey: keys.privateKey, // Add this to store
    });
    
    get().connectSocket();
},
```

### Step 3: Encrypt Messages Before Sending

Update the message sending logic:

```typescript
const sendMessage = async (content: string) => {
    if (!content.trim() || !currentConversation || !socket) return;
    
    // Get recipient's public key
    const recipient = currentConversation.participants.find(p => p._id !== user?.id);
    if (!recipient?.publicKey) {
        console.error('Recipient public key not found');
        return;
    }
    
    // Get my private key from store
    const { privateKey } = useAuthStore.getState();
    
    // Encrypt the message
    const encrypted = encryptMessage(content, recipient.publicKey, privateKey);
    
    // Send encrypted message
    socket.emit('message:send', {
        conversationId: currentConversation._id,
        content: JSON.stringify(encrypted), // Send as JSON string
        type: 'text',
        tempId: Date.now(),
    });
    
    // Play sound
    playMessageSent();
    
    setMessage('');
};
```

### Step 4: Decrypt Received Messages

Update the message display logic:

```typescript
useEffect(() => {
    if (!socket) return;
    
    socket.on('message:new', (message) => {
        try {
            // Get sender's public key
            const sender = message.sender;
            const { privateKey } = useAuthStore.getState();
            
            // Decrypt the message
            const encryptedData = JSON.parse(message.content);
            const decrypted = decryptMessage(
                encryptedData,
                sender.publicKey,
                privateKey
            );
            
            // Update message with decrypted content
            const decryptedMessage = {
                ...message,
                content: decrypted || '[Encrypted Message]',
            };
            
            addMessage(decryptedMessage);
            
            // Play sound if not from me
            if (message.sender._id !== user?.id) {
                playMessageReceived();
            }
        } catch (error) {
            console.error('Decryption error:', error);
            addMessage({
                ...message,
                content: '[Unable to decrypt message]',
            });
        }
    });
    
    return () => {
        socket.off('message:new');
    };
}, [socket]);
```

### Step 5: Add Typing Sound

Update the input onChange handler:

```typescript
<input
    type="text"
    value={message}
    onChange={(e) => {
        setMessage(e.target.value);
        playTypingSound(); // Add this
        handleTyping();
    }}
    onKeyPress={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(message);
        }
    }}
    placeholder="Type a message..."
    className="flex-1 bg-transparent outline-none text-text-primary"
/>
```

## Backend Updates Required

### Update User Model to Store Public Key

Already done! The `publicKey` field exists in the User model.

### Add Public Key Upload Route

Add to `server/routes/user.ts`:

```typescript
// Upload public key
router.post('/public-key', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { publicKey } = req.body;
        
        await User.findByIdAndUpdate(req.userId, { publicKey });
        
        res.json({ message: 'Public key updated successfully' });
    } catch (error: any) {
        console.error('Public key upload error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
```

### Update Conversation Population

Ensure public keys are included when fetching conversations:

```typescript
// In message.ts - Get conversations
router.get('/conversations', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const conversations = await Conversation.find({
            participants: req.userId,
        })
            .populate('participants', 'username avatar status publicKey') // Add publicKey
            .populate('lastMessage')
            .sort({ lastMessageAt: -1 });

        res.json({ conversations });
    } catch (error: any) {
        console.error('Get conversations error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
```

## Testing Encryption

### Test 1: Send Encrypted Message

1. Open browser console
2. Send a message
3. Check Network tab → WebSocket frames
4. You should see encrypted content (base64 strings)

### Test 2: Verify Decryption

1. Open two browsers with different accounts
2. Send message from Account A
3. Verify Account B receives and decrypts correctly
4. Check console for encryption logs

### Test 3: Database Verification

1. Open MongoDB Compass
2. Navigate to messages collection
3. Verify `content` field contains encrypted data
4. Should look like: `{"ciphertext":"...", "nonce":"...", "ephemeralPublicKey":"..."}`

## Sound Testing

### Test Typing Sound
1. Click in message input
2. Type a character
3. Should hear subtle typing sound

### Test Message Sent
1. Send a message
2. Should hear confirmation sound
3. Should feel haptic feedback (mobile)

### Test Message Received
1. Receive a message from another user
2. Should hear notification sound
3. Should feel haptic feedback (mobile)

## Troubleshooting

### "Recipient public key not found"
- Ensure recipient has logged in at least once
- Check that public key is being uploaded on registration
- Verify population includes `publicKey` field

### "Unable to decrypt message"
- Check that both users have valid key pairs
- Verify keys are being stored correctly
- Check console for detailed error messages

### Sounds Not Playing
- Check browser autoplay policy
- Ensure user has interacted with page first
- Check sound preferences in localStorage
- Verify audio files are loading

### Haptics Not Working
- Only works on mobile devices
- Check browser support for Vibration API
- Ensure haptics are enabled in preferences

## Performance Optimization

### Debounce Typing Sound
```typescript
import { debounce } from 'lodash';

const playTypingSoundDebounced = debounce(() => {
    playTypingSound();
}, 100);

// Use in onChange
onChange={(e) => {
    setMessage(e.target.value);
    playTypingSoundDebounced();
}}
```

### Cache Decrypted Messages
```typescript
const decryptedCache = new Map<string, string>();

const getDecryptedMessage = (message) => {
    if (decryptedCache.has(message._id)) {
        return decryptedCache.get(message._id);
    }
    
    const decrypted = decryptMessage(/* ... */);
    decryptedCache.set(message._id, decrypted);
    return decrypted;
};
```

## Security Best Practices

1. **Never Log Private Keys**: Remove any console.log with private keys
2. **Secure Key Storage**: Keys are encrypted with user password
3. **Clear Keys on Logout**: Call `clearKeys()` from encryption.ts
4. **Verify Signatures**: Use `verifySignature()` for important messages
5. **Rotate Keys**: Implement key rotation for long-term security

## Next Steps

1. ✅ Implement encryption in ChatWindow
2. ✅ Add sound effects
3. ✅ Test with multiple users
4. ⏳ Add key rotation
5. ⏳ Implement message signatures
6. ⏳ Add encrypted file sharing
7. ⏳ Implement perfect forward secrecy

## Example: Complete ChatWindow with Encryption

See `components/chat/ChatWindow.tsx` for the full implementation example.

## Questions?

- Check `ENHANCEMENTS_SUMMARY.md` for feature overview
- Review `lib/encryption.ts` for encryption API
- Review `lib/sounds.ts` for sound API
- Check console for debug logs

Happy coding! 🔐🎵
