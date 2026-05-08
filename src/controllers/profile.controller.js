import Profile from "../models/profile.model.js";
import Bid from "../models/bid.model.js";
import User from "../models/user.model.js";

// Retrieve user profile or create a new one if it does not exist
const getOrCreateProfile = async (userId) => {
  let profile = await Profile.findOne({ userId });

  if (!profile) {
    profile = await Profile.create({ userId });
  }

  return profile;
};
// Create a new profile for the authenticated user
export const createProfile = async (req, res) => {
  try {
  // Check if profile already exists
    let profile = await Profile.findOne({ userId: req.user });

    if (profile) {
      return res.status(400).json({ message: "Profile already exists" });
    }
    // Create new profile using request body data
    profile = await Profile.create({
      userId: req.user,
      ...req.body
    });

    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Fetch user profile and calculate completion percentage
export const getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.user });

    // Automatically create profile if it does not exist
    if (!profile) {
      profile = await Profile.create({
        userId: req.user
      });
    }

   // List of profile fields used to calculate completion percentage
   const fields = [
     profile.name,
     profile.jobTitle,
     profile.bio,
     profile.linkedin,
     profile.profileImage,

     profile.programme && profile.programme !== "Unknown",
     profile.graduationYear,
     profile.industry && profile.industry !== "Unknown",
     profile.location && profile.location !== "Unknown",

     profile.degrees?.length > 0,
     profile.certifications?.length > 0,
     profile.licences?.length > 0,
     profile.courses?.length > 0,
     profile.employment?.length > 0
   ];

   // Count how many fields are filled
   const filled = fields.filter(Boolean).length;
   // Calculate completion percentage based on filled fields
   const completion = Math.round((filled / fields.length) * 100);

   // Fetch user statistics because appearanceCount is stored in User model
   const user = await User.findById(req.user).select(
     "appearanceCount winsThisMonth isWinner"
   );

   // Return profile data, completion percentage, and user statistics
   res.json({
     ...profile.toObject(),
     appearanceCount: user?.appearanceCount || 0,
     winsThisMonth: user?.winsThisMonth || 0,
     isWinner: user?.isWinner || false,
     completion
   });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Update profile fields and recalculate completion percentage
