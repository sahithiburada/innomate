# 📘 Innomate – Team Git Workflow

This document defines how our team uses Git and GitHub to collaborate smoothly
and avoid conflicts.

---

## 🌿 Branches

- `main` – Stable production branch (final working code only)
- `sahithi` – Sahithi’s working branch
- `sairam` – Sai Ram’s working branch
- `rashmitha` – Rashmitha’s working branch

---

## 📌 Rules

- ❌ No direct commits to `main`
- ✅ Everyone works only on their own branch
- 🔄 Always pull from `main` before starting work
- 🧩 Commit small and meaningful changes
- 🧑‍💻 Repo manager handles merging into `main`

---

## 🔁 Daily Workflow

1. Switch to your branch:
   ```bash
   git checkout <your-name>
2. Sync with the latest main branch:
   git pull origin main
3. Work on your code.
4. Stage changes:
    git add .
5. Commit with a clear message:
    git commit -m "Clear description of the change"
6. Push your branch to GitHub:
   git push origin <your-name>

##  Merging Process
Merge only after the feature works correctly

Use Pull Requests on GitHub

Repo manager reviews and merges into main

After merging, inform the team to pull the latest changes

## Important Notes
Never work directly on main

Avoid working on the same file at the same time

If Git shows an error, do not panic — ask for help

Run git status whenever you’re unsure

