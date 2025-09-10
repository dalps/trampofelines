default:
    parallel -j 2 just ::: serve watch

serve:
    live-server dist

watch:
    esbuild --bundle --loader:.html=copy --entry-names='[name]' --outdir=dist --format=esm --watch=forever --sourcemap index.html src/main.ts

build:
    esbuild --minify --bundle --loader:.html=copy --entry-names='[name]' --outdir=dist --format=esm index.html src/main.ts

zip: clean build
    mkdir -p tmp tmp/src
    roadroller dist/src/main.js -o tmp/src/main.js
    advzip pack.zip -a tmp/* dist/index.html
    rm -rf tmp/
    stat pack.zip

closure:
    google-closure-compiler --js=dist/src/main.js --compilation_level ADVANCED --js_output_file=dist/out.js

unzip:
    unzip pack.zip -d game

clean:
    rm -rf ./dist ./pack.zip ./game

linecount:
    find src/ -name '*.ts' | xargs wc -lc
