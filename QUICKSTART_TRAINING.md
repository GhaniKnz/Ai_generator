# Guide de Démarrage Rapide - Entraînement et Génération

## 🎯 Objectif

Ce guide vous montre comment entraîner un modèle personnalisé et l'utiliser pour générer des images.

## 🚀 Démarrage Rapide (5 minutes)

### 1. Initialisation de la Base de Données

```bash
# Installer les dépendances
pip install -r requirements.txt

# Initialiser les modèles de base
python seed_models.py
```

**Résultat:** 3 modèles de base ajoutés (SD 1.5, SDXL, SVD)

### 2. Créer un Dataset de Démonstration

```bash
# Créer un dataset de test avec métadonnées
python demo_workflow.py
```

**Résultat:** Dataset "Demo-Anime-Portraits" créé avec 25 items simulés

### 3. Démarrer les Serveurs

**Terminal 1 - Backend:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install  # Première fois seulement
npm run dev
```

### 4. Utiliser l'Interface Web

Ouvrez votre navigateur à: `http://localhost:3000`

## 📋 Workflow Complet

### Étape 1: Créer un Dataset (UI: /datasets)

1. Cliquez sur "Create New Dataset"
2. Remplissez:
   - **Name**: "My Custom Dataset"
   - **Type**: "image"
   - **Description**: Description de votre dataset
3. Uploadez vos images (minimum 10-50 recommandé)

**Alternative - Utiliser le Dataset de Démo:**
Le script `demo_workflow.py` a déjà créé un dataset de test que vous pouvez utiliser.

### Étape 2: Créer un Job d'Entraînement (UI: /training)

1. Cliquez sur "Nouvelle Tâche d'Entraînement"
2. Sélectionnez:
   - **Dataset**: Choisissez votre dataset (ex: Demo-Anime-Portraits)
   - **Base Model**: Stable Diffusion 1.5 ou SDXL
   - **Type**: LoRA (recommandé pour commencer)
   - **Output Name**: "my-first-lora"
3. Configurez (optionnel):
   - Learning Rate: 0.0001
   - Batch Size: 4
   - Epochs: 10
   - LoRA Rank: 4
4. Cliquez sur "Create Job"

### Étape 3: Démarrer l'Entraînement

1. Trouvez votre job dans la liste (status: "pending")
2. Cliquez sur le bouton ▶️ (Play)
3. Surveillez la progression:
   - Barre de progression
   - Epoch actuel
   - Perte (loss)
   - Image actuellement traitée

**Note:** L'entraînement actuel est simulé pour la démonstration. Pour un vrai entraînement PyTorch, voir la section "Intégration PyTorch" ci-dessous.

### Étape 4: Utiliser le Modèle Entraîné (UI: /text-to-image)

1. Allez sur `/text-to-image`
2. Dans le dropdown "Modèle", vous verrez:
   - 🔷 Stable Diffusion 1.5
   - 🔷 Stable Diffusion XL
   - ⭐ **Trained-XXXXXXXX** ← Votre nouveau modèle!
3. Sélectionnez votre modèle entraîné
4. Entrez un prompt (ex: "anime girl with blue hair, detailed eyes")
5. Cliquez sur "Générer des Images"

## 🔧 Scripts Utiles

### `seed_models.py` - Initialiser les Modèles de Base

```bash
python seed_models.py
```

Ajoute les modèles de base à la database:
- Stable Diffusion 1.5
- Stable Diffusion XL  
- Stable Video Diffusion

### `demo_workflow.py` - Démonstration Complète

```bash
python demo_workflow.py
```

Crée un dataset de démo et montre le workflow complet.

### `test_api.py` - Tester les APIs

```bash
python test_api.py
```

Vérifie que tous les endpoints API fonctionnent correctement.

## 🗄️ Structure de la Base de Données

### Table: `models`

Stocke tous les modèles (base + entraînés):

