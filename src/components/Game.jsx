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
                    Joint ({JOINT_COST})
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