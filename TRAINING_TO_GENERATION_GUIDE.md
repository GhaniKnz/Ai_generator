# Guide: De l'Entraînement à la Génération d'Images

Ce guide explique comment entraîner un modèle personnalisé et l'utiliser pour générer des images.

## Vue d'ensemble du Workflow

```
1. Créer un Dataset → 2. Entraîner un Modèle → 3. Générer des Images
```

## Étape 1: Initialiser la Base de Données

Avant de commencer, exécutez le script de seed pour ajouter les modèles de base:

```bash
python seed_models.py
```

Cela ajoutera:
- Stable Diffusion 1.5 (ID: 1)
- Stable Diffusion XL (ID: 2)
- Stable Video Diffusion (ID: 3)

## Étape 2: Créer un Dataset

1. Accédez à `/datasets` dans l'interface web
2. Cliquez sur "Create New Dataset"
3. Remplissez les informations:
   - **Name**: Nom de votre dataset (ex: "portraits-anime")
   - **Type**: "image" pour les images
   - **Description**: Description optionnelle
4. Cliquez sur "Create Dataset"

## Étape 3: Uploader des Images

1. Allez dans `/datasets` et sélectionnez votre dataset
2. Uploadez vos images d'entraînement
   - Minimum recommandé: 10-50 images
   - Format supporté: JPG, PNG, WEBP
3. Attendez que l'upload soit terminé
4. Cliquez sur "Refresh Count" pour mettre à jour le nombre d'images

## Étape 4: Créer un Job d'Entraînement

1. Accédez à `/training`
2. Cliquez sur "Nouvelle Tâche d'Entraînement"
3. Configurez l'entraînement:

### Paramètres de Base
- **Dataset**: Sélectionnez votre dataset créé à l'étape 2
- **Base Model**: Choisissez un modèle de base (SD 1.5 ou SDXL)
- **Training Type**: 
  - **LoRA** (recommandé) - Léger et rapide
  - **DreamBooth** - Pour sujets spécifiques
  - **Full** - Entraînement complet (nécessite beaucoup de ressources)
- **Output Name**: Nom de votre modèle entraîné

### Configuration Avancée
- **Learning Rate**: 0.0001 (par défaut)
- **Batch Size**: 4 (augmentez si vous avez plus de VRAM)
- **Number of Epochs**: 10 (nombre de passes sur le dataset)
- **LoRA Rank**: 4-8 (pour LoRA uniquement)

4. Cliquez sur "Create Job"

## Étape 5: Démarrer l'Entraînement

1. Dans la liste des tâches, trouvez votre job (status: "pending")
2. Cliquez sur le bouton ▶️ (Play) pour démarrer
3. Surveillez la progression en temps réel:
   - Progression en pourcentage
   - Epoch actuel
   - Perte (loss) - devrait diminuer au fil du temps
4. L'entraînement peut prendre de quelques minutes à plusieurs heures

## Étape 6: Utiliser le Modèle Entraîné

Une fois l'entraînement terminé:

1. Le modèle est **automatiquement enregistré** dans la base de données
2. Accédez à `/text-to-image`
3. Dans le dropdown "Modèle", vous verrez:
   - Les modèles de base (SD 1.5, SDXL)
   - **Votre modèle entraîné** (nommé "Trained-XXXXXXXX")
4. Sélectionnez votre modèle entraîné
5. Entrez un prompt et générez des images!

## Architecture Technique

### Backend (FastAPI)

