# 🛒 SaaS-Based Multi-Store E-Commerce Platform

> 🚀 A customizable **multi-tenant e-commerce SaaS platform** similar to Shopify, enabling businesses to launch their own branded online stores with independent admin dashboards, product management, and theme configuration.

---

## ✨ Highlights

* 🏬 Multi-Tenant Architecture
* 🧑‍💼 Admin Dashboard with CMS
* 🔐 Role-Based Access Control
* 🎨 Theme Color & Layout Customization
* 💳 Razorpay Payment Integration
* ⚙️ Custom Workflow Configuration
* 🧾 GST Tax Slab Configuration
* 🔍 Filters & Variant Management
* 📧 Mail Triggers on Rejection / Confirmation
* 📱 Fully Responsive UI

---

## 📦 Repositories

* 🌐 **Frontend Repo:** [https://github.com/shre1shetty/E-Commerce](https://github.com/shre1shetty/E-Commerce)
* 🧩 **Backend Repo:** [https://github.com/shre1shetty/E-commerce-Backend](https://github.com/shre1shetty/E-commerce-Backend)

---

## 📸 Screenshots
<img width="45%" height="200px" alt="image" src="https://github.com/user-attachments/assets/f9e7eef0-0309-4cad-ab83-7fda5c0efd7d" /><img width="45%" height="200px" alt="image" src="https://github.com/user-attachments/assets/5a4abb08-4ce4-4294-b03e-e5c6463ed6d0" />
<img width="45%" height="200px" alt="image" src="https://github.com/user-attachments/assets/9c2f988e-ce84-4ac6-9993-a4b6f2844992" /><img width="45%" height="200px" alt="image" src="https://github.com/user-attachments/assets/4fe2609f-7363-49da-90cc-98370f679364" />





### 🔑 Authentication

<img width="2532" height="675" alt="image" src="https://github.com/user-attachments/assets/6ad5fa61-ec24-4a23-bbc9-41075378654e" />
<img width="2559" height="477" alt="image" src="https://github.com/user-attachments/assets/70243bb2-632d-4bef-80e3-52920a396b38" />


### 🏪 Storefront

<img width="45%" height="200px" alt="image" src="https://github.com/user-attachments/assets/f9e7eef0-0309-4cad-ab83-7fda5c0efd7d" /><img width="45%" height="200px" alt="image" src="https://github.com/user-attachments/assets/5a4abb08-4ce4-4294-b03e-e5c6463ed6d0" />

### 🧑‍💼 Admin Dashboard

<img width="45%" height="200px" alt="image" src="https://github.com/user-attachments/assets/9c2f988e-ce84-4ac6-9993-a4b6f2844992" /><img width="45%" height="200px" alt="image" src="https://github.com/user-attachments/assets/4fe2609f-7363-49da-90cc-98370f679364" />

---

## 🛠 Tech Stack

### 🎨 Frontend

* React
* Redux Toolkit
* Tailwind CSS

### 🧩 Backend

* Node.js
* Express.js
* MongoDB + Mongoose

### 🔐 Authentication

* JSON Web Tokens (JWT)

### 💳 Payments

* Razorpay

### 📊 Analytics

* Google Analytics

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/shre1shetty/E-Commerce-Backend
```

### 2️⃣ Setup

```bash
npm install
npm run dev
```

---

## 🔐 Environment Variables
Backend `.env`:

```env
PORT= 5000
CLIENT_URL= http://localhost:5173
ENCRYPTION_KEY= KEY
LOCAL_MONGO_URI= LOCAL MONGO URL
MONGO_URI= PROD MONGO URL
RAZORPAY_SECRET= SECRET
RAZORPAY_KEY_ID= KEY
ACCESS_TOKEN_SECRET= ACCES TOKEN SECRET
REFRESH_TOKEN_SECRET= REFRESH TOKEN SECRET
GA4_PRIVATE_KEY= GA4 PRIVATE KEY
GA4_CLIENT_EMAIL= GA4 CLIENT EMAIL
GA4_PROPERTY_ID= ID
MAILTRAP_HOST= sandbox.smtp.mailtrap.io
MAILTRAP_PORT= PORT
MAILTRAP_USER= USERNAME
MAILTRAP_PASS= PASS
FROM_EMAIL= FROM MAIL

```

---

## 🔒 Security Practices

* Razorpay Secret hashing
* JWT authentication
* Input validation
* Protected routes
* CORS enabled

---

## 🚀 Deployment

* Frontend: Vercel
* Backend: Render
* Database: MongoDB Atlas

---

## 👤 Author

**Shrevan Shetty**
Full Stack MERN Developer

---

## 🌱 Future Enhancements

* Multi-language support
* Advanced analytics dashboard
* Recommendation engine

---

## 📄 License

MIT License
