import mongoose from 'mongoose';

const oauthAccountsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'userType',
      required: true,
    },
    userType: {
      type: String,
      enum: ['Client', 'Counselor'],
      required: true,
    },
    provider: {
      type: String,
      enum: ['google', 'facebook', 'twitter', 'github'],
      required: true,
    },
    providerAccountId: { 
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export const OauthAccounts = mongoose.model('OauthAccounts', oauthAccountsSchema);
