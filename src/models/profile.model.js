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

  programme: {
    type: String,
    default: ""
  },

  graduationYear: {
    type: Number,
    default: null
  },

  industry: {
    type: String,
    default: ""
  },

  location: {
    type: String,
    default: ""
  },

  degrees: [degreeSchema],
  certifications: [certificationSchema],
  licences: [licenceSchema],
  courses: [courseSchema],
  employment: [employmentSchema],

  profileImage: String // (optional URL for now)

}, { timestamps: true });

profileSchema.index({ programme: 1 });
profileSchema.index({ graduationYear: 1 });
profileSchema.index({ industry: 1 });
profileSchema.index({ location: 1 });

export default mongoose.model("Profile", profileSchema);