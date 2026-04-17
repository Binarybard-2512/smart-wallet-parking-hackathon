# 🚗 Smart Valet Parking System
### *Next-Gen Multi-Level AI-Driven Parking Solution*

[![Hackathon](https://img.shields.io/badge/Hackathon-2024-blueviolet?style=for-the-badge)](https://github.com/Binarybard-2512/smart-valet-parking-hackathon)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)

A state-of-the-art **Smart Parking System** designed for efficiency, visibility, and automation. Featuring a **120-slot dual-level 3D simulation**, the system uses RFID and Keyfob frequency data to intelligently assign parking spaces.

---

## 🌟 Key Features

### 🏢 Multi-Level 3D Architecture
- **120 Individual Slots**: Distributed across two distinct levels (60 Top / 60 Bottom).
- **Interactive 3D Simulation**: Built with **React Three Fiber (R3F)**, allowing users to orbit, zoom, and visualize the parking lot in real-time.
- **Dynamic Pathfinding**: Visualizes the exact path a vehicle takes from the entry gate to its assigned slot with animated waypoints.

### 🤖 Intelligent AI Assignment logic
- **Top-Level Priority**: Logic-driven assignment that prioritizes filling the Top Level (Level 1) first for faster access.
- **Staggered Organization**: Slots are arranged in a structured grid with dedicated driving lanes and clear markings.
- **Real-time Capacity Tracking**: Interactive dashboard showing "Total", "Occupied", and "Free" slots with immediate "Full Capacity" alerts.

### 📡 Advanced Sensor Integration
- **RFID + Keyfob Validation**: Unique identification for every vehicle including RFID code and Keyfob frequency (Hz).
- **Visual Status Indicators**: 
  - 🟢 **Green**: Slot Available.
  - 🔴 **Red**: Slot Occupied (displays vehicle RFID and Frequency data).
  - 🔵/🟡 **Animated**: Real-time parking/retrieval paths.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Vanilla CSS.
- **3D Graphics**: Three.js, React Three Fiber, React Three Drei.
- **Animations**: React Spring (for smooth UI/3D transitions).
- **Backend interface**: Python-based API service for hardware communication.
- **Hardware core**: ESP32, RFID-RC522, Keyfob receivers.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation & Setup

#### 💻 Frontend
1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Launch the 3D dashboard**:
   ```bash
   npm run dev
   ```

#### ⚙️ Backend
1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```
2. **Initialize Environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
3. **Install Requirements**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Run Service**:
   ```bash
   python main.py
   ```

---

## 📸 Interface Preview
*(Image placeholder for the 3D Simulation Dashboard)*

> [!TIP]
> Use your mouse to **Rotate** (Left Click), **Pan** (Right Click), and **Zoom** (Scroll) within the 3D simulation to explore both levels of the parking lot.

---

## 🤝 Contributing
Built with passion for the **Binarybard-2512** Hackathon. Feel free to fork, explore, and suggest improvements!

---
*Developed by the Binarybard Team.*
