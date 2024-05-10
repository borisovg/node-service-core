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
	$(NPM_BIN)/prettier --check 'src/**/*.{js,ts,json,md,yml}'
	$(NPM_BIN)/eslint src/ --max-warnings 0

node_modules: package.json
	$(NPM) install || (rm -rf node_modules; exit 1)
	test -d $@ && touch $@ || true

.PHONY: test
test: dist
	$(NPM_BIN)/c8 --reporter=none $(NPM_BIN)/ts-mocha -b 'src/**/*.test.ts' \
		&& $(NPM_BIN)/c8 report --all --clean -n src -x 'src/**/*.test.ts' -x 'src/types.*' --reporter=text
