default:
    parallel -j 2 just ::: serve watch

serve:
    live-server dist

watch:
    esbuild --bundle --loader:.html=copy --entry-names='[name]' --outdir=dist --format=esm --watch=forever --sourcemap index.html src/main.ts

build: minify-html
    esbuild --bundle --minify --entry-names='[name]' --outdir=dist --format=esm --sourcemap src/main.ts

closure: build
    mkdir -p tmp
    google-closure-compiler --js=dist/main.js -W QUIET -O ADVANCED --js_output_file=tmp/main.js
    cp tmp/main.js dist

zip: clean build
    mkdir -p tmp
    roadroller dist/main.js -o tmp/main.js
    advzip pack.zip -a tmp/main.js dist/index.html
    stat pack.zip

minify-html:
    mkdir -p dist
    html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true index.html -o dist/index.html

unzip:
    unzip pack.zip -d game
    live-server game/

clean:
    rm -rf ./tmp ./dist ./pack.zip ./game

linecount:
    find src/ -name '*.ts' | xargs wc -lc
