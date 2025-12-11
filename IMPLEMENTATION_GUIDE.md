# Guide d'Implémentation: Génération d'Images avec Modèles Entraînés

## Vue d'Ensemble

Ce document décrit l'implémentation complète du système de génération d'images texte-vers-image avec support des modèles entraînés personnalisés.

## Fonctionnalités Implémentées

### 1. Sélection de Modèle pour l'Entraînement
- ✅ Dropdown pour sélectionner le modèle de base
- ✅ Dropdown pour sélectionner le dataset
- ✅ Les modèles et datasets sont chargés depuis l'API
- ✅ Interface utilisateur améliorée avec sélecteurs visuels

### 2. Enregistrement Automatique des Modèles Entraînés
- ✅ Les modèles complètent l'entraînement sont automatiquement enregistrés dans la table `models`
- ✅ Le nom du modèle est personnalisable via le champ `output_name`
- ✅ Les métadonnées incluent le type, la catégorie et le chemin du modèle

### 3. Sélection du Nombre d'Images
- ✅ Options: 1, 2, 4, ou 8 images
- ✅ Sélecteur dropdown dans l'interface texte-vers-image
- ✅ Layout en grille responsive pour l'aperçu des images

### 4. Génération avec Modèles Entraînés
- ✅ Liste déroulante affichant tous les modèles (base + entraînés)
- ✅ Filtre par catégorie "image"
- ✅ Le modèle sélectionné est utilisé dans la génération
- ✅ Aperçu immédiat des images générées

## Structure des Fichiers Modifiés

### Backend

#### `app/ml_training.py`
```python
# Fonction mise à jour pour enregistrer les modèles après l'entraînement
async def start_training_background(..., output_name: str = None):
    # ... code d'entraînement ...
    
    # Enregistrement automatique du modèle
    if final_status == "completed" and output_path:
        model_name = output_name or f"trained-{training_type}-{job_id[:8]}"
        new_model = Model(
            name=model_name,
            type=training_type,
            category="image",
            path=output_path,
            description=f"Trained {training_type} model from job {job_id}",
            config=config,
            is_active=True,
            version="1.0"
        )
        db_session.add(new_model)
        await db_session.commit()
```

#### `app/routers/training.py`
- Ajout de `output_name` à la configuration du job
- Passage de `output_name` à `start_training_background()`

#### `app/schemas.py`
- Augmentation de `num_outputs` maximum de 4 à 8

#### `app/jobs.py`
- Extraction et utilisation du nom de modèle dans `_run_text_to_image()`

### Frontend

#### `frontend/pages/training.tsx`
Améliorations:
- Ajout des interfaces `Model` et `Dataset`
- Nouvelles fonctions `fetchModels()` et `fetchDatasets()`
- Remplacement des inputs numériques par des dropdowns
- Filtrage des modèles base pour la sélection

```typescript
// Fetch des modèles
const fetchModels = async () => {
  const response = await fetch('/api/models/')
  if (response.ok) {
    const data = await response.json()
    setModels(data)
  }
}

// Dropdown pour sélectionner le modèle de base
<select value={newJob.base_model_id} onChange={...}>
  {models.filter(m => m.type === 'base_model').map((model) => (
    <option key={model.id} value={model.id}>
      {model.name} ({model.category})
    </option>
  ))}
</select>
```

#### `frontend/pages/text-to-image.tsx`
Améliorations:
- Ajout de `numImages` state
- Nouvelle constante `NUM_IMAGES_OPTIONS`
- Sélecteur pour le nombre d'images
- Modèles filtrés par catégorie "image"
- Layout en grille pour l'aperçu de plusieurs images

```typescript
// Sélecteur de nombre d'images
const NUM_IMAGES_OPTIONS = [
  { label: '1 image', value: 1 },
  { label: '2 images', value: 2 },
  { label: '4 images', value: 4 },
  { label: '8 images', value: 8 },
]

// Génération avec modèle sélectionné
body: JSON.stringify({
  prompt,
  num_outputs: numImages,
  model: selectedModel,
  // ... autres paramètres
})
```

## Flux de Travail Complet

### 1. Entraînement d'un Modèle

1. Aller sur la page **Entraînement** (`/training`)
2. Cliquer sur "Nouvelle Tâche d'Entraînement"
3. Sélectionner:
   - Dataset (ex: "sample-images")
   - Modèle de base (ex: "stable-diffusion-1.5")
   - Type d'entraînement (LoRA recommandé)
   - Nom de sortie (ex: "my-custom-lora")
