import React, { useState, useReducer, useRef, useEffect, useCallback } from 'react';

// --- 1. CONSTANTS ---
const GRID_SIZE = 40;
const JOINT_RADIUS = 8;
const BEAM_WIDTH = 6;
const JOINT_COST = 50;
const VEHICLE_WIDTH = 60;
const VEHICLE_HEIGHT = 30;
const WHEEL_RADIUS = 12;

const MATERIALS = {
    wood: {
        cost: 100,
        strength: 2.5,
        color: '#A97C50',
        stressColor: [35, 38],
    },
    steel: {
        cost: 300,
        strength: 8,
        color: '#C0C0C0',
        stressColor: [200, 10],
    },
};

const LEVEL_01 = {
    start: { x: 4 * GRID_SIZE, y: 8 * GRID_SIZE },
    end: { x: 20 * GRID_SIZE, y: 8 * GRID_SIZE },
    chasmWidth: 16 * GRID_SIZE,
    initialBudget: 5000,
};

// --- 2. GAME REDUCER & STATE LOGIC ---
function createInitialJoints(level) {
    const startId = `joint-${level.start.x}-${level.start.y}`;
    const endId = `joint-${level.end.x}-${level.end.y}`;
    return {
        [startId]: { id: startId, x: level.start.x, y: level.start.y, static: true },
        [endId]: { id: endId, x: level.end.x, y: level.end.y, static: true },
    };
}

const initialState = {
    joints: createInitialJoints(LEVEL_01),
    beams: {},
    budget: LEVEL_01.initialBudget,
    mode: 'build',
    status: 'building',
    stress: {},
    level: LEVEL_01,
};

function gameReducer(state, action) {
    switch (action.type) {
        case 'ADD_JOINT': {
            const { id, x, y } = action.payload;
            if (state.budget < JOINT_COST) return state;
            if (state.joints[id]) return state;

            return {
                ...state,
                budget: state.budget - JOINT_COST,
                joints: { ...state.joints, [id]: { id, x, y, static: false } },
            };
        }
        case 'ADD_BEAM': {
            const { id, jointAId, jointBId, material } = action.payload;
            const jointA = state.joints[jointAId];
            const jointB = state.joints[jointBId];
            
            // Check for existing beam
            const reverseId = Object.keys(state.beams).find(key => 
                (state.beams[key].jointAId === jointBId && state.beams[key].jointBId === jointAId) ||
                (state.beams[key].jointAId === jointAId && state.beams[key].jointBId === jointBId)
            );
            if (state.beams[id] || reverseId) return state;

            const dx = (jointB.x - jointA.x) / GRID_SIZE;
            const dy = (jointB.y - jointA.y) / GRID_SIZE;
            const lengthInUnits = Math.sqrt(dx * dx + dy * dy);
            const cost = lengthInUnits * MATERIALS[material].cost;

            if (state.budget < cost) return state;

            return {
                ...state,
                budget: state.budget - cost,
                beams: {
                    ...state.beams,
                    [id]: { id, jointAId, jointBId, material, strength: MATERIALS[material].strength },
                },
            };
        }
        case 'SET_MODE':
            return { ...state, mode: action.payload, stress: action.payload === 'build' ? {} : state.stress };
        case 'SET_STATUS':
            return { ...state, status: action.payload };
        case 'UPDATE_STRESS':
            return { ...state, stress: action.payload };
        case 'SNAP_BEAM': {
            const newBeams = { ...state.beams };
            delete newBeams[action.payload.id];
            return { ...state, beams: newBeams };
        }
        case 'RESET_LEVEL':
            return {
                ...initialState,
                level: state.level,
                joints: createInitialJoints(state.level),
                budget: state.level.initialBudget,
            };
        default:
            return state;
    }
}

// --- 3. HOOKS ---
function useMatterJS(onReady) {
    const MATTER_SCRIPT_URL = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';
    const SCRIPT_ID = 'matter-js-script';

    useEffect(() => {
        if (document.getElementById(SCRIPT_ID)) {
            if (window.Matter) onReady(window.Matter);
            else {
                const script = document.getElementById(SCRIPT_ID);
                script.addEventListener('load', () => onReady(window.Matter));
            }
            return;
        }

        const script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.src = MATTER_SCRIPT_URL;
        script.async = true;
        script.onload = () => {
            if (window.Matter) onReady(window.Matter);
        };
        document.head.appendChild(script);
    }, [onReady]);
}

