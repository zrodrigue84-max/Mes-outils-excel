import React from 'react';
import {
  makeStyles,
  tokens,
  Title3,
  Caption1,
} from '@fluentui/react-components';
import { SparkleRegular } from '@fluentui/react-icons';
import { getRouteLabel, AppRoute } from '../types/routes';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    flexShrink: 0,
  },
  icon: {
    color: tokens.colorBrandForeground1,
    fontSize: '20px',
  },
  title: {
    margin: 0,
    lineHeight: '1.2',
    fontSize: tokens.fontSizeBase400,
  },
  subtitle: {
    color: tokens.colorNeutralForeground3,
  },
});

interface AppHeaderProps {
  route: AppRoute;
}

const AppHeader: React.FC<AppHeaderProps> = ({ route }) => {
  const styles = useStyles();
  const label = getRouteLabel(route);

  return (
    <header className={styles.root}>
      <SparkleRegular className={styles.icon} aria-hidden />
      <div>
        <Title3 className={styles.title}>{label}</Title3>
        <Caption1 className={styles.subtitle}>Smart Cleaner AI</Caption1>
      </div>
    </header>
  );
};

export default AppHeader;
