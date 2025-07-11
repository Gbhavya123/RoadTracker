<div align="center">

# 🛣️ RoadTracker

### _Report and Track Road Issues in Your Community_

<img src="./public/logo.png" alt="RoadTracker Logo" width="200" height="200">

<!-- Animated Road SVG -->
<svg width="100%" height="50" viewBox="0 0 800 50" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="roadGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#4A90E2;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#50C878;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="8" y="21" fill="url(#roadGradient1)" rx="4">
    <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite"/>
  </rect>
  <circle r="4" fill="#FF6B6B" cy="25" cx="0">
    <animate attributeName="cx" values="0;800;0" dur="4s" repeatCount="indefinite"/>
  </circle>
</svg>

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

<h3>
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#installation">Installation</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#team">Team</a>
</h3>

</div>

---

<div align="center">
<svg width="60%" height="20" viewBox="0 0 600 20" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dividerGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:0" />
      <stop offset="50%" style="stop-color:#764ba2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#667eea;stop-opacity:0" />
    </linearGradient>
  </defs>
  <line x1="0" y1="10" x2="600" y2="10" stroke="url(#dividerGradient1)" stroke-width="2" />
  <circle r="3" fill="#764ba2" cy="10" cx="300" />
</svg>
</div>


## 🚀 **About RoadTracker**

RoadTracker is a comprehensive **community-driven platform** that empowers citizens to report road issues and helps local authorities track and resolve them efficiently. From potholes to traffic signal malfunctions, our platform bridges the gap between citizens and municipal services.

### ✨ **Key Highlights**

- 📱 **User-Friendly Interface** - Intuitive reporting system
- 🗺️ **Interactive Map** - Visual representation of reported issues
- 👥 **Community Driven** - Real-time updates from local residents
- 📊 **Admin Dashboard** - Comprehensive management tools
- 🔄 **Real-time Updates** - Track issue resolution progress

---

## 🎯 **Features**

<div align="center">

| Feature                  | Description                                  |
| ------------------------ | -------------------------------------------- |
| 🚨 **Issue Reporting**   | Easy-to-use form for reporting road problems |
| 🗺️ **Interactive Map**   | Visual map showing all reported issues       |
| 📊 **Admin Dashboard**   | Complete management system for authorities   |
| 👤 **User Dashboard**    | Personal tracking of submitted reports       |
| 🌙 **Dark/Light Mode**   | Toggle between themes for better UX          |
| 📱 **Responsive Design** | Works seamlessly on all devices              |

</div>

---

## 🛠️ **Tech Stack**

<div align="center">

| Category             | Technologies               |
| -------------------- | -------------------------- |
| **Frontend**         | React 18, TypeScript, Vite |
| **Styling**          | Tailwind CSS, shadcn/ui    |
| **State Management** | React Hooks, Context API   |
| **Build Tool**       | Vite                       |
| **Package Manager**  | Bun                        |
| **Deployment**       | Vercel Ready               |

</div>

---

## 📁 **Project Structure**

```
road-watch-reports-now/
├── public/
│   ├── logo.png           # Application logo
│   └── favicon.ico        # Favicon
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── AdminDashboard.tsx
│   │   ├── LandingPage.tsx
│   │   ├── MapView.tsx
│   │   └── ReportPage.tsx
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   └── pages/            # Page components
├── package.json
└── README.md
```

---

## 👥 **Meet Team HackUnite**

<div align="center">

<table>
<tr>
<td align="center">
<img src="https://github.com/AnujShrivastava01.png" width="100px;" alt="Anuj Shrivastava"/><br />
<sub><b>Anuj Shrivastava</b></sub><br />
<sub>Team Lead | Frontend | UI-UX | Deployment</sub><br />
<br/>
<a href="https://github.com/AnujShrivastava01">
  <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
</a><br/>
<a href="https://www.linkedin.com/in/anujshrivastava1/">
  <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/>
</a>
</td>
<td align="center">
<img src="https://github.com/vishanurag.png" width="100px;" alt="Anurag Vishwakarma"/><br />
<sub><b>Anurag Vishwakarma</b></sub><br />
<sub>Backend | UI Enhancement</sub><br />
<br/>
<a href="https://github.com/vishanurag">
  <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
</a><br/>
<a href="https://www.linkedin.com/in/anuragvishwakarma/">
  <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/>
</a>
</td>
</tr>
<tr>
<td align="center">
<img src="https://github.com/Gbhavya123.png" width="100px;" alt="Bhavya Gupta"/><br />
<sub><b>Bhavya Gupta</b></sub><br />
<sub>Frontend | Backend</sub><br />
<br/>
<a href="https://github.com/Gbhavya123">
  <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
</a><br/>
<a href="https://www.linkedin.com/in/bhavya-gupta-88664128a/">
  <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/>
</a>
</td>
<td align="center">
<img src="https://github.com/Divyansh8843.png" width="100px;" alt="Divyansh Agrawal"/><br />
<sub><b>Divyansh Agrawal</b></sub><br />
<sub>Backend | AI Model Integration | Database</sub><br />
<br/>
<a href="https://github.com/Divyansh8843">
  <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
</a><br/>
<a href="https://www.linkedin.com/in/divyansh-agrawal-4556a0299/">
  <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/>
</a>
</td>
</tr>
</table>
</div>

---


## 🚀 **Deployment**

This project is optimized for deployment on **Vercel**:

1. Fork this repository
2. Connect your GitHub account to Vercel
3. Import the project
4. Deploy with one click!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/PeerXLearning/road-watch-reports-now)

---

## 🤝 **Contributing**

We welcome contributions! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### 🌟 **Star this repository if you found it helpful!**

**Made with ❤️ by Team HackUnite**

<img src="https://forthebadge.com/images/badges/built-with-love.svg" alt="Built with Love">
<img src="https://forthebadge.com/images/badges/made-with-typescript.svg" alt="Made with TypeScript">

</div>
