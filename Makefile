NPM := pnpm
NPM_BIN := ./node_modules/.bin
NPM_LOCK := pnpm-lock.yaml
TS_FILES := $(shell find src/ -name '*.ts')

all: dist

.PHONY: clean
clean:
	rm -rf coverage dist node_modules $(NPM_LOCK)

dist: node_modules $(TS_FILES) tsconfig.json Makefile
	rm -rf $@
	$(NPM_BIN)/tsc || rm -rf $@

.PHONY: lint
lint: node_modules
	$(NPM_BIN)/biome check --write --error-on-warnings

node_modules: package.json
	$(NPM) install || (rm -rf node_modules; exit 1)
	test -d $@ && touch $@ || true

.PHONY: test
test: dist
	$(NPM_BIN)/nyc --reporter=text --all --include='src/**/*.ts' --exclude='src/**/*.test.ts' --exclude='src/types.*' \
		$(NPM_BIN)/ts-mocha -b 'src/**/*.test.ts'
