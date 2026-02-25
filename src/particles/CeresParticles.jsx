import React from 'react';
import { MagneticParticles } from './MagneticParticles';

export function CeresParticles(props) {
    return (
        <MagneticParticles
            {...props}
            particleCount={800}
            planetRadius={2.0}
            rmaxRange={[5.0, 10.0]}
            baseSpeed={0.2}
            pointSize={5.0}
            cycleSpeed={0.7}
            arcBands={8}
            shellBands={3}
            tilt={[0.1, 0, 0.05]}
        />
    );
}
