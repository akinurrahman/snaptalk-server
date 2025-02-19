import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({

 email : {
    type: String,
    required: true,
    unique: [true, "Email already exists"],
    index: true,
 },
 password : {
    type: String,
    required: true,
 },
 refreshToken : {
    type: String,
 },
 profile : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Profile",
 }
},{timestamps : true});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      profile: this.profile,
      createdAt: this.createdAt,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

// toJSON method to remove password from the response
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};




export const User = mongoose.model("User", userSchema);



