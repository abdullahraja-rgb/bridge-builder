import { useState, useEffect } from 'react';

const MATTER_SCRIPT_URL = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';
const SCRIPT_ID = 'matter-js-script';

function useMatterJS(onReady) {
    useEffect(() => {
        if (document.getElementById(SCRIPT_ID)) {
            if (window.Matter) {
                onReady(window.Matter);
            } else {
                const script = document.getElementById(SCRIPT_ID);
                script.addEventListener('load', () => {
                    onReady(window.Matter);
                });
            }
            return;
        }

        const script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.src = MATTER_SCRIPT_URL;
        script.async = true;
        
        script.onload = () => {
            if (window.Matter) {
                onReady(window.Matter);
            } else {
                console.error('Matter.js script loaded but window.Matter is not available.');
            }
        };

        script.onerror = () => {
            console.error('Failed to load the Matter.js script.');
        };

        document.head.appendChild(script);

        return () => {
            const existingScript = document.getElementById(SCRIPT_ID);
            if (existingScript) {
                // We could remove it, but it's often fine to leave it.
            }
        };
    }, [onReady]);
}

export default useMatterJS;