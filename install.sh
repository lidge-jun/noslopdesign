#!/usr/bin/env bash
# Symlink the noslopdesign skills into agent skill directories.
#
# Links instead of copying, so `git pull` updates the installed skills in place. Install both
# skills: noslop-uiux reads its work sizes and rule classes from noslop-frontend.
#
#   ./install.sh                 # link both skills into Claude Code (~/.claude/skills)
#   ./install.sh --codex         # ... into Codex (~/.codex/skills)
#   ./install.sh --all-agents    # ... into both
#   ./install.sh --list          # show install names
#   ./install.sh --uninstall     # remove links that point at this repo
#
# The link-ownership helpers follow Leonxlnx/taste-skill's install.sh (MIT).

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$REPO/skills"
targets=()
mode=install

while [[ $# -gt 0 ]]; do
  case "$1" in
    --claude)     targets+=("$HOME/.claude/skills") ;;
    --codex)      targets+=("$HOME/.codex/skills") ;;
    --all-agents) targets+=("$HOME/.claude/skills" "$HOME/.codex/skills") ;;
    --list)       mode=list ;;
    --uninstall)  mode=uninstall ;;
    -h|--help)    awk 'NR>1 { if ($0 !~ /^#/) exit; sub(/^# ?/, ""); print }' "${BASH_SOURCE[0]}"; exit 0 ;;
    *)            echo "unknown argument: $1" >&2; exit 2 ;;
  esac
  shift
done
[[ ${#targets[@]} -eq 0 ]] && targets=("$HOME/.claude/skills")

# resolve_link <symlink>: absolute target, with relative targets resolved against the link's directory
resolve_link() {
  local t d b
  t="$(readlink "$1")" || return 1
  [[ $t == /* ]] || t="$(dirname "$1")/$t"
  d="$(cd "$(dirname "$t")" 2>/dev/null && pwd)" || return 1
  b="$(basename "$t")"
  printf '%s/%s\n' "${d%/}" "$b"
}

# owned_by_repo <symlink>: true if it resolves into this repo's skills/
owned_by_repo() {
  local r
  r="$(resolve_link "$1")" || return 1
  [[ $r == "$SKILLS_DIR"/* ]]
}

if [[ $mode == uninstall ]]; then
  for target in "${targets[@]}"; do
    [[ -d $target ]] || continue
    for link in "$target"/*; do
      if [[ -L $link ]] && owned_by_repo "$link"; then rm "$link"; echo "removed  $link"; fi
    done
  done
  exit 0
fi

for dir in "$SKILLS_DIR"/*/; do
  dir="${dir%/}"
  name="$(basename "$dir")"
  [[ -f $dir/SKILL.md ]] || continue
  if [[ $mode == list ]]; then echo "$name"; continue; fi
  for target in "${targets[@]}"; do
    mkdir -p "$target"
    link="$target/$name"
    if [[ -L $link ]]; then
      if owned_by_repo "$link"; then rm "$link"; else echo "skip     $link (links elsewhere; remove it first)" >&2; continue; fi
    elif [[ -e $link ]]; then
      echo "skip     $link (a real folder; move it aside first)" >&2; continue
    fi
    ln -s "$dir" "$link"
    echo "linked   $link -> skills/$name"
  done
done
