1. Abstract
Urban traffic congestion is a severe challenge exacerbated by the limitations of traditional, static traffic light systems. Fixed timers cannot adapt to real-time vehicle density, leading to artificial gridlocks and excessive carbon emissions from idling vehicles. TrafficOS is a state-of-the-art Adaptive Traffic Signal Optimization system designed for Smart Cities. It utilizes a highly optimized, 60-FPS HTML5 Canvas physics engine and a custom AI algorithm to dynamically optimize traffic signal phases based on real-time queue lengths. By implementing an 8-Phase Protected Routing cycle specifically tailored for Left-Hand Traffic (LHT) and integrating a live Emergency Vehicle Preemption (EVPR) override, TrafficOS maximizes throughput, eliminates intersection collisions, and provides a quantifiable reduction in urban CO₂ emissions.

2. Problem Statement
To build a self-adaptive traffic management command center that replaces static signal infrastructure. Disproportionate and diverse traffic in different lanes leads to the highly inefficient utilization of time slots, characterized by slower speeds, longer trip times, and trapped emergency responders. The objective is to create a centralized platform capable of ingesting real-time intersection density data, dynamically calculating green-light durations to prevent phantom waiting, actively overriding signals for ambulances, and providing city planners with a "God's Eye" visualization of urban traffic flow and sustainability metrics.

3. Introduction
Traffic congestion degrades urban mobility and contributes heavily to global emissions. Traditional fixed-cycle controllers operate blindly, unable to resolve high wait times when cross-streets are empty. This inefficiency necessitates a shift toward "Living Intelligence" in urban infrastructure. TrafficOS serves as both the "eyes" and the "brain" of a smart intersection. It monitors real-time road conditions and employs dynamic time allocation, ensuring that maximum vehicular throughput is achieved with minimal conflict. Furthermore, by directly addressing the critical failure of emergency response delays via automated "Green Wave" corridors, TrafficOS prioritizes both efficiency and human life.

4. Execution
Demo
The project features a live, interactive "God's Eye" WebGL dashboard capable of rendering hundreds of autonomous vehicular agents, dynamic signal nodes, and real-time data visualizations (Live CCTV, Speed Heatmaps, and Directional Flow maps).

Dependencies
The platform is built on modern web technologies. Dependencies are managed via npm (Node Package Manager).

Environment: Node.js

Core Framework: React 18, TypeScript

Styling & Animation: Tailwind CSS, Framer Motion

Execution: Run locally via npm run dev.

5. Technology
5.1 High-Performance Frontend & State Architecture
Unlike traditional python-based backend models, TrafficOS leverages a decentralized state management system using custom React Hooks (useTrafficData.ts). This acts as the single source of truth, propagating real-time algorithmic changes to the UI without latency.

5.2 Custom HTML5 Canvas Physics Engine
To simulate real-world traffic behavior at 60 FPS without DOM lag, TrafficOS relies on a low-level HTML5 Canvas rendering API.

Indian LHT Model: The physics engine is strictly programmed for Left-Hand Traffic rules.

Autonomous Agents: Vehicles utilize raycasting-style proximity detection to prevent rear-end collisions and strictly adhere to the "Front Bumper Rule" at intersection stop-lines.

Free Left Slip Lanes: The engine natively supports and calculates flow interference for merging left-turners.

5.3 8-Phase Protected Routing
To eliminate the "T-Bone Zone" where 60% of intersection accidents occur, the engine utilizes an advanced 8-phase sub-cycle. It completely separates straight-flowing traffic from right-turning traffic, utilizing protected green arrows to ensure zero vehicular conflict paths.

6. Working
The solution operates through a continuous, 60-FPS feedback loop:

Data Ingestion: The system evaluates the real-time queue density (number of vehicles) waiting at each specific lane.

Priority Override Check (EVPR): The system scans for Emergency Vehicles (ambulances). If detected, it immediately halts normal cross-traffic and forces a single-lane Green Wave.

Adaptive Time Allocation: If no emergency is detected, the AI Brain calculates the exact green time required for the current queue using a dynamic formula. If a lane is completely empty, the system instantly skips that phase to achieve "Zero Idle Waste".

Execution & Visualization: The calculated time slots trigger the virtual traffic lights. The dashboard simultaneously updates the Live Map, Carbon Tracker, and Incident Alerts.

7. Code

https://github.com/user-attachments/assets/e0082788-4d95-4efa-abdf-8973876cbdaf


7.1 Adaptive Engine & Sustainability Logic (TypeScript):
TrafficOS replaces arbitrary timers with strict mathematical logic for both traffic flow and carbon tracking.

TypeScript
// 1. Dynamic Timer Calculation (Queue-Based Math)
// Formula: Green Time = Base(10s) + (Queue * 1.5s)
const calculateDynamicPhase = (queueLength: number): number => {
  const BASE_TIME = 10; 
  const TIME_PER_VEHICLE = 1.5;
  const MAX_CAP = 60; // Prevent starvation of other lanes

  if (queueLength === 0) return 0; // Zero Idle Waste (Skip phase)
  
  let optimalTime = BASE_TIME + (queueLength * TIME_PER_VEHICLE);
  return Math.min(optimalTime, MAX_CAP);
};

// 2. Verifiable Sustainability Tracker
// Fact: Idling burns 0.6L/hr. 1L of fuel emits 2.3kg of CO2.
const calculateCarbonPrevented = (idleSecondsSaved: number): { fuelSavedLiters: number, co2PreventedKg: number } => {
  const IDLE_BURN_RATE_PER_SEC = 0.6 / 3600; 
  const CO2_PER_LITER = 2.3;

  const fuelSavedLiters = idleSecondsSaved * IDLE_BURN_RATE_PER_SEC;
  const co2PreventedKg = fuelSavedLiters * CO2_PER_LITER;

  return { fuelSavedLiters, co2PreventedKg };
};
8. Result
The finalized TrafficOS platform delivers a zero-latency, highly aesthetic Command Center. It successfully demonstrates the ability to auto-correct artificial gridlock via queue-based timing. The integration of the EVPR system successfully maps and clears emergency corridors instantly. Furthermore, the dashboard accurately translates intersection efficiency into auditable sustainability metrics (Fuel Saved and CO₂ Prevented), providing city administrators with a powerful tool for environmental tracking.

9. Conclusion
The goal of this work is to fundamentally upgrade urban infrastructure from static hardware to adaptive software. By utilizing custom physics simulations and dynamic algorithms, TrafficOS proves that intelligent time-allocation can drastically reduce vehicular queuing and trip times. The implementation of the 8-Phase LHT cycle ensures safety is not compromised for speed. By actively tracking the reduction of idling vehicles, the system provides a verifiable method for reducing the urban carbon footprint. TrafficOS represents the transition from blind traffic lights to a living, reactive city grid.

10. Extensibility (Future Roadmap)
While currently powered by a robust physics simulation, TrafficOS is architected for immediate real-world deployment. The system can be extended by:

Computer Vision (YOLOv8) Integration: Replacing the simulated data feed with live RTSP streams from existing CCTV cameras to process real-world object detection.

V2X (Vehicle-to-Everything) Communication: Utilizing 5G edge computing to allow smart vehicles to broadcast their approach velocity directly to the TrafficOS backend.

Green Wave Syncing: Expanding the adaptive algorithm to synchronize multiple consecutive intersections, creating automated, city-wide flow corridors.
