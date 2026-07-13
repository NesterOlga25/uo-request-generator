.PHONY: dev build lint lint-md format format-check typecheck test check

dev:
	pnpm dev

build:
	pnpm build

lint:
	pnpm lint

lint-md:
	pnpm lint:md

format:
	pnpm format

format-check:
	pnpm format:check

typecheck:
	pnpm typecheck

test:
	pnpm test

check:
	pnpm check
