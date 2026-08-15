import React from 'react';
import { BlockShell } from '../BlockShell';
import { getRouteLabel } from '../../types/routes';

interface Props {
  action: string;
}

const AutomationBlock: React.FC<Props> = ({ action }) => (
  <BlockShell
    title={getRouteLabel({ view: 'automation', action })}
    description="Recettes JSON et automatisation sur dossier. Contenu à venir en Phase 6."
    phaseLabel="Phase 6"
  />
);

export default AutomationBlock;
