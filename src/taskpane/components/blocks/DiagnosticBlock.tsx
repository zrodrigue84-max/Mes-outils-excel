import React from 'react';
import {
  makeStyles,
  tokens,
  Button,
  Body1,
  Caption1,
  Spinner,
  MessageBar,
  MessageBarBody,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Divider,
} from '@fluentui/react-components';
import {
  SearchRegular,
  DeleteRegular,
  SettingsRegular,
  CalendarLtrRegular,
  ArrowSyncRegular,
} from '@fluentui/react-icons';
import { BlockShell } from '../BlockShell';
import { getRouteLabel } from '../../types/routes';
import type { ClinicalScanResult } from '../../services/clinicalScan';
import {
  scanCurrentRegion,
  deleteEmptyRowsInRegion,
  fillEmptyCellsWithZeroInRegion,
  propagateEmptyCellsInRegion,
  unifyDatesInRegion,
} from '../../services/excelRange';

const useStyles = makeStyles({
  content: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  zoneInfo: {
    padding: '10px 12px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground3,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
  },
  finding: {
    padding: '12px',
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  findingHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  findingTitle: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
  },
  findingDetail: {
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase200,
    lineHeight: '1.5',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  scanRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
});

interface Props {
  action: string;
  onStepApplied?: (label: string) => void;
}

const DiagnosticBlock: React.FC<Props> = ({ action, onStepApplied }) => {
  const styles = useStyles();
  const [scan, setScan] = React.useState<ClinicalScanResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [acting, setActing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [manageOpen, setManageOpen] = React.useState(false);

  const runScan = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await scanCurrentRegion();
      setScan(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de lire la zone Excel. Sélectionnez une cellule dans votre tableau.',
      );
      setScan(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (action === 'scan') runScan();
  }, [action, runScan]);

  const refreshAfterAction = async (stepLabel: string) => {
    onStepApplied?.(stepLabel);
    await runScan();
  };

  const handleDeleteEmptyRows = async () => {
    setActing(true);
    setError(null);
    try {
      const deleted = await deleteEmptyRowsInRegion();
      await refreshAfterAction(`${deleted} ligne(s) vide(s) supprimée(s)`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    } finally {
      setActing(false);
    }
  };

  const handleFillZero = async () => {
    setManageOpen(false);
    setActing(true);
    setError(null);
    try {
      await fillEmptyCellsWithZeroInRegion();
      await refreshAfterAction('Cellules vides remplies par 0');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du remplissage.');
    } finally {
      setActing(false);
    }
  };

  const handlePropagate = async () => {
    setManageOpen(false);
    setActing(true);
    setError(null);
    try {
      await propagateEmptyCellsInRegion();
      await refreshAfterAction('Cellules vides propagées (Fill Down)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la propagation.');
    } finally {
      setActing(false);
    }
  };

  const handleUnifyDates = async () => {
    if (!scan?.dateColumns.length) return;
    setActing(true);
    setError(null);
    try {
      await unifyDatesInRegion(scan.dateColumns);
      await refreshAfterAction('Dates unifiées au format JJ/MM/AAAA');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'unification des dates.');
    } finally {
      setActing(false);
    }
  };

  return (
    <>
      <BlockShell
        title={getRouteLabel({ view: 'diagnostic', action: action || 'scan' })}
        description="Scan clinique instantané : sélectionnez une zone dans Excel, puis analysez et corrigez localement (sans appel IA)."
        phaseLabel="Phase 2"
      >
        <div className={styles.content}>
          <div className={styles.scanRow}>
            <Button
              appearance="primary"
              icon={loading ? <Spinner size="tiny" /> : <SearchRegular />}
              onClick={runScan}
              disabled={loading || acting}
            >
              {loading ? 'Analyse en cours…' : 'Scanner la zone'}
            </Button>
            {scan && (
              <Caption1>
                {scan.rowCount} lignes × {scan.columnCount} colonnes
              </Caption1>
            )}
          </div>

          {error && (
            <MessageBar intent="error">
              <MessageBarBody>{error}</MessageBarBody>
            </MessageBar>
          )}

          {scan && (
            <>
              {'address' in scan && scan.address && (
                <div className={styles.zoneInfo}>
                  Zone détectée : <strong>{scan.address}</strong>
                  {' '}
                  ({scan.dataRowCount} lignes de données)
                </div>
              )}

              <div className={styles.finding}>
                <div className={styles.findingHeader}>
                  <Body1 className={styles.findingTitle}>Lignes vides</Body1>
                  <Badge appearance="filled" color={scan.emptyRowCount > 0 ? 'warning' : 'success'}>
                    {scan.emptyRowCount}
                  </Badge>
                </div>
                <Caption1 className={styles.findingDetail}>
                  {scan.emptyRowCount > 0
                    ? 'Lignes entièrement vides détectées dans la zone.'
                    : 'Aucune ligne vide détectée.'}
                </Caption1>
                {scan.emptyRowCount > 0 && (
                  <div className={styles.actions}>
                    <Button
                      appearance="secondary"
                      icon={<DeleteRegular />}
                      onClick={handleDeleteEmptyRows}
                      disabled={acting}
                    >
                      Supprimer
                    </Button>
                  </div>
                )}
              </div>

              <div className={styles.finding}>
                <div className={styles.findingHeader}>
                  <Body1 className={styles.findingTitle}>Cellules vides</Body1>
                  <Badge appearance="filled" color={scan.emptyCellCount > 0 ? 'warning' : 'success'}>
                    {scan.emptyCellCount}
                  </Badge>
                </div>
                <Caption1 className={styles.findingDetail}>
                  {scan.emptyCellCount > 0
                    ? 'Cellules vides ou blanches dans la zone (hors en-tête).'
                    : 'Aucune cellule vide détectée.'}
                </Caption1>
                {scan.emptyCellCount > 0 && (
                  <div className={styles.actions}>
                    <Button
                      appearance="secondary"
                      icon={<SettingsRegular />}
                      onClick={() => setManageOpen(true)}
                      disabled={acting}
                    >
                      Gérer
                    </Button>
                  </div>
                )}
              </div>

              <div className={styles.finding}>
                <div className={styles.findingHeader}>
                  <Body1 className={styles.findingTitle}>Formats de date</Body1>
                  <Badge
                    appearance="filled"
                    color={scan.hasMixedDateFormats ? 'warning' : scan.dateColumns.length > 0 ? 'informative' : 'success'}
                  >
                    {scan.dateColumns.length} colonne(s)
                  </Badge>
                </div>
                {scan.dateColumns.length === 0 ? (
                  <Caption1 className={styles.findingDetail}>
                    Aucune colonne de dates détectée.
                  </Caption1>
                ) : (
                  <>
                    {scan.dateColumns.map((col) => (
                      <Caption1 key={col.columnIndex} className={styles.findingDetail}>
                        <strong>{col.header}</strong>
                        {' — '}
                        {col.formats.map((f) => `${f.label} (${f.count})`).join(', ')}
                      </Caption1>
                    ))}
                    {scan.hasMixedDateFormats && (
                      <div className={styles.actions}>
                        <Button
                          appearance="secondary"
                          icon={<CalendarLtrRegular />}
                          onClick={handleUnifyDates}
                          disabled={acting}
                        >
                          Unifier en JJ/MM/AAAA
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>

              <Divider />
              <Button
                appearance="subtle"
                icon={<ArrowSyncRegular />}
                onClick={runScan}
                disabled={loading || acting}
              >
                Relancer le scan
              </Button>
            </>
          )}
        </div>
      </BlockShell>

      <Dialog open={manageOpen} onOpenChange={(_, data) => setManageOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Gérer les cellules vides</DialogTitle>
            <DialogContent>
              <Body1>Choisissez comment traiter les {scan?.emptyCellCount ?? 0} cellule(s) vide(s) :</Body1>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setManageOpen(false)}>
                Annuler
              </Button>
              <Button appearance="primary" onClick={handleFillZero}>
                Remplir par 0
              </Button>
              <Button appearance="primary" onClick={handlePropagate}>
                Propager (Fill Down)
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
};

export default DiagnosticBlock;
