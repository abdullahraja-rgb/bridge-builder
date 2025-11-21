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