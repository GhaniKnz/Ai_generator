# Guide d'Activation du Mode IA Réel

## Vue d'Ensemble

Le système a été mis à jour pour utiliser de vrais modèles d'IA (Stable Diffusion) au lieu de la génération simulée. Les images générées seront maintenant de vraies créations d'IA basées sur vos prompts.

## Configuration Requise

### Matériel Recommandé
- **GPU NVIDIA** avec au moins 6 GB de VRAM (recommandé pour performance)
- **RAM**: Minimum 16 GB
- **Espace Disque**: Au moins 10 GB pour les modèles

### Matériel Minimum (CPU)
- Le système peut fonctionner sur CPU mais sera **beaucoup plus lent**
- **RAM**: Minimum 8 GB
- Temps de génération: 2-5 minutes par image au lieu de quelques secondes

## Installation

### Étape 1: Installer les Dépendances IA

```bash
# Activer l'environnement virtuel
source .venv/bin/activate  # Linux/Mac
# ou .venv\Scripts\activate  # Windows

# Installer PyTorch (choisir la version selon votre système)

# Pour GPU NVIDIA (CUDA):
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118

# Pour CPU uniquement:
pip install torch torchvision

# Installer les bibliothèques de diffusion
pip install diffusers transformers accelerate peft safetensors

# Installer les utilitaires
pip install compel opencv-python imageio imageio-ffmpeg

# OU installer tout depuis requirements.txt:
pip install -r requirements.txt
```

### Étape 2: Vérifier l'Installation

```bash
python3 -c "import torch; print('CUDA disponible:', torch.cuda.is_available()); print('Device:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU')"
```

Résultat attendu:
- Avec GPU: `CUDA disponible: True` + nom de votre GPU
- Sans GPU: `CUDA disponible: False` + `Device: CPU`

### Étape 3: Configuration (Optionnel)

Créer un fichier `.env` à la racine du projet:

```bash
# Active le mode IA réel (True par défaut)
USE_REAL_AI=true

# Répertoire pour mettre en cache les modèles téléchargés
MODELS_CACHE_DIR=./models_cache
```

### Étape 4: Premier Démarrage

Au premier lancement, le système téléchargera automatiquement les modèles Stable Diffusion (~4-5 GB). Cela peut prendre 10-30 minutes selon votre connexion.

```bash
# Démarrer le backend
uvicorn app.main:app --reload --port 8000

# Le premier message de génération déclenchera le téléchargement
# Surveillez les logs: "Downloading model..."
```

## Utilisation

### Génération d'Images

1. Allez sur `http://localhost:3000/text-to-image`
2. Entrez votre prompt (description de l'image souhaitée)
3. Sélectionnez le modèle (stable-diffusion-1.5 recommandé pour commencer)
4. Choisissez le nombre d'images (1-8)
5. Cliquez sur "Générer des Images"
6. **Première génération**: Attendez 10-30 minutes (téléchargement du modèle)
7. **Générations suivantes**: 5-30 secondes selon votre GPU

### Exemples de Prompts

**Bon prompts (détaillés):**
```
"A majestic lion with a golden mane, standing on a rocky cliff at sunset, photorealistic, 4k, highly detailed"

"A futuristic cyberpunk city at night, neon lights, flying cars, rain-soaked streets, cinematic lighting"

"A cozy cottage in a magical forest, mushrooms, fireflies, fantasy art style, vibrant colors"
```

**Prompts à éviter (trop vagues):**
```
"un chat"  # Trop simple
"quelque chose de beau"  # Pas assez précis
```

### Paramètres Recommandés

| Paramètre | Valeur Recommandée | Description |
|-----------|-------------------|-------------|
| **Steps** | 30-50 | Plus = meilleure qualité mais plus lent |
| **CFG Scale** | 7-9 | Comment strictement suivre le prompt |
| **Width/Height** | 512x512 | Plus petit = plus rapide |
| **Nombre d'images** | 1-2 | Pour tester rapidement |

### Pour GPU Faible (< 6 GB VRAM)

Si vous rencontrez des erreurs de mémoire:

1. Réduisez la résolution: 512x512 ou même 384x384
2. Générez 1 image à la fois
3. Réduisez le nombre de steps à 20-30

## Modèles Disponibles

### Modèles Pré-installés

1. **stable-diffusion-1.5** (Recommandé pour commencer)
   - Modèle: runwayml/stable-diffusion-v1-5
   - Taille: ~4 GB
   - Rapide et fiable

2. **stable-diffusion-xl** (SDXL)
   - Modèle: stabilityai/stable-diffusion-xl-base-1.0
   - Taille: ~6.9 GB
   - Meilleure qualité mais plus lent
   - Nécessite plus de VRAM

### Modèles Personnalisés

Vos modèles entraînés (LoRA) apparaîtront automatiquement dans la liste après l'entraînement.

## Dépannage

### Problème: "CUDA out of memory"

**Solution:**
- Réduire la résolution de l'image
- Générer moins d'images à la fois
- Fermer les autres applications utilisant le GPU
- Ajouter dans le code (ai_generator.py):
  ```python
  pipeline.enable_sequential_cpu_offload()
  ```

### Problème: "Model download is very slow"

**Solution:**
- Vérifier votre connexion Internet
- Le téléchargement ne se fait qu'une fois
- Les modèles sont mis en cache dans `./models_cache`

### Problème: "Generation is too slow on CPU"

**Solution:**
- C'est normal sur CPU (2-5 minutes par image)
- Considérer:
  - Réduire steps à 20
  - Utiliser résolution 384x384
  - Générer 1 image à la fois
  - Ou investir dans un GPU

### Problème: "Images are blurry or low quality"

**Solution:**
- Augmenter le nombre de steps (50-100)
- Utiliser un prompt plus détaillé
- Augmenter CFG Scale (7.5-9)
- Essayer SDXL pour meilleure qualité

## Basculer entre Mode Réel et Mode Mock

Pour revenir au mode simulation (utile pour les tests):

**Option 1: Fichier .env**
```bash
USE_REAL_AI=false
```

**Option 2: Code**
Dans `app/config.py`:
```python
use_real_ai: bool = Field(default=False)  # Changer True -> False
```

Redémarrer le serveur après modification.

## Performance Attendue

### Avec GPU NVIDIA (6+ GB VRAM)
- Première image: 10-30 min (téléchargement)
- Images suivantes: 5-15 secondes
- 4 images: 20-60 secondes

### Sans GPU (CPU)
- Première image: 10-30 min (téléchargement)
- Images suivantes: 2-5 minutes **par image**
- 4 images: 8-20 minutes

## Ressources Supplémentaires

- **Hugging Face Models**: https://huggingface.co/models?pipeline_tag=text-to-image
- **Diffusers Documentation**: https://huggingface.co/docs/diffusers
- **Stable Diffusion Guide**: https://stable-diffusion-art.com/

## Support

Si vous rencontrez des problèmes:

1. Vérifiez les logs du serveur backend
2. Vérifiez que PyTorch détecte votre GPU: `torch.cuda.is_available()`
3. Vérifiez l'espace disque disponible (modèles = ~10 GB)
4. Consultez les messages d'erreur dans la console

---

**Le mode IA réel est maintenant activé par défaut!** 🎨✨

Testez avec un prompt simple comme: "A beautiful sunset over mountains, oil painting style"
