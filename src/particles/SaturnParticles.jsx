import React from 'react';
import { MagneticParticles } from './MagneticParticles';

export function SaturnParticles(props) {
    // Ensure we pass 0 tilt because the parent group in App.jsx applies the tilt
    const defaultTilt = [0, 0, 0];

    return (
        <MagneticParticles
            {...props}
            particleCount={2000}
            planetRadius={10.0}
            rmaxRange={[20.0, 45.0]}
            baseSpeed={0.1}
            pointSize={8.0}
            cycleSpeed={0.3}
            arcBands={16}
            shellBands={5}
            tilt={props.tilt || defaultTilt}
        />
    );
}
