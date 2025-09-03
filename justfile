default:
    parallel -j 2 just ::: serve watch

serve:
    cp index.html dist
    live-server dist

serve-esbuild:
    cp index.html dist
    esbuild --minify --bundle src/main.ts --outdir=dist --watch --serve --servedir=dist

watch:
    esbuild --bundle src/main.ts --outdir=dist --format=esm --watch=forever --sourcemap

build:
    esbuild --minify --bundle src/main.ts --outdir=dist --format=esm

zip: build
    advzip pack.zip -a dist/index.html dist/main.js

linecount:
    find src/ -name '*.ts' | xargs wc -lc