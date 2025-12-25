import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
    type: 'direct' | 'group';
    participants: mongoose.Types.ObjectId[];
    name?: string; // For group chats
    avatar?: string; // For group chats
    description?: string; // For group chats
    admins: mongoose.Types.ObjectId[]; // For group chats
    lastMessage?: mongoose.Types.ObjectId;
    lastMessageAt?: Date;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
    {
        type: {
            type: String,
            enum: ['direct', 'group'],
            required: true,
        },
        participants: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }],
        name: {
            type: String,
            trim: true,
        },
        avatar: String,
        description: {
            type: String,
            maxlength: 500,
        },
        admins: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: 'Message',
        },
        lastMessageAt: Date,
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

export default mongoose.model<IConversation>('Conversation', conversationSchema);
