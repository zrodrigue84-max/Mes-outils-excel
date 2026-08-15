import React from 'react';
import { BlockShell } from '../BlockShell';
import { getRouteLabel } from '../../types/routes';

interface Props {
  action: string;
}

const DiagnosticBlock: React.FC<Props> = ({ action }) => (
  <BlockShell
    title={getRouteLabel({ view: 'diagnostic', action: action || 'scan' })}
    description="Scan clinique instantané : sélectionnez une zone dans Excel puis lancez l'analyse. Contenu à venir en Phase 2."
    phaseLabel="Phase 2"
  />
);

export default DiagnosticBlock;
