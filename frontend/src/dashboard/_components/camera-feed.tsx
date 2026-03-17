import { useRef, useEffect, useCallback } from "react";

const W = 480;
const H = 300;

const RD_H_Y1 = 108;
const RD_H_Y2 = 192;
const RD_V_X1 = 198;
const RD_V_X2 = 282;
const MID_X = 240;
const MID_Y = 150;

// INDIAN LEFT-HAND TRAFFIC (LHT) LANES
const E_LANE_OUTER = 120; 
const E_LANE_INNER = 140; 
const W_LANE_INNER = 160; 
const W_LANE_OUTER = 180; 
const N_LANE_OUTER = 210; 
const N_LANE_INNER = 230; 
const S_LANE_INNER = 250; 
const S_LANE_OUTER = 270; 

type Direction = "east" | "west" | "north" | "south";
type TurnIntent = "straight" | "left" | "right";
type SigStatus = "green" | "yellow" | "red";

interface CanvasVehicle {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  speed: number;
  currentSpeed: number;
  direction: Direction;
  type: "car" | "bus" | "truck" | "ambulance"; // 🔥 ADDED AMBULANCE
  turnIntent: TurnIntent;
}

let _idCtr = 0;

const VEH_COLORS = [
  "#29b6f6", "#26c6da", "#66bb6a", "#ffa726",
  "#ef5350", "#ab47bc", "#78909c", "#d4e157", "#fff176",
];
const VEH_TYPES: CanvasVehicle["type"][] = ["car", "car", "car", "car", "bus", "truck"];

function makeVehicle(direction: Direction, stagger = false): CanvasVehicle {
  const type = VEH_TYPES[Math.floor(Math.random() * VEH_TYPES.length)];
  let w = type === "car" ? 18 + Math.floor(Math.random() * 4) : type === "bus" ? 34 : 26;
  let h = type === "car" ? 9 : type === "bus" ? 13 : 11;
  const speed = type === "car" ? 1.4 + Math.random() * 0.8 : 0.85 + Math.random() * 0.5;
  const color = VEH_COLORS[Math.floor(Math.random() * VEH_COLORS.length)];

  if (direction === "north" || direction === "south") {
    [w, h] = [h, w];
  }

  const randTurn = Math.random();
  const turnIntent: TurnIntent = randTurn < 0.25 ? "left" : randTurn < 0.5 ? "right" : "straight";

  let x = 0, y = 0;
  
  const getY = (dir: Direction) => {
    if (dir === "east") return turnIntent === "right" ? E_LANE_INNER : E_LANE_OUTER;
    if (dir === "west") return turnIntent === "right" ? W_LANE_INNER : W_LANE_OUTER;
    return 0;
  };
  const getX = (dir: Direction) => {
    if (dir === "north") return turnIntent === "right" ? N_LANE_INNER : N_LANE_OUTER;
    if (dir === "south") return turnIntent === "right" ? S_LANE_INNER : S_LANE_OUTER;
    return 0;
  };

  if (stagger) {
    switch (direction) {
      case "east":  x = Math.random() * (W + 60) - 60; y = getY("east") - h / 2; break;
      case "west":  x = Math.random() * (W + 60);      y = getY("west") - h / 2; break;
      case "south": y = Math.random() * (H + 60) - 60; x = getX("south") - w / 2; break;
      case "north": y = Math.random() * (H + 60);      x = getX("north") - w / 2; break;
    }
  } else {
    switch (direction) {
      case "east":  x = -w - 5;  y = getY("east") - h / 2; break;
      case "west":  x = W + 5;   y = getY("west") - h / 2; break;
      case "south": y = -h - 5;  x = getX("south") - w / 2; break;
      case "north": y = H + 5;   x = getX("north") - w / 2; break;
    }
  }
  return { id: _idCtr++, x, y, w, h, color, speed, currentSpeed: speed, direction, type, turnIntent };
}

function initVehicles(): CanvasVehicle[] {
  const dirs: Direction[] = ["east", "west", "north", "south"];
  return dirs.flatMap(dir => Array.from({ length: 6 }, () => makeVehicle(dir, true)));
}

export interface CameraFeedProps {
  signalStatus: SigStatus;
  cameraName: string;
  vehicleCount: number;
  intersection: string;
  active?: boolean;
  isEmergency?: boolean; // 🔥 Receive the button press!
}

