# 🎨 Mode IA Réel Activé - Guide d'Installation et d'Utilisation

## 🎯 Qu'est-ce qui a changé ?

Le système peut maintenant générer de **vraies images IA** en utilisant Stable Diffusion au lieu de simples images placeholder !

### Avant (Mode Simulation)
- ✗ Images génériques avec texte
- ✗ Ne comprend pas le prompt
- ✓ Rapide, pas besoin de GPU

### Après (Mode IA Réel)
- ✓ Vraies images IA générées
- ✓ Comprend et interprète votre prompt
- ✓ Supporte Stable Diffusion 1.5 et SDXL
- ⚠ Nécessite installation de dépendances (~4GB)

## 📦 Installation des Dépendances IA

### Option 1: Script Automatique (Recommandé)

```bash
# Exécuter le script d'installation
python setup_ai.py
```

Le script va:
1. Détecter si vous avez un GPU NVIDIA
2. Installer PyTorch (CPU ou GPU selon votre matériel)
3. Installer Diffusers, Transformers et autres librairies
4. Tester l'installation

### Option 2: Installation Manuelle

**Pour CPU (pas de GPU NVIDIA):**
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install diffusers transformers accelerate safetensors peft compel
```

**Pour GPU (avec NVIDIA CUDA):**
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
pip install diffusers transformers accelerate safetensors peft compel
```

### Vérifier l'Installation

```bash
python setup_ai.py --test
```

Ou manuellement:
```python
import torch
print(f"PyTorch: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")

import diffusers
print(f"Diffusers: {diffusers.__version__}")
```

## 🚀 Utilisation

### 1. Démarrer le Backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Démarrer le Frontend

```bash
cd frontend
npm run dev
```

### 3. Générer des Images

1. Allez sur `http://localhost:3000/text-to-image`
2. Sélectionnez un modèle:
   - **Stable Diffusion 1.5** - Rapide, 512x512
   - **Stable Diffusion XL** - Haute qualité, 1024x1024
3. Entrez votre prompt (ex: "a beautiful sunset over mountains")
4. Cliquez sur "Générer des Images"

**Premier lancement:** Le modèle sera téléchargé (~4GB pour SD 1.5, ~7GB pour SDXL). Cela peut prendre quelques minutes.

## 💡 Exemples de Prompts

### Portraits
```
portrait of a woman with blue hair, detailed face, cinematic lighting, 8k
```

### Paysages
```
beautiful landscape, mountains, sunset, dramatic clouds, photorealistic
```

### Style Anime
```
anime girl with green eyes, smiling, studio lighting, high quality, detailed
```

### Art Conceptuel
```
futuristic city, neon lights, cyberpunk style, detailed architecture
```

## ⚙️ Configuration Avancée

### Paramètres de Génération

Dans le code (`app/jobs.py`), vous pouvez ajuster:

```python
images = generator.generate_images(
    prompt="your prompt",
    num_inference_steps=30,    # Plus = meilleur qualité (20-50)
    guidance_scale=7.5,         # Force du prompt (7-12)
    width=512,                  # Largeur (multiple de 8)
    height=512,                 # Hauteur (multiple de 8)
    scheduler="ddim",           # "ddim", "dpm", "euler"
    seed=42,                    # Pour résultats reproductibles
)
```

### Optimisation Mémoire (GPU)

Le code active automatiquement:
- **Attention Slicing** - Réduit l'utilisation VRAM
- **xFormers** (si disponible) - Plus rapide et moins de mémoire

Pour installer xFormers (optionnel):
```bash
pip install xformers
```

### Utiliser un Modèle Local

Si vous avez téléchargé un modèle localement:

```python
# Dans ai_generator.py, ajoutez au mapping:
model_mapping = {
    'my-custom-model': '/path/to/local/model',
    # ...
}
```

## 🎨 Modèles Supportés

### Modèles de Base

1. **Stable Diffusion 1.5** (`runwayml/stable-diffusion-v1-5`)
   - Résolution: 512x512
   - Taille: ~4GB
   - Rapide et efficace

2. **Stable Diffusion XL** (`stabilityai/stable-diffusion-xl-base-1.0`)
   - Résolution: 1024x1024
   - Taille: ~7GB
   - Haute qualité, plus lent

### Modèles Entraînés (LoRA)

Les modèles que vous entraînez via `/training` seront automatiquement disponibles dans le dropdown.

**Note:** L'intégration des modèles LoRA personnalisés dans la génération sera implémentée dans une prochaine mise à jour.

## 🔧 Dépannage

### Problème: "ModuleNotFoundError: No module named 'torch'"

**Solution:** Les dépendances IA ne sont pas installées.
```bash
python setup_ai.py
```

### Problème: "CUDA out of memory"

**Solutions:**
1. Réduire la résolution (ex: 512x512 au lieu de 1024x1024)
2. Générer moins d'images à la fois
3. Utiliser CPU au lieu de GPU (plus lent mais pas de limite mémoire)

Pour forcer CPU, modifiez `app/ai_generator.py`:
```python
self.device = "cpu"  # Force CPU
```

### Problème: Génération très lente

**Sur CPU:** C'est normal. Une image peut prendre 2-5 minutes.
**Solutions:**
- Utiliser un GPU NVIDIA
- Réduire `num_inference_steps` à 20
- Utiliser SD 1.5 au lieu de SDXL

### Problème: Le modèle ne se télécharge pas

**Solution:** Vérifier votre connexion Internet et le cache:
```bash
# Voir le répertoire de cache
ls -lh ./models_cache/

# Supprimer le cache si corrompu
rm -rf ./models_cache/
```

## 📊 Performance

### Temps de Génération Typiques

**GPU (NVIDIA RTX 3060):**
- SD 1.5 (512x512): ~3-5 secondes
- SDXL (1024x1024): ~10-15 secondes

**CPU (Intel i7):**
- SD 1.5 (512x512): ~2-3 minutes
- SDXL (1024x1024): ~5-10 minutes

### Utilisation Mémoire

**GPU:**
- SD 1.5: ~4GB VRAM
- SDXL: ~8GB VRAM

**CPU:**
- SD 1.5: ~6GB RAM
- SDXL: ~12GB RAM

## 🎉 Résultat

Vous pouvez maintenant générer de **vraies images IA** qui correspondent réellement à vos prompts !

### Avant
![Placeholder avec texte](docs/before.png)

### Après
![Vraie image IA générée](docs/after.png)

## 📚 Ressources

- [Stable Diffusion Documentation](https://github.com/Stability-AI/stablediffusion)
- [Diffusers Library](https://huggingface.co/docs/diffusers)
- [Prompt Engineering Guide](https://prompthero.com/stable-diffusion-prompt-guide)

## 🔄 Retour au Mode Simulation

Si vous voulez revenir au mode simulation (sans IA):

```bash
pip uninstall torch torchvision diffusers transformers
```

Le système détectera automatiquement l'absence des librairies et utilisera les placeholders.

---

**Bon génération d'images !** 🎨✨
