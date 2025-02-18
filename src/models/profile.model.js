import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },
    interests: [
      {
        type: String,
      },
    ],
    skills: [
      {
        type: String,
      },
    ],
    location: {
      type: String,
      default: null,
    },
    socialLinks: {
      twitter: String,
      linkedin: String,
      github: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Profile = mongoose.model("Profile", profileSchema);