export const updateProfile = async (req, res) => {
  try {
  // Prepare dynamic update object (only include provided fields)
    const updateData = {};

    if (req.body.name) updateData.name = req.body.name;
    if (req.body.jobTitle) updateData.jobTitle = req.body.jobTitle;
    if (req.body.bio) updateData.bio = req.body.bio;
    if (req.body.linkedin) updateData.linkedin = req.body.linkedin;
    if (req.body.profileImage) updateData.profileImage = req.body.profileImage;
    if (req.body.programme) updateData.programme = req.body.programme;
    if (req.body.graduationYear !== undefined) {
      updateData.graduationYear = Number(req.body.graduationYear);
    }
    if (req.body.industry) updateData.industry = req.body.industry;
    if (req.body.location) updateData.location = req.body.location;

    // Update profile or create one if it does not exist (upsert)
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user },
      updateData,
      {
        new: true,
        upsert: true
      }
    );

   // Recalculate completion after profile update
    const fields = [
      profile.name,
      profile.jobTitle,
      profile.bio,
      profile.linkedin,
      profile.profileImage,

      profile.programme && profile.programme !== "Unknown",
      profile.graduationYear,
      profile.industry && profile.industry !== "Unknown",
      profile.location && profile.location !== "Unknown",

      profile.degrees?.length > 0,
      profile.certifications?.length > 0,
      profile.licences?.length > 0,
      profile.courses?.length > 0,
      profile.employment?.length > 0
    ];

    const filled = fields.filter(Boolean).length;
    const completion = Math.round((filled / fields.length) * 100);

    // Return updated profile along with new completion percentage
    res.json({
      message: "Profile updated",
      profile,
      completion
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Add new item to user's profile section (e.g., degree, certification, etc.)
export const addDegree = async (req, res) => {
  let profile = await Profile.findOne({ userId: req.user });

  if (!profile) {
    profile = await Profile.create({ userId: req.user });
  }

  // Append new entry to profile array
  profile.degrees.push(req.body);
  await profile.save();

  res.json(profile);
};
export const addCertification = async (req, res) => {
  let profile = await Profile.findOne({ userId: req.user });

  if (!profile) {
    profile = await Profile.create({ userId: req.user });
  }
  // Append new entry to profile array
  profile.certifications.push(req.body);
  await profile.save();

  res.json(profile);
};
export const addLicence = async (req, res) => {
  let profile = await Profile.findOne({ userId: req.user });

  if (!profile) {
    profile = await Profile.create({ userId: req.user });
  }
  // Append new entry to profile array
  profile.licences.push(req.body);
  await profile.save();

  res.json(profile);
};
export const addCourse = async (req, res) => {
  let profile = await Profile.findOne({ userId: req.user });

  if (!profile) {
    profile = await Profile.create({ userId: req.user });
  }
  // Append new entry to profile array
  profile.courses.push(req.body);
  await profile.save();

  res.json(profile);
};
export const addEmployment = async (req, res) => {
  let profile = await Profile.findOne({ userId: req.user });

  if (!profile) {
    profile = await Profile.create({ userId: req.user });
  }
  // Append new entry to profile array
  profile.employment.push(req.body);
  await profile.save();

  res.json(profile);
};
// Delete entire user profile
export const deleteProfile = async (req, res) => {
  await Profile.findOneAndDelete({ userId: req.user });

  res.json({ message: "Profile deleted" });
};
// Retrieve today's featured alumnus based on winner selection
export const getFeaturedAlumnus = async (req, res) => {
  try {
    // Find user marked as today's winner
    const winner = await User.findOne({ isWinner: true });

    if (!winner) {
      return res.json({ message: "No featured alumnus today" });
    }

    // Fetch profile of the winning user
    const profile = await Profile.findOne({ userId: winner._id });

    res.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// Retrieve user's bidding statistics (total bids and wins)
export const getStats = async (req, res) => {
  try {
  // Count total bids placed by user
    const bids = await Bid.countDocuments({ userId: req.user });
    // Count total winning bids for user
    const wins = await Bid.countDocuments({
      userId: req.user,
      isWinner: true
    });

    res.json({ bids, wins });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Delete item from profile array using index
export const deleteDegree = async (req, res) => {
  const profile = await getOrCreateProfile(req.user);
  // Validate index before deleting
  if (!profile.degrees[req.params.index]) {
    return res.status(400).json({ message: "Invalid index" });
  }
  // Remove item from array
  profile.degrees.splice(req.params.index, 1);
  await profile.save();

  res.json({ message: "Degree deleted" });
};
// Delete item from profile array using index
export const deleteCertification = async (req, res) => {
  const profile = await getOrCreateProfile(req.user);
  // Validate index before deleting
  if (!profile.certifications[req.params.index]) {
    return res.status(400).json({ message: "Invalid index" });
  }
  // Remove item from array
  profile.certifications.splice(req.params.index, 1);
  await profile.save();

  res.json({ message: "Certification deleted" });
};
// Delete item from profile array using index
export const deleteLicence = async (req, res) => {
  const profile = await getOrCreateProfile(req.user);
  // Validate index before deleting
  if (!profile.licences[req.params.index]) {
    return res.status(400).json({ message: "Invalid index" });
  }
  // Remove item from array
  profile.licences.splice(req.params.index, 1);
  await profile.save();

  res.json({ message: "Licence deleted" });
};
// Delete item from profile array using index
export const deleteCourse = async (req, res) => {
  const profile = await getOrCreateProfile(req.user);
  // Validate index before deleting
  if (!profile.courses[req.params.index]) {
    return res.status(400).json({ message: "Invalid index" });
  }
  // Remove item from array
  profile.courses.splice(req.params.index, 1);
  await profile.save();

  res.json({ message: "Course deleted" });
};
// Delete item from profile array using index
export const deleteEmployment = async (req, res) => {
  const profile = await getOrCreateProfile(req.user);
  // Validate index before deleting
  if (!profile.employment[req.params.index]) {
    return res.status(400).json({ message: "Invalid index" });
  }
  // Remove item from array
  profile.employment.splice(req.params.index, 1);
  await profile.save();

  res.json({ message: "Employment deleted" });
};
// Update specific item in profile array using index
export const updateDegree = async (req, res) => {
  const profile = await getOrCreateProfile(req.user);
  // Validate index before updating
  if (!profile.degrees[req.params.index]) {
    return res.status(400).json({ message: "Invalid degree index" });
  }
  // Update specific field of selected item
  profile.degrees[req.params.index].title = req.body.title;

  await profile.save();
  res.json(profile);
};
// Update specific item in profile array using index
export const updateCertification = async (req, res) => {
  const profile = await getOrCreateProfile(req.user);
  // Validate index before updating
  if (!profile.certifications[req.params.index]) {
    return res.status(400).json({ message: "Invalid index" });
  }
  // Update specific field of selected item
  profile.certifications[req.params.index].name = req.body.name;

  await profile.save();
  res.json(profile);
};
// Update specific item in profile array using index
export const updateLicence = async (req, res) => {
  const profile = await getOrCreateProfile(req.user);
  // Validate index before updating
  if (!profile.licences[req.params.index]) {
    return res.status(400).json({ message: "Invalid index" });
  }
  // Update specific field of selected item
  profile.licences[req.params.index].name = req.body.name;

  await profile.save();
  res.json(profile);
};
// Update specific item in profile array using index
export const updateCourse = async (req, res) => {
  const profile = await getOrCreateProfile(req.user);
  // Validate index before updating
  if (!profile.courses[req.params.index]) {
    return res.status(400).json({ message: "Invalid index" });
  }
  // Update specific field of selected item
  profile.courses[req.params.index].name = req.body.name;

  await profile.save();
  res.json(profile);
};
// Update specific item in profile array using index
export const updateEmployment = async (req, res) => {
  const profile = await getOrCreateProfile(req.user);
  // Validate index before updating
  if (!profile.employment[req.params.index]) {
    return res.status(400).json({ message: "Invalid index" });
  }
  // Update specific field of selected item
  profile.employment[req.params.index].company = req.body.company;

  await profile.save();
  res.json(profile);
};
// Retrieve all profiles with optional search filters for administrative or directory use
export const getAllProfiles = async (req, res) => {
  try {
    const { jobTitle, company } = req.query;

    let filter = {};

    if (jobTitle) filter.jobTitle = jobTitle;

    if (company) filter["employment.company"] = company;

    const profiles = await Profile.find(filter);

    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

