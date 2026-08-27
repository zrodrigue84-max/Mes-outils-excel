// api/analyze/nettoyage.js

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const OPENROUTER_MODEL = 'openai/gpt-4o-mini';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { data, options } = req.body;
    // options : { handleMissing: 'ignore'|'delete'|'mark' }

    const prompt = `
      Tu es un moteur de nettoyage de données professionnel, comparable 
      à Power Query. Tu dois analyser un tableau de données brutes, 
      détecter automatiquement le type de contenu de CHAQUE colonne, 
      puis appliquer un nettoyage adapté à chaque type, pour produire 
      un résultat final propre, cohérent et prêt à l'emploi.

      RAPPEL CRITIQUE : tu DOIS impérativement traiter TOUTES les 
      instructions ci-dessous, sans en sauter aucune, même si les données 
      semblent déjà correctes à première vue. En particulier : 
      (1) la suppression des doublons est OBLIGATOIRE et doit être 
      vérifiée ligne par ligne avant de répondre, 
      (2) la mise en forme de la casse des noms propres est OBLIGATOIRE 
      pour toute colonne de type texte_nom, 
      (3) le nettoyage des en-têtes de colonnes est OBLIGATOIRE, 
      (4) la standardisation des dates au format JJ/MM/AAAA est 
      OBLIGATOIRE pour toute colonne de type date. 
      Si tu ne fais pas ces actions, ta réponse sera considérée comme 
      incorrecte.

      ÉTAPE 1 — DÉTECTION DU TYPE DE CHAQUE COLONNE :
      Pour chaque colonne, détermine son type dominant parmi : 
      "texte_nom" (noms de personnes/entreprises/villes), "email", 
      "telephone", "date", "montant" (valeurs monétaires), 
      "pourcentage", "nombre" (numérique générique), "booleen" 
      (oui/non, vrai/faux, yes/no, 1/0 utilisés comme statut), "texte_libre".

      ÉTAPE 2 — NETTOYAGE ADAPTÉ SELON LE TYPE DÉTECTÉ :

      - texte_nom : format "Nom Propre" (1ère lettre de chaque mot en 
        majuscule, reste en minuscule). "JEAN dupont" → "Jean Dupont"

      - email : minuscules, suppression des espaces superflus, 
        validation basique du format (présence d'un @ et d'un domaine)

      - telephone : format français "XX XX XX XX XX" si 10 chiffres 
        détectés, sinon laisse tel quel

      - date (OBLIGATOIRE) : standardise TOUJOURS au format texte 
        JJ/MM/AAAA, peu importe le format d'origine (YYYY-MM-DD, DD-MM-YY, 
        texte "12 janvier 2026", numéro de série Excel, etc.). Ne jamais 
        laisser une date dans un format différent de JJ/MM/AAAA dans 
        cleanedData.

      - montant : format numérique cohérent avec 2 décimales, séparateur 
        décimal "," et sans symbole monétaire dans la donnée elle-même 
        (le symbole sera géré au niveau du format de cellule Excel, pas 
        dans la valeur)

      - pourcentage : format numérique cohérent (valeur décimale, ex: 
        0.15 pour 15%), sans le symbole % dans la donnée elle-même

      - nombre : uniformise séparateurs décimaux/milliers de façon 
        cohérente sur toute la colonne

      - booleen : uniformise sur "Oui"/"Non" quel que soit le format 
        d'origine (true/false, 1/0, yes/no, vrai/faux...)

      - texte_libre : retire uniquement les espaces superflus en début/
        fin et les espaces multiples consécutifs, sans autre 
        transformation

      RÈGLES GÉNÉRALES SUPPLÉMENTAIRES (toujours appliquées, peu importe 
      le type) :

      a) DOUBLONS : identifie et supprime les lignes strictement 
         identiques après nettoyage (comparaison insensible à la casse 
         et aux espaces superflus).

      b) EN-TÊTES DE COLONNES (OBLIGATOIRE, ne jamais laisser tel quel) : 
         nettoie la ligne d'en-tête de CHAQUE colonne, sans exception. 
         Remplace les underscores et tirets par des espaces, mets en forme 
         'Première Lettre En Majuscule' pour chaque mot. 
         Exemples obligatoires à respecter : 
         'id_client' → 'Id Client', 
         'date_inscription' → 'Date Inscription', 
         'chiffre_affaire' → 'Chiffre Affaire', 
         'nom_client' → 'Nom Client'. 
         Si une colonne n'a pas de nom clair ou semble être une colonne 
         vide/parasite issue d'une erreur de format (ex: 'Column1', 
         'Unnamed: 0'), supprime-la entièrement du résultat final plutôt 
         que de la garder telle quelle.

      c) VALEURS ABERRANTES : pour les colonnes de type "montant", 
         "nombre" ou "pourcentage", détecte les valeurs statistiquement 
         très éloignées des autres valeurs de la même colonne (au-delà 
         de 3 écarts-types, ou valeurs clairement incohérentes comme un 
         âge de 250 ans) et signale-les dans le tableau "outliers" sans 
         les modifier automatiquement.

      d) VALEURS MANQUANTES : selon le paramètre 
         "${options.handleMissing}" :
         - "ignore" : laisse les cellules vides telles quelles
         - "delete" : supprime entièrement la ligne concernée
         - "mark" : remplace la cellule vide par "Manquant"

      Voici les données brutes (première ligne = en-têtes) :
      ${JSON.stringify(data)}

      Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
      {
        "cleanedData": [ [...] ],
        "columnTypes": ["texte_nom", "email", "date", "montant", ...],
        "summary": {
          "duplicatesRemoved": 0,
          "namesFormatted": 0,
          "datesFixed": 0,
          "phonesFixed": 0,
          "emailsFixed": 0,
          "amountsFormatted": 0,
          "percentagesFormatted": 0,
          "booleansFormatted": 0,
          "headersRenamed": 0,
          "emptyCellsHandled": 0,
          "outliersDetected": 0
        },
        "outliers": [ { "row": 0, "col": 0, "value": "...", "reason": "..." } ]
      }

      IMPORTANT : "columnTypes" doit contenir exactement un type par 
      colonne, dans le même ordre que les colonnes du tableau, en te 
      basant sur le type dominant détecté à l'étape 1.
    `;

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: 'Tu es un expert en nettoyage de données et en analyse de tableaux Excel.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API OpenRouter: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    let aiContent = JSON.parse(result.choices[0].message.content);

    if (!aiContent.columnTypes || aiContent.columnTypes.length !== data[0].length) {
      console.warn('L\'IA n\'a pas renvoyé columnTypes correctement, génération d\'un fallback.');
      aiContent.columnTypes = data[0].map(() => 'texte_libre');
    }

    res.status(200).json(aiContent);

  } catch (error) {
    console.error('Erreur backend:', error);
    res.status(500).json({ error: error.message });
  }
}
