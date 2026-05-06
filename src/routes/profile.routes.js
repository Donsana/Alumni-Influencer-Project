import express from "express";
import {
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile,
  deleteDegree,
  deleteCertification,
  deleteCourse,
  deleteEmployment,
  deleteLicence,
  addDegree,
  addCertification,
  addLicence,
  addCourse,
  addEmployment,
  getFeaturedAlumnus,
  getStats,
  updateDegree,
  updateCertification,
  updateLicence,
  updateCourse,
  updateEmployment
} from "../controllers/profile.controller.js";
import { getAllProfiles } from "../controllers/profile.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/profile:
 *   post:
 *     summary: Create profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             bio: Software Developer
 *             linkedin: https://linkedin.com/in/test
 *     responses:
 *       201:
 *         description: Profile created
 */

router.post("/", protect, createProfile);
/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched
 */

router.get("/", protect, getProfile);
/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             bio: Senior Developer
 *     responses:
 *       200:
 *         description: Profile updated
 */

router.put("/", protect, updateProfile);
/**
 * @swagger
 * /api/profile:
 *   delete:
 *     summary: Delete profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile deleted
 */

router.delete("/", protect, deleteProfile);

/**
 * @swagger
 * /api/profile/degree:
 *   post:
 *     summary: Add degree
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             title: BSc Computer Science
 *             university: IIT
 *     responses:
 *       200:
 *         description: Degree added
 */

router.post("/degree", protect, addDegree);
/**
 * @swagger
 * /api/profile/certification:
 *   post:
 *     summary: Add certification
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             name: AWS Certificate
 *             provider: Amazon
 *     responses:
 *       200:
 *         description: Certification added
 */
router.post("/certification", protect, addCertification);
/**
 * @swagger
 * /api/profile/licence:
 *   post:
 *     summary: Add licence
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             name: Chartered Engineer
 *             authority: IESL
 *             url: https://example.com
 *     responses:
 *       200:
 *         description: Licence added
 *       401:
 *         description: Unauthorized
 */
router.post("/licence", protect, addLicence);
/**
 * @swagger
 * /api/profile/course:
 *   post:
 *     summary: Add course
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             name: React Development
 *             provider: Udemy
 *             url: https://example.com
 *     responses:
 *       200:
 *         description: Course added
 *       401:
 *         description: Unauthorized
 */
router.post("/course", protect, addCourse);
/**
 * @swagger
 * /api/profile/employment:
 *   post:
 *     summary: Add employment
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             company: Google
 *             role: Software Engineer
 *             startDate: 2022-01-01
 *             endDate: 2024-01-01
 *     responses:
 *       200:
 *         description: Employment added
 *       401:
 *         description: Unauthorized
 */
router.post("/employment", protect, addEmployment);
/**
 * @swagger
 * /api/profile/featured:
 *   get:
 *     summary: Get today's featured alumnus
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Featured alumnus fetched
 */

router.get("/featured", getFeaturedAlumnus);
/**
 * @swagger
 * /api/profile/stats:
 *   get:
 *     summary: Get profile statistics
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats fetched
 */
router.get("/stats", protect, getStats);
/**
 * @swagger
 * /api/profile/degree/{index}:
 *   delete:
 *     summary: Delete degree
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Degree deleted
 */
router.delete("/degree/:index", protect, deleteDegree);
/**
 * @swagger
 * /api/profile/certification/{index}:
 *   delete:
 *     summary: Delete certification
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: certification deleted
 */
router.delete("/certification/:index", protect, deleteCertification);
/**
 * @swagger
 * /api/profile/licence/{index}:
 *   delete:
 *     summary: Delete licence
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: license deleted
 */
router.delete("/licence/:index", protect, deleteLicence);
/**
 * @swagger
 * /api/profile/course/{index}:
 *   delete:
 *     summary: Delete course
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: course deleted
 */
router.delete("/course/:index", protect, deleteCourse);
/**
 * @swagger
 * /api/profile/employment/{index}:
 *   delete:
 *     summary: Delete employment
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: employment deleted
 */
router.delete("/employment/:index", protect, deleteEmployment);
/**
 * @swagger
 * /api/profile/degree/{index}:
 *   put:
 *     summary: Update degree
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Degree updated
 *       401:
 *         description: Unauthorized
 */
router.put("/degree/:index", protect, updateDegree);
/**
 * @swagger
 * /api/profile/certification/{index}:
 *   put:
 *     summary: Update certification
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Certification updated
 *       401:
 *         description: Unauthorized
 */
router.put("/certification/:index", protect, updateCertification);
/**
 * @swagger
 * /api/profile/licence/{index}:
 *   put:
 *     summary: Update licence
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Licence updated
 *       401:
 *         description: Unauthorized
 */
router.put("/licence/:index", protect, updateLicence);
/**
 * @swagger
 * /api/profile/course/{index}:
 *   put:
 *     summary: Update course
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course updated
 *       401:
 *         description: Unauthorized
 */
router.put("/course/:index", protect, updateCourse);
/**
 * @swagger
 * /api/profile/employment/{index}:
 *   put:
 *     summary: Update employment
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employment updated
 *       401:
 *         description: Unauthorized
 */
router.put("/employment/:index", protect, updateEmployment);

/**
 * @swagger
 * /api/profile/all:
 *   get:
 *     summary: Get all profiles with optional filters
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: jobTitle
 *         schema:
 *           type: string
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profiles returned
 */
router.get("/all", protect, getAllProfiles);

export default router;