```sql
CREATE TABLE models (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100),           -- "Stable Diffusion 1.5", "Trained-abc123"
    type VARCHAR(50),             -- "base_model", "lora", "dreambooth"
    category VARCHAR(50),         -- "image", "video"
    path VARCHAR(500),            -- Chemin vers les poids du modèle
    is_active BOOLEAN,            -- Modèle actif ou non
    created_at TIMESTAMP
);
```

**Exemples:**
- ID 1: Stable Diffusion 1.5 (base_model, image)
- ID 2: Stable Diffusion XL (base_model, image)
- ID 4: Trained-abc123 (lora, image) ← Créé après entraînement

### Table: `datasets`

Stocke les datasets d'entraînement:

```sql
CREATE TABLE datasets (
    id INTEGER PRIMARY KEY,
    name VARCHAR(200),
    type VARCHAR(50),             -- "image", "video", "mixed"
    path VARCHAR(500),            -- Chemin vers les images
    num_items INTEGER,            -- Nombre d'images
    created_at TIMESTAMP
);
```

### Table: `training_jobs`

Suit la progression des entraînements:

```sql
CREATE TABLE training_jobs (
    id VARCHAR(36) PRIMARY KEY,
    dataset_id INTEGER,
    base_model_id INTEGER,
    type VARCHAR(50),             -- "lora", "dreambooth", "full"
    status VARCHAR(20),           -- "pending", "running", "completed"
    progress FLOAT,               -- 0.0 à 1.0
    output_path VARCHAR(500),     -- Chemin du modèle entraîné
    created_at TIMESTAMP
);
```

## 🔌 Endpoints API

### Modèles

```bash
# Lister tous les modèles
GET /api/models/

# Filtrer par catégorie
GET /api/models/?category=image

# Obtenir un modèle spécifique
GET /api/models/{model_id}
```

### Datasets

```bash
# Lister les datasets
GET /api/datasets/

# Créer un dataset
POST /api/datasets/
{
  "name": "My Dataset",
  "type": "image",
  "description": "Description"
}

# Rafraîchir le compte d'items
POST /api/datasets/{dataset_id}/refresh
```

### Entraînement

```bash
# Créer un job
POST /api/training/
{
  "dataset_id": 1,
  "base_model_id": 1,
  "type": "lora",
  "output_name": "my-lora",
  "config": {
    "learning_rate": 0.0001,
    "batch_size": 4,
    "num_epochs": 10,
    "lora_rank": 4
  }
}

# Démarrer l'entraînement
POST /api/training/{job_id}/start

# Surveiller la progression
GET /api/training/{job_id}/progress
```

### Génération

```bash
# Générer une image
POST /api/generate/text-to-image
{
  "prompt": "a beautiful sunset",
  "model": "Trained-abc123",  # ← Utilise le modèle entraîné!
  "num_outputs": 2,
  "width": 512,
  "height": 512
}

# Obtenir le status du job
GET /api/generate/{job_id}
```

## 🎨 Flow Technique

```
┌─────────────────────────────────────────────────────────┐
│                 TRAINING WORKFLOW                       │
└─────────────────────────────────────────────────────────┘

1. User creates dataset
   └─> Dataset saved in DB (id=1)
       └─> Images uploaded to uploads/datasets/1/

2. User creates training job
   └─> TrainingJob saved in DB (status="pending")
       └─> Links to dataset_id=1, base_model_id=1

3. User starts training
   └─> POST /api/training/{job_id}/start
       └─> Status: pending → running
           └─> ml_training.py trains model
               └─> Updates progress in real-time
                   └─> On completion:
                       ├─> Saves model weights
                       ├─> Status: running → completed
                       └─> **Creates new Model entry in DB** ✨

┌─────────────────────────────────────────────────────────┐
│               GENERATION WORKFLOW                       │
└─────────────────────────────────────────────────────────┘

1. User opens /text-to-image
   └─> Frontend: GET /api/models/?category=image
       └─> Returns all image models:
           ├─> Stable Diffusion 1.5 (base_model)
           ├─> Stable Diffusion XL (base_model)
           └─> Trained-abc123 (lora) ← From training! ✨

2. User selects trained model
   └─> Frontend updates selectedModel state

3. User clicks "Generate"
   └─> POST /api/generate/text-to-image
       └─> body includes: { ..., "model": "Trained-abc123" }
           └─> JobQueue processes with selected model
               └─> Returns generated images
```

