import React from 'react';
import { BlockShell } from '../BlockShell';
import { getRouteLabel } from '../../types/routes';

interface Props {
  action: string;
}

const TransformationBlock: React.FC<Props> = ({ action }) => (
  <BlockShell
    title={getRouteLabel({ view: 'transformation', action })}
    description="Outils avancés colonnes et lignes. Contenu à venir en Phases 3 et 7."
    phaseLabel="Phases 3 et 7"
  />
);

export default TransformationBlock;
