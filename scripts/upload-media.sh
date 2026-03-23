#!/bin/bash
# Upload MP3s et covers vers jocha-music.fly.dev via l'API admin

BASE_URL="https://jocha-music.fly.dev"
PASSWORD="${1:-JochaAdmin2026!}"
COOKIE_FILE="/tmp/jocha_cookies.txt"
AUDIO_DIR="/home/jocha/Musique"
COVERS_DIR="$(dirname "$0")/../public/covers"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}══════════════════════════════════════${NC}"
echo -e "${CYAN}  Upload média → jocha-music.fly.dev  ${NC}"
echo -e "${CYAN}══════════════════════════════════════${NC}"

# 1. Login admin
echo -e "\n${YELLOW}→ Connexion admin...${NC}"
LOGIN=$(curl -s -c "$COOKIE_FILE" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"password\": \"$PASSWORD\"}")

if echo "$LOGIN" | grep -q '"ok"'; then
  echo -e "${GREEN}✓ Connecté${NC}"
else
  echo -e "${RED}✗ Erreur login : $LOGIN${NC}"
  exit 1
fi

# Fonction d'upload par batch
upload_batch() {
  local -a files=("$@")
  local endpoint="$BASE_URL/api/audio/upload"
  local args=()
  for f in "${files[@]}"; do
    args+=(-F "files=@${f}")
  done
  curl -s --retry 3 --retry-delay 5 --max-time 120 -b "$COOKIE_FILE" -X POST "$endpoint" "${args[@]}" || echo '{"results":[]}'
}

# Fonction d'upload covers
upload_cover() {
  local file="$1"
  local filename=$(basename "$file")
  # Utilise l'endpoint audio mais pour covers — on va créer un endpoint générique
  # Pour l'instant on skip les covers et on les upload via sftp séparément
  echo "$filename"
}

# 2. Upload MP3s
echo -e "\n${YELLOW}→ Upload des MP3 (134 fichiers, ~1GB)...${NC}"
TOTAL_MP3=$(ls "$AUDIO_DIR"/*.mp3 | wc -l)
DONE=0
FAILED=0
BATCH_SIZE=1
PROGRESS_FILE="/tmp/jocha_upload_progress.txt"

# Reprendre depuis la dernière position si le fichier existe
START_INDEX=0
if [ -f "$PROGRESS_FILE" ]; then
  START_INDEX=$(cat "$PROGRESS_FILE")
  DONE=$START_INDEX
  echo -e "${YELLOW}→ Reprise depuis le fichier ${START_INDEX}/${TOTAL_MP3}${NC}"
fi

mapfile -t ALL_MP3 < <(ls "$AUDIO_DIR"/*.mp3)

for ((i=START_INDEX; i<${#ALL_MP3[@]}; i+=BATCH_SIZE)); do
  BATCH=("${ALL_MP3[@]:$i:$BATCH_SIZE}")
  NAMES=""
  for f in "${BATCH[@]}"; do NAMES+=" $(basename "$f")"; done

  RESULT=$(upload_batch "${BATCH[@]}")
  OK=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(sum(1 for r in d.get('results',[]) if r.get('ok')))" 2>/dev/null || echo "?")

  DONE=$((DONE + ${#BATCH[@]}))
  echo $DONE > "$PROGRESS_FILE"
  PCT=$((DONE * 100 / TOTAL_MP3))

  # Barre de progression
  BAR_FILLED=$((PCT / 5))
  BAR_EMPTY=$((20 - BAR_FILLED))
  BAR=$(printf '%0.s█' $(seq 1 $BAR_FILLED))$(printf '%0.s░' $(seq 1 $BAR_EMPTY))

  echo -ne "\r  [${BAR}] ${PCT}% — ${DONE}/${TOTAL_MP3}"
done

rm -f "$PROGRESS_FILE"
echo -e "\n${GREEN}✓ MP3 uploadés${NC}"

# 3. Upload covers via sftp (plus rapide pour les images)
echo -e "\n${YELLOW}→ Upload des covers via SFTP...${NC}"
export PATH="/home/jocha/.fly/bin:$PATH"

SFTP_CMDS=""
SFTP_CMDS+="mkdir /data/covers\n"
for f in "$COVERS_DIR"/*.jpg "$COVERS_DIR"/*.png "$COVERS_DIR"/*.webp; do
  [ -f "$f" ] || continue
  SFTP_CMDS+="put \"$f\" /data/covers/$(basename "$f")\n"
done
SFTP_CMDS+="exit\n"

echo -e "$SFTP_CMDS" | flyctl sftp shell --app jocha-music 2>/dev/null && \
  echo -e "${GREEN}✓ Covers uploadées${NC}" || \
  echo -e "${YELLOW}⚠ SFTP covers : vérifier manuellement${NC}"

echo -e "\n${GREEN}══════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ Upload terminé !               ${NC}"
echo -e "${GREEN}  🌐 https://jocha-music.fly.dev   ${NC}"
echo -e "${GREEN}══════════════════════════════════${NC}"
