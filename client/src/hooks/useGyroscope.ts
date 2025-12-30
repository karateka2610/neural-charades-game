import { useState, useEffect, useCallback } from 'react';

interface Orientation {
    alpha: number | null;
    beta: number | null;
    gamma: number | null;
}

type PermissionStatus = 'unknown' | 'granted' | 'denied' | 'not_supported';

export const useGyroscope = () => {
    const [orientation, setOrientation] = useState<Orientation>({ alpha: 0, beta: 0, gamma: 0 });
    const [permission, setPermission] = useState<PermissionStatus>('unknown');
    const [isEmulating, setIsEmulating] = useState(false);

    const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
        setOrientation({
            alpha: event.alpha,
            beta: event.beta,
            gamma: event.gamma,
        });
    }, []);

    const requestAccess = async () => {
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            try {
                const state = await (DeviceOrientationEvent as any).requestPermission();
                if (state === 'granted') {
                    setPermission('granted');
                    window.addEventListener('deviceorientation', handleOrientation);
                } else {
                    setPermission('denied');
                }
            } catch (e) {
                console.error(e);
                setPermission('denied');
            }
        } else {
            // Android or non-iOS browser
            setPermission('granted');
            window.addEventListener('deviceorientation', handleOrientation);
        }
    };

    // Keyboard Emulation for Desktop Debugging
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp') {
                // Simulate Tile BACK (Correct)
                // In landscape, this usually affects Gamma or Beta depending on hold.
                // Assuming standard Heads Up hold (Landscape, screen out):
                // We'll emulate the value expected by the game logic.
                // Let's toggle a "Simulated" state.
                setIsEmulating(true);
                setOrientation(prev => ({ ...prev, gamma: -80 })); // Arbitrary "Correct" threshold value
            } else if (e.key === 'ArrowDown') {
                // Simulate Tilt FORWARD (Pass)
                setIsEmulating(true);
                setOrientation(prev => ({ ...prev, gamma: 80 })); // Arbitrary "Pass" threshold value
            } else if (e.key === 'r') {
                // Reset
                setIsEmulating(false);
                setOrientation({ alpha: 0, beta: 90, gamma: 0 }); // Neutral
            }
        };

        const handleKeyUp = () => {
            if (isEmulating) {
                // Return to neutral quickly or stay? 
                // Usually game checks for "Hold" or "Threshold crossed".
                // Let's reset to neutral on key up to simulate "Tilt and come back"
                setOrientation({ alpha: 0, beta: 90, gamma: 0 });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [isEmulating]);

    return { orientation, permission, requestAccess };
};
