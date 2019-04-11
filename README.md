# island-build
This project is to support automated build and testing environment for usual nodejs applications.
This is originated from island-build project.

# Commands
## gulp clean
rm -rf node_modules, dist, coverage directories

## gulp watch
watch src/**/*.ts files and compile

## gulp coverage
compile typescript
run jasmine dist/spec/*.spec.js
create coverage reports with istanbul

## gulp integration (gulp integration-test)
compile typescript
run jasmine dist/integration/*.spec.js

## gulp test
compile typescript
run jasmine dist/spec/*.spec.js

## gulp token.spec
replace 'token' to spec file name
compile typescript
run jasmine dist/spec/token.spec.js
watch src/**/*.ts and continuously test til break

## gulp start
compile typescript
run jasmine dist/spec/*.spec.js
run node dist/app.js
watch src/**/*.ts and continuously execute gulp start

## gulp sleep
sleep -c 86400 * 10 * 1000
keep docker alive lol
