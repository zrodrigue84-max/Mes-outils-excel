/**
 * Données de test volontairement « sales » pour simuler un appel Excel.
 */
export const dirtyTestData = [
  ['nom_client', 'email', 'date_inscription', 'montant', 'ville'],
  ['JEAN dupont', '  JEAN@EXAMPLE.COM ', '2024-01-15', '1 234,50', 'paris'],
  ['jean dupont', 'jean@example.com', '15/01/2024', '1234.5', 'PARIS'],
  ['Marie MARTIN', 'marie@invalid', '12 janvier 2026', 'abc', 'lyon'],
  ['', '', '', '', ''],
  ['', 'pierre@test.fr', '', '500', ''],
  ['Sophie Bernard', 'sophie@test.fr', '2025-06-30', '99,9', 'Marseille'],
  ['Sophie Bernard', 'sophie@test.fr', '30/06/2025', '99.90', 'marseille'],
];

export const testOptions = {
  handleMissing: 'ignore',
};
