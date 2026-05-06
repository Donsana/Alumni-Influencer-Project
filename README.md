# Alumni Influencer Platform

A full-stack web application where alumni compete through a blind bidding system to become the **Featured Alumni of the Day**.

---

## 📖 Overview

This platform allows alumni to register using their university email, create profiles, and participate in a daily blind bidding system. The highest bidder is automatically selected as the featured alumnus using scheduled cron jobs. The system also tracks monthly wins and enforces limits.

---

## 🚀 Features

* User registration with university email validation (@iit.ac.lk)
* Email verification system
* JWT authentication (login & protected routes)
* Password reset functionality
* Alumni profile management (CRUD)
* Add degrees, certifications, licences, courses, employment
* Blind bidding system (users cannot see others' bids)
* Automatic bid updates (only higher bids allowed)
* Monthly win limit (maximum 3 wins per user)
* Automated winner selection (cron jobs)
* Featured alumnus display on dashboard
* Token revocation (logout)
* API usage tracking (optional bonus)
* Swagger API documentation

---

## 🔄 System Flow

1. User registers using IIT email  
2. Email is verified  
3. User logs in  
4. User creates/updates profile  
5. User places a daily bid  
6. System selects highest bid automatically at midnight  
7. Winner is marked and featured  
8. Monthly win count is tracked and limited  

---

## 🛠️ Tech Stack

### Backend
* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication
* bcrypt
* Swagger (OpenAPI)

### Frontend
* HTML
* CSS
* JavaScript (Vanilla JS)

---

## 🏗️ Architecture

Frontend (HTML/CSS/JavaScript)  
↓  
REST API (Express.js Backend)  
↓  
MongoDB Database

The system follows a three-tier architecture consisting of frontend, backend API layer, and MongoDB database layer. The frontend communicates with the backend using RESTful APIs secured with JWT authentication and API keys.

---

## ⚙️ Setup Instructions

### 1. Install dependencies
npm install

### 2. Create `.env` file
PORT=5000  
MONGO_URI=your_mongodb_uri  
JWT_SECRET=your_secret_key  

### 3. Run the backend server
npm start

---

## 🌐 Frontend Setup

1. Navigate to frontend folder  
cd frontend  

2. Open using VS Code Live Server  
OR open `index.html` manually in browser  

Frontend URL:  
http://127.0.0.1:5500  

---

## 🔗 API Base URL

http://localhost:5000/api

---

## 📄 API Documentation

Swagger UI:  
http://localhost:5000/api-docs  

---

## 🔐 Authentication

Use Bearer Token in headers:

Authorization: Bearer YOUR_TOKEN

---

## 📊 Bidding Rules

* Users can place only one bid per day  
* Users can increase bid amount only  
* Highest bid wins automatically  
* Users can win maximum 3 times per month  
* Bidding is blind (users cannot see others' bids)  

---

## 🧪 Testing

You can test APIs using:
* Swagger UI
* Postman

---

## 📌 Notes

* Email verification tokens are logged in console (for testing)
* Password reset tokens are logged in console
* Cron jobs handle:
  * Daily winner selection
  * Monthly reset of wins
* Profile is auto-created when first accessed

---

## 👨‍💻 Author

Alumni Influencer Platform Project