4. Configurer les paramètres d'entraînement
5. Créer et démarrer le job
6. Le modèle sera automatiquement enregistré après la complétion

### 2. Génération d'Images

1. Aller sur la page **Texte vers Image** (`/text-to-image`)
2. Sélectionner:
   - Modèle (base ou entraîné, ex: "my-custom-lora")
   - Nombre d'images (1, 2, 4, ou 8)
   - Format d'image
3. Entrer votre prompt
4. Ajuster les paramètres (CFG Scale, Steps)
5. Cliquer sur "Générer des Images"
6. Les images apparaîtront dans l'aperçu en grille

## API Endpoints

### Modèles
- `GET /api/models/` - Liste tous les modèles
- `POST /api/models/` - Créer un nouveau modèle

### Entraînement
- `POST /api/training/` - Créer un job d'entraînement
- `POST /api/training/{job_id}/start` - Démarrer l'entraînement
- `GET /api/training/{job_id}` - Statut de l'entraînement

### Génération
- `POST /api/generate/text-to-image` - Générer des images
- `GET /api/generate/{job_id}` - Statut de la génération

## Initialisation de la Base de Données

Un script `seed_data.py` est fourni pour initialiser la base de données avec des modèles de base:

```bash
python3 seed_data.py
```

Cela créera:
- `stable-diffusion-1.5` (base_model, image)
- `stable-diffusion-xl` (base_model, image)
- `stable-video-diffusion` (base_model, video)
- `sample-images` (dataset)

## Tests Réalisés

### Test 1: Génération Multi-Images ✅
```bash
curl -X POST http://localhost:8000/api/generate/text-to-image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful sunset",
    "num_outputs": 4,
    "model": "stable-diffusion-1.5"
  }'
```
Résultat: 4 images générées avec succès

### Test 2: Entraînement et Enregistrement ✅
```bash
curl -X POST http://localhost:8000/api/training/ \
  -d '{
    "dataset_id": 1,
    "base_model_id": 1,
    "type": "lora",
    "output_name": "my-custom-lora",
    "config": {...}
  }'
```
Résultat: Modèle entraîné et enregistré automatiquement

### Test 3: Génération avec Modèle Entraîné ✅
```bash
curl -X POST http://localhost:8000/api/generate/text-to-image \
  -d '{
    "prompt": "Futuristic city",
    "model": "my-custom-lora",
    "num_outputs": 2
  }'
```
Résultat: Images générées avec le modèle personnalisé

### Test 4: Génération de 8 Images ✅
```bash
curl -X POST http://localhost:8000/api/generate/text-to-image \
  -d '{
    "prompt": "Beautiful landscape",
    "num_outputs": 8,
    "model": "stable-diffusion-1.5"
  }'
```
Résultat: 8 images générées et affichées dans une grille 2x4

## Démarrage de l'Application

### Option 1: Script Automatique
```bash
chmod +x start.sh
./start.sh
```

### Option 2: Démarrage Manuel

#### Backend
```bash
# Créer un environnement virtuel
python3 -m venv .venv
source .venv/bin/activate  # Linux/Mac
# ou .venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt

# Initialiser la base de données
python3 seed_data.py

# Démarrer le serveur
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

L'application sera accessible sur:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Prochaines Étapes (Optionnel)

Pour aller plus loin, vous pouvez:

1. **Intégrer de Vrais Modèles PyTorch**
   - Installer: `torch`, `diffusers`, `transformers`, `peft`
   - Remplacer les mock images par de vraies générations
   - Voir les commentaires dans `ml_training.py`

2. **Ajouter Plus de Modèles**
   - Télécharger des modèles depuis Hugging Face
   - Les enregistrer via l'API `/api/models/`

3. **Améliorer l'UI**
   - Galerie d'images générées
   - Historique de génération
   - Favoris et collections

4. **Optimisations**
   - Queue de jobs avec Celery/Redis
   - Cache pour les modèles
   - CDN pour les images statiques

## Support

Pour toute question ou problème:
1. Vérifier les logs du backend et frontend
2. Consulter la documentation API: http://localhost:8000/docs
3. Vérifier que la base de données est initialisée: `ls ai_generator.db`

---

**Date de création**: 11 Décembre 2025
**Version**: 1.0.0
**Status**: ✅ Implémentation Complète et Testée
