# Guide de Démarrage Rapide - Mode IA Réel

## ⚡ Installation Express (5 minutes)

### Étape 1: Installer PyTorch

**Choisir selon votre système:**

```bash
# Option A: Avec GPU NVIDIA (Recommandé)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118

# Option B: Sans GPU (CPU uniquement)
pip install torch torchvision
```

### Étape 2: Installer Diffusers

```bash
pip install diffusers transformers accelerate
```

### Étape 3: Vérifier l'installation

```bash
python3 setup_ai.py
```

Vous devriez voir:
```
✅ PyTorch version: X.X.X
✅ CUDA available: [Votre GPU] OU ⚠️ GPU not detected
✅ Diffusers version: X.X.X
```

### Étape 4: Démarrer

```bash
# Terminal 1: Backend
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend && npm run dev
```

### Étape 5: Tester

1. Ouvrir http://localhost:3000/text-to-image
2. Entrer: **"A beautiful landscape with mountains and a lake, sunset, oil painting"**
3. Cliquer **"Générer des Images"**
4. Attendre (10-30 min au premier usage pour télécharger le modèle)

## 🎨 Exemples de Prompts

### Bon Prompts (Détaillés)
```
"A majestic castle on a hill, fantasy style, dramatic lighting, highly detailed, 4k"

"Portrait of a cat wearing a suit, professional photography, studio lighting, bokeh background"

"Futuristic city at night, cyberpunk, neon lights, rain, cinematic, wide angle"

"A cozy coffee shop interior, warm lighting, plants, books, peaceful atmosphere"
```

### Paramètres Recommandés

| Situation | Steps | CFG Scale | Résolution |
|-----------|-------|-----------|------------|
| **Test rapide** | 20-30 | 7 | 512x512 |
| **Qualité standard** | 30-50 | 7.5 | 512x512 |
| **Haute qualité** | 50-100 | 8-9 | 768x768 |
| **GPU faible** | 20 | 7 | 384x384 |

## 🔧 Dépannage Rapide

### "CUDA out of memory"
```python
# Réduire résolution: 512x512 → 384x384
# OU générer 1 image au lieu de 4
```

### "Génération très lente"
```
C'est normal:
- GPU: 5-15 secondes
- CPU: 2-5 minutes (normal!)
```

### "Model not found"
```
Le modèle télécharge automatiquement.
Première fois = 10-30 minutes.
```

## 📊 Ce qui a changé

| Avant | Après |
|-------|-------|
| Images avec texte "AI Generated" | Vraies images d'IA |
| Formes aléatoires colorées | Images basées sur votre prompt |
| Génération instantanée | 5-15 sec (GPU) ou 2-5 min (CPU) |
| Pas de téléchargement | ~5 GB de modèles téléchargés |

## ✅ Checklist Rapide

- [ ] PyTorch installé
- [ ] Diffusers installé
- [ ] `python3 setup_ai.py` réussi
- [ ] Backend démarré (port 8000)
- [ ] Frontend démarré (port 3000)
- [ ] Testé avec un prompt simple

## 🆘 Besoin d'Aide?

1. **Vérifier logs backend** - Regarder le terminal où tourne uvicorn
2. **Vérifier GPU**: `python3 -c "import torch; print(torch.cuda.is_available())"`
3. **Espace disque**: Vérifier qu'il reste 10+ GB
4. **Guide complet**: Voir `ACTIVATION_MODE_IA.md`

---

**Prêt à créer de vraies images d'IA! 🎨✨**
