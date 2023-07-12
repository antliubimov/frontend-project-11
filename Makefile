develop:
	npm run serve

install:
	npm ci

build:
	rm -rf public
	NODE_ENV=production npx webpack

test:
	npm test

lint:
	npx eslint .

.PHONY: test