```
┌─────────────────────────────────────────────────────────────┐
│                      Training Flow                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. POST /api/training/                                     │
│     - Create training job in database                       │
│     - Link to dataset and base model                        │
│                                                             │
│  2. POST /api/training/{job_id}/start                       │
│     - Start background training task                        │
│     - Update job status: pending → running                  │
│                                                             │
│  3. Training Engine (ml_training.py)                        │
│     - Load dataset images                                   │
│     - Train LoRA/DreamBooth                                 │
│     - Update progress in real-time                          │
│     - Save checkpoints                                      │
│                                                             │
│  4. On Completion                                           │
│     - Save final model weights                              │
│     - Update job status: running → completed                │
│     - **CREATE NEW MODEL ENTRY IN DATABASE**                │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Generation Flow                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. GET /api/models/?category=image                         │
│     - Fetch all available models                            │
│     - Includes base models + trained models                 │
│                                                             │
│  2. POST /api/generate/text-to-image                        │
│     - Includes model parameter                              │
│     - Job queue processes with selected model               │
│                                                             │
│  3. Job Processing                                          │
│     - Use specified model for generation                    │
│     - Generate images                                       │
│     - Return results                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Base de Données (SQLite)

```sql
-- Models table stores all models (base + trained)
CREATE TABLE models (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    type VARCHAR(50),      -- 'base_model', 'lora', 'dreambooth'
    category VARCHAR(50),  -- 'image', 'video'
    path VARCHAR(500),     -- Path to model weights
    is_active BOOLEAN,
    created_at TIMESTAMP
);

-- Training jobs track training progress
CREATE TABLE training_jobs (
    id VARCHAR(36) PRIMARY KEY,
    dataset_id INTEGER,
    base_model_id INTEGER,
    type VARCHAR(50),
    status VARCHAR(20),     -- 'pending', 'running', 'completed', 'failed'
    progress FLOAT,
    output_path VARCHAR(500),
    created_at TIMESTAMP
);
```

## Dépannage

### Problème: Aucun modèle dans la dropdown

**Solution**: Exécutez `python seed_models.py` pour initialiser les modèles de base

### Problème: Aucun dataset disponible

**Solution**: Créez un dataset via `/datasets` avant de créer un job d'entraînement

### Problème: L'entraînement échoue

**Vérifications**:
1. Le dataset contient-il des images? (Vérifiez `num_items`)
2. Le chemin du dataset est-il correct?
3. Consultez les logs du job pour plus de détails

### Problème: Le modèle entraîné n'apparaît pas

**Solution**: 
1. Vérifiez que le job d'entraînement est en status "completed"
2. Rafraîchissez la page `/text-to-image`
3. Vérifiez la table `models` dans la base de données

## Exemples de Prompts

Une fois votre modèle entraîné, testez avec des prompts similaires à vos données d'entraînement:

```
Si entraîné sur des portraits anime:
- "anime girl with blue hair, smiling, detailed eyes, vibrant colors"
- "anime character portrait, studio lighting, high quality"

Si entraîné sur des paysages:
- "beautiful landscape, mountains, sunset, cinematic lighting"
- "forest scene, misty atmosphere, detailed foliage"
```

## Commandes Utiles

```bash
# Initialiser les modèles de base
python seed_models.py

# Démarrer le backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Démarrer le frontend
cd frontend && npm run dev

# Vérifier la base de données
sqlite3 ai_generator.db "SELECT * FROM models;"
sqlite3 ai_generator.db "SELECT * FROM training_jobs;"
```

## Prochaines Étapes

1. **Intégration PyTorch réelle**: Actuellement, l'entraînement est simulé. Pour un vrai entraînement:
   - Installez les dépendances ML: `torch`, `diffusers`, `peft`
   - Implémentez la vraie logique d'entraînement dans `ml_training.py`

2. **Génération avec modèles entraînés**: Actuellement, la génération crée des images placeholder. Pour utiliser vraiment les modèles:
   - Chargez le modèle depuis `model.path`
   - Utilisez Diffusers pour générer les images

3. **Optimisations**:
   - Support GPU avec CUDA
   - Gradient checkpointing pour réduire l'utilisation mémoire
   - Mixed precision training (FP16/BF16)

## Support

Pour toute question ou problème, consultez la documentation ou créez une issue sur GitHub.
