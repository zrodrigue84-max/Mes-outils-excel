import React from 'react';
import { BlockShell } from '../BlockShell';
import { getRouteLabel } from '../../types/routes';

interface Props {
  action: string;
}

const ImporterBlock: React.FC<Props> = ({ action }) => (
  <BlockShell
    title={getRouteLabel({ view: 'importer', action })}
    description="Extraction immédiate des en-têtes pour l'analyse IA. Contenu à venir en Phase 4."
    phaseLabel="Phase 4"
  />
);

export default ImporterBlock;
