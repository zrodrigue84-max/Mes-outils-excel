import React from 'react';
import {
  makeStyles,
  tokens,
  Body1,
  Caption1,
  Badge,
  Card,
} from '@fluentui/react-components';

const useStyles = makeStyles({
  card: {
    maxWidth: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
    gap: '8px',
  },
  title: {
    margin: 0,
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase400,
  },
  description: {
    color: tokens.colorNeutralForeground2,
    lineHeight: '1.5',
  },
  comingSoon: {
    marginTop: '16px',
    padding: '20px',
    borderRadius: tokens.borderRadiusMedium,
    border: `1px dashed ${tokens.colorNeutralStroke2}`,
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
  },
});

interface BlockShellProps {
  title: string;
  description: string;
  phaseLabel: string;
  children?: React.ReactNode;
}

export const BlockShell: React.FC<BlockShellProps> = ({
  title,
  description,
  phaseLabel,
  children,
}) => {
  const styles = useStyles();

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <Body1 className={styles.title}>{title}</Body1>
        <Badge appearance="outline" size="small">
          {phaseLabel}
        </Badge>
      </div>
      <Caption1 className={styles.description}>{description}</Caption1>
      {children ?? (
        <div className={styles.comingSoon}>
          <Body1>Contenu à venir</Body1>
          <Caption1>Ce bloc sera développé dans une prochaine phase.</Caption1>
        </div>
      )}
    </Card>
  );
};
