// api/analyze/nettoyage.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Méthode non autorisée' });
    }
    try {
      const { data, options } = req.body;
  
      const prompt = `
        Tu es un assistant expert en nettoyage de données Excel.
        Voici des données brutes (format tableau) :
        ${JSON.stringify(data)}
        Voici les traitements demandés par l'utilisateur :
        - Supprimer les doublons : ${options.removeDuplicates ? 'Oui' : 'Non'}
        - Corriger les formats (dates, nombres) : ${options.fixFormats ? 'Oui' : 'Non'}
        - Traiter les valeurs manquantes : ${options.handleMissing || 'Non'}
        Réponds UNIQUEMENT en JSON valide avec la structure suivante :
        {
          "cleanedData": [ [...] ],
          "summary": {
            "duplicatesRemoved": 0,
            "datesFixed": 0,
            "emptyCellsHandled": 0,
            "outliersDetected": 0
          },
          "outliers": [ { "row": 0, "col": 0, "value": "..." } ]
        }
      `;
  
      const response = await fetch('https://api.scaleway.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SCALEWAY_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'glm-5.2',
          messages: [
            { role: 'system', content: 'Tu es un expert en data cleaning.' },
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
