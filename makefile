domain:
	@echo "building domain..."
	cd ./domain && sbt publishLocal

.PHONY: domain

domain-js:
	@echo "building domain..."
	cd ./domain && npm run build

.PHONY: domain-js

editor-local:
	@echo "building local editor..."
	cd ./webapp && yarn build-local
	rm -rf ./api-cli/resources/react
	cp -R ./webapp/build ./api-cli/resources/react

.PHONY: editor-local

oas:
	@echo "building oas..."
	cd ./oas && sbt publishLocal

.PHONY: oas

webapp:
	@echo "building webapp"
	make domain-js
	cd ./webapp && yarn install
	cd ./webapp && yarn build

.PHONY: webapp

all:
	@echo "building webapp"
	make domain
	make oas
	make webapp

.PHONY: all
