import React from 'react';
import { MagneticParticles } from './MagneticParticles';

export function EnceladusParticles(props) {
    return (
        <MagneticParticles
            {...props}
            particleCount={1200}
            planetRadius={1.5}
            rmaxRange={[3.5, 7.0]}
            baseSpeed={0.3}
            pointSize={4.0}
            cycleSpeed={1.0}
            arcBands={8}
            shellBands={3}
            tilt={[0, 0, 0]}
        />
    );
}
