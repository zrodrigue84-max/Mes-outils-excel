import React from 'react';
import { BlockShell } from '../BlockShell';
import { getRouteLabel } from '../../types/routes';

interface Props {
  action: string;
}

const CombinerBlock: React.FC<Props> = ({ action }) => (
  <BlockShell
    title={getRouteLabel({ view: 'combiner', action })}
    description="Jointures manuelles ou empilement de tables. Contenu à venir en Phases 4 et 5."
    phaseLabel="Phases 4 et 5"
  />
);

export default CombinerBlock;
