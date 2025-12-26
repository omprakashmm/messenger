import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    phone?: string;
    phoneVerified: boolean;
    otp?: string;
    otpExpiry?: Date;
    avatar?: string;
    bio?: string;
    status: 'online' | 'offline' | 'away';
    lastSeen: Date;
    publicKey?: string; // For E2E encryption
    contacts: mongoose.Types.ObjectId[];
    blockedUsers: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 30,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        phone: {
            type: String,
            default: '',
        },
        phoneVerified: {
            type: Boolean,
            default: false,
        },
        otp: {
            type: String,
            default: '',
        },
        otpExpiry: {
            type: Date,
        },
        avatar: {
            type: String,
            default: '',
        },
        bio: {
            type: String,
            maxlength: 200,
            default: '',
        },
        status: {
            type: String,
            enum: ['online', 'offline', 'away'],
            default: 'offline',
        },
        lastSeen: {
            type: Date,
            default: Date.now,
        },
        publicKey: {
            type: String,
            default: '',
        },
        contacts: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
        blockedUsers: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
