NPM := pnpm
NPM_BIN := ./node_modules/.bin
NPM_LOCK := pnpm-lock.yaml
TS_CONFIGS := tsconfig.json tsconfig-build.json
TS_FILES := $(shell find src/ -name '*.ts')

all: dist

.PHONY: clean
clean:
	rm -rf coverage dist node_modules $(NPM_LOCK)

dist: node_modules $(TS_FILES) $(TS_CONFIGS) Makefile
	rm -rf $@
	$(NPM_BIN)/tsc -p tsconfig-build.json

.PHONY: lint
lint: node_modules
	$(NPM_BIN)/biome check --write --error-on-warnings

node_modules: package.json
	$(NPM) install || (rm -rf $@; exit 1)
	test -d $@ && touch $@ || true

.PHONY: test
test: dist
	$(NPM_BIN)/vitest run --coverage --bail 1
