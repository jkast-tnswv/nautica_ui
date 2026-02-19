#!/usr/bin/env bash
#
# dev-backend.sh — Build and run Nautica backend services locally via Bazel
#
# Envoy runs in Docker (docker-compose.dev.yml), this script just runs
# the gRPC services on the host so Envoy can reach them.
#
# NOTE: Ocean and Shipwright both bind to port 65505 in twcode. They
# cannot run simultaneously without changing one. Use --only to pick:
#
#   ./scripts/dev-backend.sh --only ocean,harbor
#   ./scripts/dev-backend.sh --only shipwright,harbor
#
# Prerequisites:
#   brew install bazelisk
#
# Usage:
#   ./scripts/dev-backend.sh                        # build + run all
#   ./scripts/dev-backend.sh --skip-build           # run previously built binaries
#   ./scripts/dev-backend.sh --only shipwright,harbor
#
set -euo pipefail

# ── Paths ──────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NAUTICA_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TWCODE_DIR="$(cd "$NAUTICA_DIR/../twcode" && pwd 2>/dev/null)" || {
  echo "ERROR: twcode repo not found at $NAUTICA_DIR/../twcode"
  echo "       Clone it alongside nautica_ui:"
  echo "         git clone <twcode-repo> $NAUTICA_DIR/../twcode"
  exit 1
}

BAZEL="${BAZEL:-$(command -v bazel || command -v bazelisk || echo /opt/homebrew/bin/bazel)}"

# ── Colors ─────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

# ── Parse args ────────────────────────────────────────────────────────
SKIP_BUILD=false
ONLY=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-build) SKIP_BUILD=true; shift ;;
    --only) ONLY="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

should_run() {
  [[ -z "$ONLY" ]] || [[ ",$ONLY," == *",$1,"* ]]
}

# ── Dependency check ──────────────────────────────────────────────────
check_deps() {
  if ! command -v "$BAZEL" &>/dev/null; then
    echo -e "${RED}Missing: bazel (brew install bazelisk)${NC}"
    exit 1
  fi
}

# ── Build ─────────────────────────────────────────────────────────────
build_services() {
  local targets=()
  should_run ocean      && targets+=(//ocean:ocean_server_bin_rs)
  should_run shipwright && targets+=(//shipwright:shipwright_server_bin_rs)
  should_run harbor     && targets+=(//harbor:harbor_server_bin_rs)

  if [ ${#targets[@]} -eq 0 ]; then
    echo -e "${RED}No services selected.${NC}"
    exit 1
  fi

  echo -e "${CYAN}Building services with Bazel...${NC}"
  cd "$TWCODE_DIR"
  "$BAZEL" build "${targets[@]}"
  echo -e "${GREEN}Build complete.${NC}"
}

# ── PID tracking for cleanup ──────────────────────────────────────────
PIDS=()

cleanup() {
  echo ""
  echo -e "${YELLOW}Shutting down all services...${NC}"
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null
  echo -e "${GREEN}All services stopped.${NC}"
}
trap cleanup EXIT INT TERM

# ── Run a service in background ───────────────────────────────────────
run_service() {
  local name="$1" binary="$2" port="$3"
  if [[ ! -x "$binary" ]]; then
    echo -e "${RED}Binary not found: $binary${NC}"
    echo "Run without --skip-build to build first."
    exit 1
  fi
  echo -e "  ${BOLD}$name${NC} → 127.0.0.1:${port}"
  "$binary" &
  PIDS+=($!)
}

# ── Main ──────────────────────────────────────────────────────────────
main() {
  check_deps

  # Warn about port collision
  if should_run ocean && should_run shipwright; then
    echo -e "${YELLOW}WARNING: Ocean and Shipwright both bind to port 65505.${NC}"
    echo -e "${YELLOW}         One will fail to start. Use --only ocean,harbor or --only shipwright,harbor${NC}"
    echo ""
  fi

  if [[ "$SKIP_BUILD" == false ]]; then
    build_services
  fi

  # Resolve built binary paths
  local ocean_bin="$TWCODE_DIR/bazel-bin/ocean/ocean_server_bin_rs"
  local shipwright_bin="$TWCODE_DIR/bazel-bin/shipwright/shipwright_server_bin_rs"
  local harbor_bin="$TWCODE_DIR/bazel-bin/harbor/harbor_server_bin_rs"

  echo ""
  echo -e "${CYAN}Starting services:${NC}"

  should_run shipwright && run_service "Shipwright" "$shipwright_bin" 65505
  should_run harbor     && run_service "Harbor"     "$harbor_bin"     65506
  should_run ocean      && run_service "Ocean"      "$ocean_bin"      65505

  echo ""
  echo -e "${GREEN}${BOLD}All services running.${NC}"
  echo -e "Envoy proxy (Docker):  ${BOLD}http://localhost:8080${NC}"
  echo -e "Press ${BOLD}Ctrl+C${NC} to stop all services."
  echo ""

  # Wait for any child to exit (indicates a crash)
  wait -n 2>/dev/null || true
  echo -e "${RED}A service exited unexpectedly. Shutting down...${NC}"
}

main "$@"
