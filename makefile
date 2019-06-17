domain:
	@echo "building domain..."
	cd ./domain && sbt publishLocal

.PHONY: domain

domain-js:
	@echo "building domain..."
	cd ./domain && sh package.sh

.PHONY: domain-js

oas:
	@echo "building oas..."
	cd ./oas && sbt publishLocal

.PHONY: oas

webapp:
	@echo "building webapp"
	make domain-js
	cd ./webapp && npm run build

.PHONY: webapp

all:
	@echo "building webapp"
	make domain
	make domain-js
	make oas
	make webapp

.PHONY: all