## 🔮 Intégration PyTorch (Pour Production)

L'implémentation actuelle simule l'entraînement. Pour un vrai entraînement:

### 1. Installer les Dépendances ML

```bash
pip install torch torchvision diffusers transformers accelerate peft safetensors
```

### 2. Modifier `ml_training.py`

Remplacer la simulation dans `train_lora()` par:

```python
from diffusers import StableDiffusionPipeline
from peft import LoraConfig, get_peft_model
import torch

# Charger le modèle de base
pipe = StableDiffusionPipeline.from_pretrained(base_model_path)

# Configurer LoRA
lora_config = LoraConfig(
    r=lora_rank,
    lora_alpha=lora_alpha,
    target_modules=["to_q", "to_v"],
)

# Appliquer LoRA
model = get_peft_model(pipe.unet, lora_config)

# Boucle d'entraînement
optimizer = torch.optim.AdamW(model.parameters(), lr=learning_rate)

for epoch in range(num_epochs):
    for batch in dataloader:
        loss = model(batch)
        loss.backward()
        optimizer.step()
        optimizer.zero_grad()
        
        # Mettre à jour la progression
        await self.update_progress(...)

# Sauvegarder les poids LoRA
model.save_pretrained(output_dir)
```

### 3. Modifier `jobs.py`

Pour utiliser les vrais modèles entraînés:

```python
from diffusers import StableDiffusionPipeline

async def _run_text_to_image(self, job: JobState):
    model_name = job.params.get("model")
    
    # Charger le modèle depuis la DB
    # Si c'est un modèle entraîné, charger les poids LoRA
    pipe = StableDiffusionPipeline.from_pretrained(model_path)
    
    # Générer les images
    images = pipe(
        prompt=job.params["prompt"],
        num_inference_steps=job.params["steps"],
        guidance_scale=job.params["cfg_scale"]
    ).images
```

## 🐛 Dépannage

### Problème: "No modules named 'sqlalchemy'"

```bash
pip install -r requirements.txt
```

### Problème: Aucun modèle dans le dropdown

```bash
python seed_models.py
```

### Problème: Frontend ne démarre pas

```bash
cd frontend
npm install
npm run dev
```

### Problème: Le modèle entraîné n'apparaît pas

1. Vérifiez que le training job est "completed"
2. Rafraîchissez la page /text-to-image
3. Vérifiez la DB:
```bash
sqlite3 ai_generator.db "SELECT * FROM models WHERE type='lora';"
```

## 📚 Documentation Complète

- `TRAINING_TO_GENERATION_GUIDE.md` - Guide détaillé en français
- `README.md` - Documentation générale du projet
- Code source documenté dans `app/` et `frontend/`

## ✅ Checklist de Vérification

Avant de commencer:

- [ ] Python 3.11+ installé
- [ ] Node.js 18+ installé
- [ ] `pip install -r requirements.txt` exécuté
- [ ] `python seed_models.py` exécuté
- [ ] Backend démarré (port 8000)
- [ ] Frontend démarré (port 3000)
- [ ] Au moins un dataset créé
- [ ] Images uploadées dans le dataset

Après l'entraînement:

- [ ] Job status = "completed"
- [ ] Nouveau modèle visible dans /text-to-image
- [ ] Images peuvent être générées avec le modèle

## 🎉 Résultat Final

Vous avez maintenant un système complet qui:

✅ Permet de créer des datasets personnalisés
✅ Entraîne des modèles LoRA/DreamBooth
✅ Enregistre automatiquement les modèles entraînés
✅ Affiche tous les modèles disponibles dans l'UI
✅ Génère des images avec les modèles sélectionnés

**Le cycle complet: Dataset → Training → Model → Generation fonctionne!** 🚀
