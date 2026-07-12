// api/analyze/nettoyage.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Méthode non autorisée' });
    }
  
    try {
      const { data, options } = req.body;
      // options : { handleMissing: 'ignore'|'delete'|'mark' }
  
      // ✅ Prompt intelligent avec détection de type et nettoyage adapté
      const prompt = `
        Tu es un moteur de nettoyage de données professionnel, comparable 
        à Power Query. Tu dois analyser un tableau de données brutes, 
        détecter automatiquement le type de contenu de CHAQUE colonne, 
        puis appliquer un nettoyage adapté à chaque type, pour produire 
        un résultat final propre, cohérent et prêt à l'emploi.
  
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
  
        - date : standardise au format JJ/MM/AAAA, peu importe le format 
          d'origine (YYYY-MM-DD, DD-MM-YY, texte "12 janvier 2026", etc.)
  
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
  
        b) EN-TÊTES DE COLONNES : nettoie aussi la ligne d'en-tête — 
           supprime les espaces superflus, standardise en "Premier Mot En 
           Majuscule" pour chaque en-tête (ex: "  nom_client  " → 
           "Nom Client").
  
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
  
      // Appel à l'API Scaleway (corrigé)
      const response = await fetch('https://api.scaleway.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SCALEWAY_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'glm-5.2',
          messages: [
            { role: 'system', content: 'Tu es un expert en nettoyage de données et en analyse de tableaux Excel.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' }
        })
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur API Scaleway: ${response.status} - ${errorText}`);
      }
  
      const result = await response.json();
      const aiContent = JSON.parse(result.choices[0].message.content);
  
      res.status(200).json(aiContent);
  
    } catch (error) {
      console.error('Erreur backend:', error);
      res.status(500).json({ error: error.message });
    }
  }