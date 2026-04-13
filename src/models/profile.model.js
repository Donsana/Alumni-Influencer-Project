import mongoose from "mongoose";

const degreeSchema = new mongoose.Schema({
  title: String,
  university: String,
  url: String,
  completionDate: Date
});

const certificationSchema = new mongoose.Schema({
  name: String,
  provider: String,
  url: String,
  completionDate: Date
});

const licenceSchema = new mongoose.Schema({
  name: String,
  authority: String,
  url: String,
  completionDate: Date
});

const courseSchema = new mongoose.Schema({
  name: String,
  provider: String,
  url: String,
  completionDate: Date
});

const employmentSchema = new mongoose.Schema({
  company: String,
  role: String,
  startDate: Date,
  endDate: Date
});

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },

  bio: String,
  linkedin: String,
  name: String,
  jobTitle: String,

  degrees: [degreeSchema],
  certifications: [certificationSchema],
  licences: [licenceSchema],
  courses: [courseSchema],
  employment: [employmentSchema],

  profileImage: String // (optional URL for now)

}, { timestamps: true });

export default mongoose.model("Profile", profileSchema);