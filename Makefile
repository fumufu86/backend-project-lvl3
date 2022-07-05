install: install-deps
	npx simple-git-hooks

install-deps:
	npm ci

lint:
	npx eslint .
test:
	npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8
debug:
	DEBUG=page-loader,axios,nock.* npm test
debug_axios:
	DEBUG=axios npm test
debug_nock:
	DEBUG=nock.* npm test

.PHONY: test
