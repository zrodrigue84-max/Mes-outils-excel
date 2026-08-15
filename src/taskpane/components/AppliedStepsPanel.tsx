import React from 'react';
import {
  makeStyles,
  tokens,
  Body1,
  Caption1,
  Text,
  Badge,
} from '@fluentui/react-components';
import { HistoryRegular } from '@fluentui/react-icons';
import { AppliedStep } from '../types/routes';

const useStyles = makeStyles({
  root: {
    flexShrink: 0,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    minHeight: '100px',
    maxHeight: '200px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  headerTitle: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 14px',
    margin: 0,
    listStyle: 'none',
  },
  empty: {
    color: tokens.colorNeutralForeground3,
    fontStyle: 'italic',
    padding: '4px 0',
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    padding: '4px 0',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    ':last-child': {
      borderBottom: 'none',
    },
  },
  stepLabel: {
    fontSize: tokens.fontSizeBase200,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

interface AppliedStepsPanelProps {
  steps: AppliedStep[];
}

const AppliedStepsPanel: React.FC<AppliedStepsPanelProps> = ({ steps }) => {
  const styles = useStyles();

  return (
    <section className={styles.root} aria-label="Étapes appliquées">
      <div className={styles.header}>
        <HistoryRegular fontSize={16} aria-hidden />
        <Text className={styles.headerTitle}>Étapes appliquées</Text>
        <Badge appearance="tint" size="small" color="informative">
          {steps.length}
        </Badge>
      </div>

      <ul className={styles.list}>
        {steps.length === 0 ? (
          <li className={styles.empty}>
            <Caption1>Aucune étape appliquée pour l'instant.</Caption1>
          </li>
        ) : (
          steps.map((step) => (
            <li key={step.id} className={styles.stepItem}>
              <Body1 className={styles.stepLabel}>{step.label}</Body1>
              <Caption1>{step.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Caption1>
            </li>
          ))
        )}
      </ul>
    </section>
  );
};

export default AppliedStepsPanel;