// --- 4. UI COMPONENTS ---
function StatusModal({ status, onReset }) {
    if (status === 'building' || status === 'testing') return null;
    const isSuccess = status === 'success';
    return (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="text-center p-8 bg-gray-800 rounded-lg shadow-2xl border border-gray-700">
                <h2 className={`text-5xl font-bold mb-4 ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
                    {isSuccess ? 'Success!' : 'Failure!'}
                </h2>
                <button onClick={onReset} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xl font-semibold">
                    Try Again
                </button>
            </div>
        </div>
    );
}

function Controls({ budget, currentTool, onToolChange, onTest, onReset, gameMode, hasBeams }) {
    return (
        <div className="flex-shrink-0 bg-gray-700 p-3 flex items-center justify-between w-full rounded-b-lg">
            <div className="flex items-center gap-4">
                <span className="font-bold text-lg text-white">Tools:</span>
                <button 
                    onClick={() => onToolChange('joint')}
                    className={`px-4 py-2 rounded transition-colors text-white ${currentTool === 'joint' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
                >
                    Joint (${JOINT_COST})
                </button>
                <button
                    onClick={() => onToolChange('beam')}
                    className={`px-4 py-2 rounded transition-colors text-white ${currentTool === 'beam' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
                >
                    Wood Beam
                </button>
            </div>
            <div className={`font-bold text-xl ${budget < 0 ? 'text-red-500' : 'text-green-400'}`}>
                Budget: ${Math.round(budget)}
            </div>
            <div>
                {gameMode === 'build' ? (
                    <button
                        onClick={onTest}
                        disabled={!hasBeams}
                        className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-bold text-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        Test Bridge
                    </button>
                ) : (
                    <button
                        onClick={onReset}
                        className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-lg transition-colors"
                    >
                        Reset
                    </button>
                )}
            </div>
        </div>
    );
}

// --- 5. MAIN GAME LOGIC ---
function Game() {
    const [gameState, dispatch] = useReducer(gameReducer, initialState);
    const [tool, setTool] = useState('joint'); 
    const [selectedJoint, setSelectedJoint] = useState(null);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
    const [Matter, setMatter] = useState(null);

    const canvasRef = useRef(null);
    const engineRef = useRef(null);
    const runnerRef = useRef(null);
    const bodiesRef = useRef({}); 

    useMatterJS(setMatter);

    const resizeCanvas = useCallback(() => {
        const container = canvasRef.current?.parentElement;
        if (container) {
            setCanvasSize({ width: container.clientWidth, height: container.clientHeight });
        }
    }, []);

    useEffect(() => {
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [resizeCanvas]);

    const draw = useCallback((ctx) => {
        ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
        const level = gameState.level;

        // Environment
        ctx.fillStyle = '#87CEEB'; 
        ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
        ctx.fillStyle = '#8B4513'; 
        const groundTop = level.start.y + JOINT_RADIUS;
        ctx.fillRect(0, groundTop, canvasSize.width, canvasSize.height - groundTop);
        ctx.fillStyle = '#4682B4'; 
        ctx.fillRect(level.start.x, groundTop, level.chasmWidth, canvasSize.height);

        // Grid
        if (gameState.mode === 'build') {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            for (let x = 0; x < canvasSize.width; x += GRID_SIZE) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvasSize.height); ctx.stroke();
            }
            for (let y = 0; y < canvasSize.height; y += GRID_SIZE) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasSize.width, y); ctx.stroke();
            }
        }

        // Beams
        Object.values(gameState.beams).forEach(beam => {
            const jointA = gameState.joints[beam.jointAId];
            const jointB = gameState.joints[beam.jointBId];
            if (!jointA || !jointB) return;

            let x1 = jointA.x, y1 = jointA.y, x2 = jointB.x, y2 = jointB.y;
            if (gameState.mode === 'simulate' && bodiesRef.current[jointA.id] && bodiesRef.current[jointB.id]) {
                x1 = bodiesRef.current[jointA.id].position.x;
                y1 = bodiesRef.current[jointA.id].position.y;
                x2 = bodiesRef.current[jointB.id].position.x;
                y2 = bodiesRef.current[jointB.id].position.y;
            }

            const stress = gameState.stress[beam.id] || 0;
            const material = MATERIALS[beam.material];
            const stressRatio = Math.min(stress / material.strength, 1);
            const [h, s] = material.stressColor;
            const l = 50 - (stressRatio * 25);
            
            ctx.strokeStyle = `hsl(${h}, ${s}%, ${l}%)`;
            ctx.lineWidth = BEAM_WIDTH;
            ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        });

        // Joints
        Object.values(gameState.joints).forEach(joint => {
            let x = joint.x, y = joint.y;
            if (gameState.mode === 'simulate' && bodiesRef.current[joint.id]) {
                x = bodiesRef.current[joint.id].position.x;
                y = bodiesRef.current[joint.id].position.y;
            }
            ctx.fillStyle = joint.static ? '#444' : '#666';
            if (selectedJoint === joint.id) ctx.fillStyle = '#f0a';
            ctx.beginPath(); ctx.arc(x, y, JOINT_RADIUS, 0, 2 * Math.PI); ctx.fill();
        });
    }, [canvasSize, gameState, selectedJoint]);

    // Draw Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        const renderLoop = () => {
            draw(ctx);
            animationFrameId = window.requestAnimationFrame(renderLoop);
        };
        renderLoop();
        return () => window.cancelAnimationFrame(animationFrameId);
    }, [draw, gameState.mode]);

    // Physics Simulation
    useEffect(() => {
        if (!Matter || gameState.mode !== 'simulate' || gameState.status !== 'testing') return;

        const { Engine, Runner, World, Bodies, Constraint, Composite, Events } = Matter;
        const engine = Engine.create({ gravity: { y: 1 } });
        engineRef.current = engine;
        const world = engine.world;
        const level = gameState.level;

        const bodyMap = {};
        Object.values(gameState.joints).forEach(j => {
            bodyMap[j.id] = Bodies.circle(j.x, j.y, JOINT_RADIUS, { 
                isStatic: !!j.static, friction: 0.9, restitution: 0.1, density: 0.01 
            });
        });
        bodiesRef.current = bodyMap;

        const constraints = Object.values(gameState.beams).map(beam => {
            const bodyA = bodyMap[beam.jointAId];
            const bodyB = bodyMap[beam.jointBId];
            const constraint = Constraint.create({
                bodyA, bodyB, stiffness: 0.1,
                length: Math.hypot(bodyA.position.x - bodyB.position.x, bodyA.position.y - bodyB.position.y)
            });
            constraint.label = beam.id; 
            constraint.strength = MATERIALS[beam.material].strength;
            return constraint;
        });

        // Vehicle
        const carX = level.start.x - VEHICLE_WIDTH - 20;
        const carY = level.start.y - WHEEL_RADIUS - (VEHICLE_HEIGHT / 2);
        const carGroup = Matter.Body.nextGroup(true);
        const carBody = Bodies.rectangle(carX, carY, VEHICLE_WIDTH, VEHICLE_HEIGHT, { collisionFilter: { group: carGroup }, density: 0.01 });
        const wheelA = Bodies.circle(carX - 20, carY + 15, WHEEL_RADIUS, { collisionFilter: { group: carGroup }, friction: 0.9 });
        const wheelB = Bodies.circle(carX + 20, carY + 15, WHEEL_RADIUS, { collisionFilter: { group: carGroup }, friction: 0.9 });
        const axelA = Constraint.create({ bodyB: carBody, pointB: { x: -20, y: 15 }, bodyA: wheelA, stiffness: 1, length: 0 });
        const axelB = Constraint.create({ bodyB: carBody, pointB: { x: 20, y: 15 }, bodyA: wheelB, stiffness: 1, length: 0 });
        const carComposite = Composite.create({ label: 'car' });
        Composite.add(carComposite, [carBody, wheelA, wheelB, axelA, axelB]);

        World.add(world, [
            ...Object.values(bodyMap), ...constraints, carComposite,
            Bodies.rectangle(level.start.x / 2, level.start.y + 100, level.start.x, 200, { isStatic: true }),
            Bodies.rectangle(level.end.x + (canvasSize.width - level.end.x) / 2, level.end.y + 100, (canvasSize.width - level.end.x), 200, { isStatic: true }),
        ]);

        const runner = Runner.create();
        runnerRef.current = runner;

        Events.on(runner, 'afterUpdate', () => {
            Matter.Body.applyForce(wheelA, wheelA.position, { x: 0.005, y: 0 });
            Matter.Body.applyForce(wheelB, wheelB.position, { x: 0.005, y: 0 });

            const newStress = {};
            const brokenBeams = [];
            world.constraints.forEach(c => {
                if (c.label && c.label.startsWith('b')) {
                    const force = Math.hypot(c.bodyB.force.x - c.bodyA.force.x, c.bodyB.force.y - c.bodyA.force.y);
                    newStress[c.label] = force;
                    if (force > c.strength) brokenBeams.push(c);
                }
            });
            
            brokenBeams.forEach(c => {
                dispatch({ type: 'SNAP_BEAM', payload: { id: c.label } });
                World.remove(world, c);
            });
            dispatch({ type: 'UPDATE_STRESS', payload: newStress });

            if (carBody.position.y > canvasSize.height + 100) dispatch({ type: 'SET_STATUS', payload: 'failure' });
            if (carBody.position.x > level.end.x) dispatch({ type: 'SET_STATUS', payload: 'success' });
        });

        Runner.run(runner, engine);

        return () => {
            Runner.stop(runner);
            Engine.clear(engine);
            runnerRef.current = null;
            engineRef.current = null;
            bodiesRef.current = {};
        };
    }, [gameState.mode, gameState.status, Matter, canvasSize, gameState.level, gameState.joints, gameState.beams]);

    const handleCanvasClick = (e) => {
        if (gameState.mode !== 'build') return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = Math.round((e.clientX - rect.left) / GRID_SIZE) * GRID_SIZE;
        const y = Math.round((e.clientY - rect.top) / GRID_SIZE) * GRID_SIZE;
        const clickedJoint = Object.values(gameState.joints).find(j => Math.hypot(j.x - x, j.y - y) < JOINT_RADIUS);

        if (tool === 'joint' && !clickedJoint) {
            dispatch({ type: 'ADD_JOINT', payload: { id: `j-${Date.now()}`, x, y } });
        } else if (tool === 'beam') {
            if (clickedJoint) {
                if (!selectedJoint) setSelectedJoint(clickedJoint.id);
                else if (selectedJoint !== clickedJoint.id) {
                    dispatch({ type: 'ADD_BEAM', payload: { id: `b-${Date.now()}`, jointAId: selectedJoint, jointBId: clickedJoint.id, material: 'wood' } });
                    setSelectedJoint(null);
                }
            } else setSelectedJoint(null);
        }
    };

    const handleTest = () => { dispatch({ type: 'SET_MODE', payload: 'simulate' }); dispatch({ type: 'SET_STATUS', payload: 'testing' }); };
    const handleReset = () => { dispatch({ type: 'RESET_LEVEL' }); dispatch({ type: 'SET_MODE', payload: 'build' }); dispatch({ type: 'SET_STATUS', payload: 'building' }); setSelectedJoint(null); bodiesRef.current = {}; };

    return (
        <div className="bg-gray-800 text-white font-sans w-full h-full flex flex-col items-center justify-center relative">
            <h1 className="text-3xl font-bold my-4 absolute top-4 z-10 pointer-events-none text-shadow">2D Physics Bridge Builder</h1>
            <div className="w-full max-w-6xl flex-grow flex flex-col bg-gray-900 rounded-lg shadow-xl overflow-hidden border border-gray-700 m-4">
                <div className="flex-grow relative w-full h-full">
                    <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} onClick={handleCanvasClick} className="absolute top-0 left-0 cursor-crosshair block" />
                    <StatusModal status={gameState.status} onReset={handleReset} />
                </div>
                <Controls 
                    budget={gameState.budget} 
                    currentTool={tool} 
                    onToolChange={(t) => { setTool(t); setSelectedJoint(null); }} 
                    onTest={handleTest} 
                    onReset={handleReset} 
                    gameMode={gameState.mode} 
                    hasBeams={Object.keys(gameState.beams).length > 0} 
                />
            </div>
        </div>
    );
}

// --- 6. APP COMPONENT ---
export default function App() {
  return (
    <div className="w-screen h-screen bg-gray-900 flex items-center justify-center overflow-hidden">
      <Game />
    </div>
  );
}