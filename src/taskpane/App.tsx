import React from 'react';
import {
  makeStyles,
  tokens,
  Title1,
  Body1,
  Badge,
  Card,
  CardHeader,
} from '@fluentui/react-components';
import { SparkleRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    padding: '16px',
    boxSizing: 'border-box',
    backgroundColor: tokens.colorNeutralBackground2,
    fontFamily: tokens.fontFamilyBase,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  icon: {
    color: tokens.colorBrandForeground1,
    fontSize: '28px',
  },
  card: {
    marginTop: '8px',
  },
  phaseList: {
    margin: '12px 0 0 0',
    paddingLeft: '20px',
    color: tokens.colorNeutralForeground2,
    lineHeight: '1.8',
  },
});

const App: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <SparkleRegular className={styles.icon} />
        <div>
          <Title1>Smart Cleaner AI</Title1>
          <Badge appearance="tint" color="brand" style={{ marginTop: '4px' }}>
            Phase 0 — Fondations
          </Badge>
        </div>
      </div>

      <Card className={styles.card}>
        <CardHeader
          header={<Body1><strong>Interface React + Fluent UI</strong></Body1>}
          description="Le volet latéral est prêt. Les fonctionnalités arrivent phase par phase."
        />
        <Body1 style={{ padding: '0 16px 16px' }}>
          Prochaines étapes :
          <ul className={styles.phaseList}>
            <li>Phase 1 — Squelette du volet (5 blocs + chat IA)</li>
            <li>Phase 2 — Diagnostic local sans IA</li>
            <li>Phase 3 — Correction des fautes de frappe</li>
          </ul>
        </Body1>
      </Card>
    </div>
  );
};

export default App;
