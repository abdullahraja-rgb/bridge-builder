# Bridge Builder

A web-based physics puzzle game where you design and construct bridges to transport a vehicle across a chasm. Built with **React**, **Matter.js**, and **HTML5 Canvas**.



## 🎮 Game Overview
Your goal is simple: **Get the car to the other side.**

You have a limited budget to buy materials (Joints and Wood Beams). You must design a structure strong enough to support its own weight **and** the weight of the moving vehicle. If the stress on a beam is too high, it will snap, sending your bridge (and the car) tumbling into the abyss.

### Key Features
* **Build Mode:** Intuitive grid-based building system.
* **Physics Simulation:** Real-time 2D physics using the powerful **Matter.js** engine.
* **Stress Visualization:** Beams change color (Green → Red) as they take on load.
* **Structural Failure:** Beams snap dynamically if they exceed their material strength.
* **Budget System:** Manage your resources carefully to complete the level.
* **Win/Loss Detection:** Automatic detection of successful crossings or catastrophic failures.

---

## 🛠️ Tech Stack
* **Frontend Library:** React 18
* **Build Tool:** Vite
* **Physics Engine:** Matter.js
* **Rendering:** HTML5 Canvas API
* **Styling:** Tailwind CSS

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project running on your local machine.

### Prerequisites
* **Node.js** (v14 or higher)
* **npm** (usually comes with Node.js)

### Installation
1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/bridge-builder.git](https://github.com/yourusername/bridge-builder.git)
    cd bridge-builder
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  **Open your browser**
    Visit `http://localhost:5173` (or the URL shown in your terminal).

---

## 🕹️ How to Play

1.  **Select a Tool:**
    * **Joint ($50):** Creates a connection point (node) on the grid.
    * **Beam ($100/m):** Connects two joints with a wooden plank.
2.  **Build Your Bridge:**
    * Click the **Joint** tool, then click anywhere on the grid to place a node.
    * Click the **Beam** tool. Click a starting joint, then click a second joint to connect them.
    * *Tip: Triangles are the strongest shape!*
3.  **Watch Your Budget:**
    * Keep an eye on the top-right corner. You cannot build if you run out of money.
4.  **Test It:**
    * Click **Test Bridge** to switch to simulation mode.
    * Gravity will turn on, and the car will attempt to cross.
    * If the bridge holds and the car reaches the right side, you win!
    * If the bridge breaks, click **Reset** to tweak your design.

---

## 📂 Project Structure
```text
├── index.html          # Entry HTML file
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
└── src
    ├── index.jsx       # React entry point
    └── App.jsx         # Main Game Component (Logic, Physics, UI)
