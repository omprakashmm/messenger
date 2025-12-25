import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
    conversationId: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    content: string;
    encryptedContent?: string; // For E2E encryption
    type: 'text' | 'image' | 'video' | 'audio' | 'file';
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    replyTo?: mongoose.Types.ObjectId;

    // Delivery Status
    status: 'sending' | 'sent' | 'delivered' | 'seen';
    sentAt?: Date;
    deliveredAt?: Date;
    seenAt?: Date;
    deliveredTo: {
        userId: mongoose.Types.ObjectId;
        deliveredAt: Date;
    }[];

    reactions: {
        userId: mongoose.Types.ObjectId;
        emoji: string;
    }[];
    readBy: {
        userId: mongoose.Types.ObjectId;
        readAt: Date;
    }[];
    isEdited: boolean;
    editHistory?: {
        content: string;
        editedAt: Date;
    }[];
    isDeleted: boolean;
    deletedAt?: Date;
    deletedFor?: mongoose.Types.ObjectId[]; // Users who deleted this message
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
    {
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
            index: true,
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        encryptedContent: {
            type: String,
        },
        type: {
            type: String,
            enum: ['text', 'image', 'video', 'audio', 'file'],
            default: 'text',
        },
        fileUrl: String,
        fileName: String,
        fileSize: Number,
        replyTo: {
            type: Schema.Types.ObjectId,
            ref: 'Message',
        },

        // Delivery Status
        status: {
            type: String,
            enum: ['sending', 'sent', 'delivered', 'seen'],
            default: 'sending',
        },
        sentAt: Date,
        deliveredAt: Date,
        seenAt: Date,
        deliveredTo: [{
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
            deliveredAt: {
                type: Date,
                default: Date.now,
            },
        }],

        reactions: [{
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
            emoji: String,
        }],
        readBy: [{
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
            readAt: {
                type: Date,
                default: Date.now,
            },
        }],
        isEdited: {
            type: Boolean,
            default: false,
        },
        editHistory: [{
            content: String,
            editedAt: {
                type: Date,
                default: Date.now,
            },
        }],
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: Date,
        deletedFor: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
messageSchema.index({ conversationId: 1, createdAt: -1 });

export default mongoose.model<IMessage>('Message', messageSchema);
