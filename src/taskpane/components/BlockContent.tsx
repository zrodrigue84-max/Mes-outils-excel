import React from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import { AppRoute } from '../types/routes';
import ImporterBlock from './blocks/ImporterBlock';
import DiagnosticBlock from './blocks/DiagnosticBlock';
import TransformationBlock from './blocks/TransformationBlock';
import CombinerBlock from './blocks/CombinerBlock';
import AutomationBlock from './blocks/AutomationBlock';
import HomeBlock from './blocks/HomeBlock';

const useStyles = makeStyles({
  root: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 18px',
    backgroundColor: tokens.colorNeutralBackground2,
    minHeight: 0,
  },
});

interface BlockContentProps {
  route: AppRoute;
}

const BlockContent: React.FC<BlockContentProps> = ({ route }) => {
  const styles = useStyles();

  let content: React.ReactNode;
  switch (route.view) {
    case 'home':
      content = <HomeBlock />;
      break;
    case 'importer':
      content = <ImporterBlock action={route.action} />;
      break;
    case 'diagnostic':
      content = <DiagnosticBlock action={route.action} />;
      break;
    case 'transformation':
      content = <TransformationBlock action={route.action} />;
      break;
    case 'combiner':
      content = <CombinerBlock action={route.action} />;
      break;
    case 'automation':
      content = <AutomationBlock action={route.action} />;
      break;
    default:
      content = <DiagnosticBlock action="scan" />;
  }

  return (
    <main className={styles.root} aria-label="Zone centrale dynamique">
      {content}
    </main>
  );
};

export default BlockContent;
