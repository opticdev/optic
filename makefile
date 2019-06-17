domain:
	@echo "building domain..."
	cd ./domain && sbt publishLocal
domain-js:
	@echo "building domain..."
	cd ./domain && sh package.sh

.PHONY: domain

webapp:
	@echo "building webapp"
	make domain-js
	cd ./webapp && npm run build

.PHONY: webapp

all:
	@echo "building webapp"
	make domain
	make domain-js
	make webapp

.PHONY: all
