# Push to GitHub - Quick Guide

## Option 1: Using Personal Access Token (Recommended)

1. **Generate a Personal Access Token:**
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Give it a name: "KonnectHere Deployment"
   - Select scopes: `repo` (full control of private repositories)
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again!)

2. **Push using the token:**
   ```bash
   git push -u origin main
   ```
   - When prompted for username: Enter `YAGNESHPALLERLA`
   - When prompted for password: **Paste your Personal Access Token** (not your GitHub password)

## Option 2: Using SSH (More Secure)

1. **Generate SSH key (if you don't have one):**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **Add SSH key to GitHub:**
   - Copy your public key: `cat ~/.ssh/id_ed25519.pub`
   - Go to GitHub → Settings → SSH and GPG keys → New SSH key
   - Paste your public key and save

3. **Change remote to SSH:**
   ```bash
   git remote set-url origin git@github.com:YAGNESHPALLERLA/konnecthere.git
   ```

4. **Push:**
   ```bash
   git push -u origin main
   ```

## Option 3: GitHub CLI

```bash
# Install GitHub CLI (if not installed)
# Then authenticate:
gh auth login

# Push:
git push -u origin main
```

---

## Quick Push Command

Once authenticated, simply run:

```bash
cd /home/dragon/konnecthere
git push -u origin main
```

---

## Verify Push

After pushing, check your repository:
https://github.com/YAGNESHPALLERLA/konnecthere

You should see all your files there!

