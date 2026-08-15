import React from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import AppHeader from './AppHeader';
import BlockContent from './BlockContent';
import AppliedStepsPanel from './AppliedStepsPanel';
import ChatBar from './ChatBar';
import { AppliedStep, AppRoute } from '../types/routes';

const useStyles = makeStyles({
  root: {
    display: 'grid',
    gridTemplateRows: 'auto 1fr 25% auto',
    height: '100vh',
    width: '100%',
    minWidth: '420px',
    maxWidth: '100%',
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground2,
    fontFamily: tokens.fontFamilyBase,
  },
  center: {
    minHeight: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  anchors: {
    display: 'contents',
  },
});

interface TaskPaneLayoutProps {
  route: AppRoute;
  appliedSteps: AppliedStep[];
  onChatSend?: (message: string) => void;
}

const TaskPaneLayout: React.FC<TaskPaneLayoutProps> = ({
  route,
  appliedSteps,
  onChatSend,
}) => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <AppHeader route={route} />

      <div className={styles.center}>
        <BlockContent route={route} />
      </div>

      <div className={styles.anchors}>
        <AppliedStepsPanel steps={appliedSteps} />
        <ChatBar onSend={onChatSend} />
      </div>
    </div>
  );
};

export default TaskPaneLayout;