export default function CameraFeed({
  signalStatus, cameraName, vehicleCount, intersection, active = true, isEmergency = false
}: CameraFeedProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const vehiclesRef = useRef<CanvasVehicle[]>(initVehicles());
  const rafRef     = useRef<number>(0);
  const frameRef   = useRef(0);
  const sigRef     = useRef<SigStatus>(signalStatus);
  const prevEmergency = useRef(false);

  useEffect(() => { sigRef.current = signalStatus; }, [signalStatus]);

  // 🔥 SPAWN AMBULANCE ON BUTTON CLICK 🔥
  useEffect(() => {
    if (isEmergency && !prevEmergency.current) {
      const dirs: Direction[] = ["east", "west", "north", "south"];
      const rDir = dirs[Math.floor(Math.random() * dirs.length)];
      const amb = makeVehicle(rDir, false);
      amb.type = "ambulance";
      amb.color = "#ffffff";
      amb.speed = 2.8; // Ambulances drive faster!
      amb.currentSpeed = 2.8;
      amb.turnIntent = "straight"; // Keep it simple so it clears fast
      
      // Hijack a random vehicle to spawn the ambulance instantly
      vehiclesRef.current[0] = amb; 
    }
    prevEmergency.current = isEmergency;
  }, [isEmergency]);

  const tick = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sig = sigRef.current;
    frameRef.current++;
    const veh = vehiclesRef.current;

    // 🔥 EVPR DETECTION LOGIC 🔥
    // Check if an ambulance is currently on the screen
    const ambulance = veh.find(v => v.type === "ambulance");
    const evprDir = ambulance ? ambulance.direction : null;

    const subCycle = frameRef.current % 480;
    const isRightPhase = subCycle > 240; 
    const isSubYellow = subCycle > 200 && subCycle <= 240 || subCycle > 440;

    let nsStrStatus: SigStatus = "red", nsRtStatus: SigStatus = "red";
    let ewStrStatus: SigStatus = "red", ewRtStatus: SigStatus = "red";

    if (sig === "green" || sig === "yellow") {
      if (!isRightPhase) nsStrStatus = isSubYellow ? "yellow" : "green";
      else nsRtStatus = isSubYellow ? "yellow" : "green";
      if (sig === "yellow") { nsStrStatus = "yellow"; nsRtStatus = "yellow"; }
    } else if (sig === "red") {
      if (!isRightPhase) ewStrStatus = isSubYellow ? "yellow" : "green";
      else ewRtStatus = isSubYellow ? "yellow" : "green";
    }

    // 🔥 DECOUPLE LANES FOR EMERGENCY OVERRIDE 🔥
    let nStr = nsStrStatus, nRt = nsRtStatus; // Northbound
    let sStr = nsStrStatus, sRt = nsRtStatus; // Southbound
    let eStr = ewStrStatus, eRt = ewRtStatus; // Eastbound
    let wStr = ewStrStatus, wRt = ewRtStatus; // Westbound

    if (evprDir) {
      // IF AMBULANCE DETECTED: Force its lane Green, force EVERYTHING else Red
      nStr = nRt = evprDir === "north" ? "green" : "red";
      sStr = sRt = evprDir === "south" ? "green" : "red";
      eStr = eRt = evprDir === "east" ? "green" : "red";
      wStr = wRt = evprDir === "west" ? "green" : "red";
    }

    for (let i = 0; i < veh.length; i++) {
      const v = veh[i];

      let canGo = false;
      if (evprDir) {
        // 🔥 EVPR OVERRIDE: Only cars going the same direction as the ambulance can move!
        canGo = (v.direction === evprDir);
      } else {
        // Normal 8-Phase Logic
        if (v.direction === "north") canGo = v.turnIntent === "right" ? (nRt === "green" || nRt === "yellow") : (nStr === "green" || nStr === "yellow");
        else if (v.direction === "south") canGo = v.turnIntent === "right" ? (sRt === "green" || sRt === "yellow") : (sStr === "green" || sStr === "yellow");
        else if (v.direction === "east") canGo = v.turnIntent === "right" ? (eRt === "green" || eRt === "yellow") : (eStr === "green" || eStr === "yellow");
        else if (v.direction === "west") canGo = v.turnIntent === "right" ? (wRt === "green" || wRt === "yellow") : (wStr === "green" || wStr === "yellow");
      }

      let blocked = false;
      for (let j = 0; j < veh.length; j++) {
        if (j === i || veh[j].direction !== v.direction) continue;
        const o = veh[j];
        
        const sameLane = v.direction === "east" || v.direction === "west" 
          ? Math.abs(v.y - o.y) < 10 
          : Math.abs(v.x - o.x) < 10;
        
        if (!sameLane) continue;

        const gap = v.type === "ambulance" ? 6 : 12; // Ambulances tailgate aggressively to push traffic
        if (v.direction === "east"  && o.x > v.x && o.x - (v.x + v.w) < gap) { blocked = true; break; }
        if (v.direction === "west"  && o.x < v.x && v.x - (o.x + o.w) < gap) { blocked = true; break; }
        if (v.direction === "south" && o.y > v.y && o.y - (v.y + v.h) < gap) { blocked = true; break; }
        if (v.direction === "north" && o.y < v.y && v.y - (o.y + o.h) < gap) { blocked = true; break; }
      }

      let yielding = false;
      if (canGo && v.turnIntent === "right" && !evprDir) { // Ambulances don't yield!
        const inIntersection = v.x > RD_V_X1 && v.x < RD_V_X2 && v.y > RD_H_Y1 && v.y < RD_H_Y2;
        if (inIntersection) {
          for (let j = 0; j < veh.length; j++) {
            const o = veh[j];
            if (o.turnIntent === "straight") {
              if (v.direction === "north" && o.direction === "south" && o.y < MID_Y + 40 && o.y > RD_H_Y1 - 20) yielding = true;
              if (v.direction === "south" && o.direction === "north" && o.y > MID_Y - 40 && o.y < RD_H_Y2 + 20) yielding = true;
              if (v.direction === "east"  && o.direction === "west"  && o.x > MID_X - 40 && o.x < RD_V_X2 + 20) yielding = true;
              if (v.direction === "west"  && o.direction === "east"  && o.x < MID_X + 40 && o.x > RD_V_X1 - 20) yielding = true;
            }
          }
        }
      }

      let atStop = false;
      const isFreeLeft = v.turnIntent === "left";

      if (!canGo && !isFreeLeft) {
        if (v.direction === "east"  && v.x + v.w >= RD_V_X1 - 30 && v.x + v.w <= RD_V_X1) atStop = true;
        if (v.direction === "west"  && v.x       <= RD_V_X2 + 30 && v.x       >= RD_V_X2) atStop = true;
        if (v.direction === "south" && v.y + v.h >= RD_H_Y1 - 30 && v.y + v.h <= RD_H_Y1) atStop = true;
        if (v.direction === "north" && v.y       <= RD_H_Y2 + 30 && v.y       >= RD_H_Y2) atStop = true;
      }

      const decel = 0.1;
      if (atStop || blocked || yielding) {
        v.currentSpeed = Math.max(0, v.currentSpeed - decel * 2);
      } else {
        v.currentSpeed = Math.min(v.speed, v.currentSpeed + decel);
      }

      let nextX = v.x;
      let nextY = v.y;
      
      if (v.direction === "east") {
        nextX += v.currentSpeed;
        const pivotX = v.turnIntent === "left" ? N_LANE_OUTER - v.h / 2 : S_LANE_OUTER - v.h / 2;
        if (v.turnIntent !== "straight" && v.x <= pivotX && nextX >= pivotX) {
          v.x = pivotX; v.y = v.turnIntent === "left" ? E_LANE_OUTER - v.w / 2 : E_LANE_INNER - v.w / 2;
          v.direction = v.turnIntent === "left" ? "north" : "south";
          [v.w, v.h] = [v.h, v.w]; v.turnIntent = "straight"; 
        } else v.x = nextX;
      } 
      else if (v.direction === "west") {
        nextX -= v.currentSpeed;
        const pivotX = v.turnIntent === "left" ? S_LANE_OUTER - v.h / 2 : N_LANE_OUTER - v.h / 2;
        if (v.turnIntent !== "straight" && v.x >= pivotX && nextX <= pivotX) {
          v.x = pivotX; v.y = v.turnIntent === "left" ? W_LANE_OUTER - v.w / 2 : W_LANE_INNER - v.w / 2;
          v.direction = v.turnIntent === "left" ? "south" : "north";
          [v.w, v.h] = [v.h, v.w]; v.turnIntent = "straight"; 
        } else v.x = nextX;
      } 
      else if (v.direction === "south") {
        nextY += v.currentSpeed;
        const pivotY = v.turnIntent === "left" ? E_LANE_OUTER - v.w / 2 : W_LANE_OUTER - v.w / 2;
        if (v.turnIntent !== "straight" && v.y <= pivotY && nextY >= pivotY) {
          v.y = pivotY; v.x = v.turnIntent === "left" ? S_LANE_OUTER - v.h / 2 : S_LANE_INNER - v.h / 2;
          v.direction = v.turnIntent === "left" ? "east" : "west";
          [v.w, v.h] = [v.h, v.w]; v.turnIntent = "straight"; 
        } else v.y = nextY;
      } 
      else if (v.direction === "north") {
        nextY -= v.currentSpeed;
        const pivotY = v.turnIntent === "left" ? W_LANE_OUTER - v.w / 2 : E_LANE_OUTER - v.w / 2;
        if (v.turnIntent !== "straight" && v.y >= pivotY && nextY <= pivotY) {
          v.y = pivotY; v.x = v.turnIntent === "left" ? N_LANE_OUTER - v.h / 2 : N_LANE_INNER - v.h / 2;
          v.direction = v.turnIntent === "left" ? "west" : "east";
          [v.w, v.h] = [v.h, v.w]; v.turnIntent = "straight"; 
        } else v.y = nextY;
      }

      // Respawn logic
      const m = 50;
      const off =
        (v.direction === "east"  && v.x > W + m) ||
        (v.direction === "west"  && v.x < -v.w - m) ||
        (v.direction === "south" && v.y > H + m) ||
        (v.direction === "north" && v.y < -v.h - m);
      
      if (off) {
        const newV = makeVehicle(v.direction);
        // 🔥 0.2% chance a natural ambulance spawns from off-screen
        if (Math.random() < 0.002) {
          newV.type = "ambulance";
          newV.color = "#ffffff";
          newV.speed = 2.8;
          newV.currentSpeed = 2.8;
          newV.turnIntent = "straight";
        }
        veh[i] = { ...newV, id: v.id };
      }
    }

    // ── Draw ─────────────────────────────────────────────────────
    ctx.fillStyle = "#181826"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#22223a";
    ctx.fillRect(0, 0, W, RD_H_Y1); ctx.fillRect(0, RD_H_Y2, W, H - RD_H_Y2);
    ctx.fillRect(0, RD_H_Y1, RD_V_X1, RD_H_Y2 - RD_H_Y1); ctx.fillRect(RD_V_X2, RD_H_Y1, W - RD_V_X2, RD_H_Y2 - RD_H_Y1);
    ctx.fillStyle = "#282b40"; ctx.fillRect(0, RD_H_Y1, W, RD_H_Y2 - RD_H_Y1); ctx.fillRect(RD_V_X1, 0, RD_V_X2 - RD_V_X1, H);
    ctx.fillStyle = "#30334e"; ctx.fillRect(RD_V_X1, RD_H_Y1, RD_V_X2 - RD_V_X1, RD_H_Y2 - RD_H_Y1);

    ctx.setLineDash([]); ctx.strokeStyle = "rgba(255,210,0,0.45)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, MID_Y); ctx.lineTo(RD_V_X1, MID_Y); ctx.moveTo(RD_V_X2, MID_Y); ctx.lineTo(W, MID_Y);
    ctx.moveTo(MID_X, 0); ctx.lineTo(MID_X, RD_H_Y1); ctx.moveTo(MID_X, RD_H_Y2); ctx.lineTo(MID_X, H); ctx.stroke();

    ctx.setLineDash([8, 8]); ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 1;
    const laneDividers = [
      [0, E_LANE_OUTER + 10, RD_V_X1, E_LANE_OUTER + 10], [RD_V_X2, E_LANE_OUTER + 10, W, E_LANE_OUTER + 10],
      [0, W_LANE_INNER + 10, RD_V_X1, W_LANE_INNER + 10], [RD_V_X2, W_LANE_INNER + 10, W, W_LANE_INNER + 10],
      [N_LANE_OUTER + 10, 0, N_LANE_OUTER + 10, RD_H_Y1], [N_LANE_OUTER + 10, RD_H_Y2, N_LANE_OUTER + 10, H],
      [S_LANE_INNER + 10, 0, S_LANE_INNER + 10, RD_H_Y1], [S_LANE_INNER + 10, RD_H_Y2, S_LANE_INNER + 10, H],
    ];
    laneDividers.forEach(([x1, y1, x2, y2]) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); });
    ctx.setLineDash([]);

    ctx.fillStyle = "rgba(255,255,255,0.28)";
    for (let ci = 0; ci < 4; ci++) {
      ctx.fillRect(RD_V_X1 - 14, RD_H_Y1 + ci * 19 + 3, 11, 8); ctx.fillRect(RD_V_X2 + 3,  RD_H_Y1 + ci * 19 + 3, 11, 8);
      ctx.fillRect(RD_V_X1 + ci * 19 + 3, RD_H_Y1 - 14, 8, 11); ctx.fillRect(RD_V_X1 + ci * 19 + 3, RD_H_Y2 + 3,  8, 11);
    }

    veh.forEach(v => {
      ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillRect(v.x + 2, v.y + 2, v.w, v.h);
      ctx.fillStyle = v.color; ctx.fillRect(v.x, v.y, v.w, v.h);
      
      // 🔥 SPECIAL AMBULANCE DRAWING 🔥
      if (v.type === "ambulance") {
        // Red Cross
        ctx.fillStyle = "#ff2222";
        const cx = v.x + v.w/2, cy = v.y + v.h/2;
        ctx.fillRect(cx - 1, cy - 3, 2, 6); ctx.fillRect(cx - 3, cy - 1, 6, 2);
        
        // Flashing Strobes (Red & Blue)
        const blink = Math.floor(frameRef.current / 8) % 2 === 0;
        ctx.fillStyle = blink ? "#ff2222" : "#0044ff";
        if (v.direction === "east") ctx.fillRect(v.x + v.w - 4, v.y, 2, v.h);
        else if (v.direction === "west") ctx.fillRect(v.x + 2, v.y, 2, v.h);
        else if (v.direction === "south") ctx.fillRect(v.x, v.y + v.h - 4, v.w, 2);
        else if (v.direction === "north") ctx.fillRect(v.x, v.y + 2, v.w, 2);
      } else {
        // Normal car windshields
        ctx.fillStyle = "rgba(180,225,255,0.55)";
        if (v.direction === "east") { ctx.fillRect(v.x + v.w * 0.55, v.y + 1.5, v.w * 0.27, v.h - 3); }
        else if (v.direction === "west") { ctx.fillRect(v.x + v.w * 0.18, v.y + 1.5, v.w * 0.27, v.h - 3); }
        else if (v.direction === "south") { ctx.fillRect(v.x + 1.5, v.y + v.h * 0.55, v.w - 3, v.h * 0.27); }
        else if (v.direction === "north") { ctx.fillRect(v.x + 1.5, v.y + v.h * 0.18, v.w - 3, v.h * 0.27); }
      }
      
      // Headlights for all
      ctx.fillStyle = "rgba(255,255,200,0.85)";
      if (v.direction === "east")  { ctx.fillRect(v.x + v.w - 2, v.y + 1, 2, 2); ctx.fillRect(v.x + v.w - 2, v.y + v.h - 3, 2, 2); }
      if (v.direction === "west")  { ctx.fillRect(v.x, v.y + 1, 2, 2); ctx.fillRect(v.x, v.y + v.h - 3, 2, 2); }
      if (v.direction === "south") { ctx.fillRect(v.x + 1, v.y + v.h - 2, 2, 2); ctx.fillRect(v.x + v.w - 3, v.y + v.h - 2, 2, 2); }
      if (v.direction === "north") { ctx.fillRect(v.x + 1, v.y, 2, 2); ctx.fillRect(v.x + v.w - 3, v.y, 2, 2); }
    });

    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillRect(RD_V_X1 - 3, MID_Y, 3, RD_H_Y2 - MID_Y); ctx.fillRect(RD_V_X2, RD_H_Y1, 3, MID_Y - RD_H_Y1);
    ctx.fillRect(RD_V_X1, RD_H_Y1 - 3, MID_X - RD_V_X1, 3); ctx.fillRect(MID_X, RD_H_Y2, RD_V_X2 - MID_X, 3);

    const drawMiniSig = (lx: number, ly: number, status: SigStatus, isHoriz: boolean) => {
      ctx.fillStyle = "#080810";
      if (isHoriz) {
        ctx.fillRect(lx, ly, 16, 6);
        ctx.fillStyle = status === "red" ? "#ff2222" : "#1a0000"; ctx.fillRect(lx + 1, ly + 1, 4, 4);
        ctx.fillStyle = status === "yellow" ? "#ffcc00" : "#1a0000"; ctx.fillRect(lx + 6, ly + 1, 4, 4);
        ctx.fillStyle = status === "green" ? "#00e040" : "#1a0000"; ctx.fillRect(lx + 11, ly + 1, 4, 4);
      } else {
        ctx.fillRect(lx, ly, 6, 16);
        ctx.fillStyle = status === "red" ? "#ff2222" : "#1a0000"; ctx.fillRect(lx + 1, ly + 1, 4, 4);
        ctx.fillStyle = status === "yellow" ? "#ffcc00" : "#1a0000"; ctx.fillRect(lx + 1, ly + 6, 4, 4);
        ctx.fillStyle = status === "green" ? "#00e040" : "#1a0000"; ctx.fillRect(lx + 1, ly + 11, 4, 4);
      }
    };

    // Draw the decoupled signals!
    drawMiniSig(S_LANE_OUTER - 4, RD_H_Y1 - 20, sStr, false); drawMiniSig(S_LANE_INNER - 4, RD_H_Y1 - 20, sRt, false);
    drawMiniSig(N_LANE_OUTER - 4, RD_H_Y2 + 4, nStr, false); drawMiniSig(N_LANE_INNER - 4, RD_H_Y2 + 4, nRt, false);
    drawMiniSig(RD_V_X1 - 20, E_LANE_OUTER - 4, eStr, true); drawMiniSig(RD_V_X1 - 20, E_LANE_INNER - 4, eRt, true);
    drawMiniSig(RD_V_X2 + 4, W_LANE_OUTER - 4, wStr, true); drawMiniSig(RD_V_X2 + 4, W_LANE_INNER - 4, wRt, true);

    for (let sy = 0; sy < H; sy += 3) { ctx.fillStyle = "rgba(0,0,0,0.065)"; ctx.fillRect(0, sy, W, 1); }

    ctx.fillStyle = "rgba(0,0,0,0.62)"; ctx.fillRect(0, 0, W, 22);
    ctx.font = "bold 10px 'Courier New', monospace"; ctx.fillStyle = "#00e5ff";
    ctx.fillText(cameraName, 8, 14); ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillText(intersection.length > 30 ? intersection.slice(0, 30) + "…" : intersection, 90, 14);

    if (Math.floor(frameRef.current / 18) % 2 === 0) {
      ctx.fillStyle = "#ff2222"; ctx.fillRect(W - 40, 6, 7, 7);
      ctx.fillStyle = "#ff8080"; ctx.font = "bold 9px monospace"; ctx.fillText("LIVE", W - 28, 14);
    }

    ctx.fillStyle = "rgba(0,0,0,0.62)"; ctx.fillRect(0, H - 20, W, 20);
    ctx.font = "10px 'Courier New', monospace"; ctx.fillStyle = "rgba(200,200,200,0.65)";
    ctx.fillText(new Date().toLocaleTimeString(), 8, H - 6);
    ctx.fillStyle = "#00e5ff"; ctx.fillText(`${vehicleCount} VEH`, 100, H - 6);
    
    // UI Label logic
    const scColor: Record<SigStatus, string> = { green: "#00e040", yellow: "#ffcc00", red: "#ff2222" };
    ctx.fillStyle = evprDir ? "#0044ff" : scColor[sig];
    ctx.fillText(evprDir ? "🚨 EVPR ACTIVE" : `● ${sig.toUpperCase()}`, W - 100, H - 6);

    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.88);
    vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  }, [cameraName, vehicleCount, intersection]);

  useEffect(() => {
    if (!active) return;
    const loop = () => { tick(); rafRef.current = requestAnimationFrame(loop); };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick, active]);

  return <canvas ref={canvasRef} width={W} height={H} className="w-full block rounded-md" />;
}