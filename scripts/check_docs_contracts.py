#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]

REQUIRED_FILES = [
    'README.md',
    'CHANGELOG.md',
    'CONTRIBUTING.md',
    'docs/SPECIFICATION.md',
    'docs/IMPLEMENTATION_STATUS.md',
    'docs/DEV_PLAN_SHORT_TERM.md',
    'docs/TEST_PLAN.md',
    'docs/ARCHITECTURE.md',
    'docs/CONTRACT_INDEX.md',
    'docs/contracts/STACK_CONTRACT.md',
    'docs/contracts/BRANCH_INTEGRATION_CONTRACT.md',
    'docs/contracts/FRONTEND_CONTRACT.md',
    'docs/contracts/ROUTE_CONTRACT.md',
    'docs/contracts/API_CONTRACT.md',
    'docs/contracts/AUTH_CONTRACT.md',
    'docs/contracts/DATABASE_CONTRACT.md',
    'docs/contracts/ERROR_CONTRACT.md',
    'docs/contracts/ENV_DOCKER_CONTRACT.md',
    'docs/contracts/SECURITY_CONTRACT.md',
    'docs/dev-plans/DEV_PLAN_PHASE_0_CONTRACT_BASELINE.md',
    'docs/dev-plans/DEV_PLAN_PHASE_1_FRONTEND_STABILIZATION.md',
    'docs/dev-plans/DEV_PLAN_PHASE_2_FEATURE_MODULARIZATION_ROUTING.md',
    'docs/dev-plans/DEV_PLAN_PHASE_3_API_BACKEND_FOUNDATION.md',
    'docs/dev-plans/DEV_PLAN_PHASE_4_DATA_MIGRATION_FINAL_DOCS.md',
    'docs/reviews/CODE_QUALITY_REVIEW.md',
    'examples/api/response-envelope.examples.json',
]


def main() -> int:
    missing = []
    empty = []

    for rel in REQUIRED_FILES:
        path = ROOT / rel
        if not path.exists():
            missing.append(rel)
            continue
        if path.is_file() and path.stat().st_size == 0:
            empty.append(rel)

    if missing or empty:
        print('Documentation contract check failed.')
        if missing:
            print('\nMissing files:')
            for item in missing:
                print(f'  - {item}')
        if empty:
            print('\nEmpty files:')
            for item in empty:
                print(f'  - {item}')
        return 1

    print('Documentation contract check passed.')
    print(f'Checked {len(REQUIRED_FILES)} files.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
