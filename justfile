default:
    parallel -j 2 just ::: serve watch

serve:
    live-server dist

watch:
    esbuild --bundle --loader:.html=copy --entry-names='[name]' --outdir=dist --format=esm --watch=forever --sourcemap index.html src/main.ts

build:
    esbuild --minify --bundle --entry-names='[name]' --outdir=dist --format=esm src/main.ts
    just minify-html

zip: clean build
    mkdir -p tmp
    roadroller dist/main.js -o tmp/main.js
    advzip pack.zip -a tmp/main.js dist/index.html
    rm -rf tmp/
    stat pack.zip

closure:
    google-closure-compiler --js=dist/main.js --compilation_level ADVANCED --js_output_file=dist/out.js

minify-html:
    html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true index.html -o dist/index.html

unzip:
    unzip pack.zip -d game

clean:
    rm -rf ./dist ./pack.zip ./game

linecount:
    find src/ -name '*.ts' | xargs wc -lc
